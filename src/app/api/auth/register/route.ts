// =============================================================================
// SL HUB COMPUTER - Customer Registration API
// =============================================================================
// POST: Register a new customer account
// - Validates required fields (name, email, password)
// - Checks for duplicate email
// - Hashes password using crypto (scrypt)
// - Creates Customer record in database
// - Returns customer data (without password)
// Security: Input sanitization, strict email validation, phone validation
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { sanitizeForStorage, validateEmail, validatePhone } from "@/lib/sanitize";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format (strict)
    const emailValidation = validateEmail(String(email));
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneValidation = validatePhone(String(phone));
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { success: false, error: phoneValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeForStorage(String(name).trim());
    const sanitizedEmail = String(email).trim().toLowerCase();

    // Check for existing email
    const existingCustomer = await db.customer.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer
    const customer = await db.customer.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: phone ? sanitizeForStorage(String(phone).trim()) : null,
        password: hashedPassword,
      },
    });

    // Return customer without password
    const { password: _, ...customerData } = customer;

    return NextResponse.json({
      success: true,
      data: customerData,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
