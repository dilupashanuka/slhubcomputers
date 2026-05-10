// =============================================================================
// SL HUB COMPUTER - Customer Login API
// =============================================================================
// POST: Authenticate customer with email + password
// - Verifies credentials against hashed password
// - Sets httpOnly session cookie with customer ID
// - Returns customer data (without password)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, key] = hashedPassword.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return key === derivedKey.toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find customer by email
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!customer.isActive) {
      return NextResponse.json(
        { success: false, error: "Account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return customer without password
    const { password: _, ...customerData } = customer;

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      data: customerData,
      message: "Login successful",
    });

    // Set httpOnly session cookie (expires in 7 days)
    response.cookies.set("slhub_session", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to login" },
      { status: 500 }
    );
  }
}
