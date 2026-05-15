// =============================================================================
// SL HUB COMPUTER - Admin Authentication API
// =============================================================================
// POST  /api/admin/auth      - Validate credentials, check 2FA, set cookie
// DELETE /api/admin/auth      - Clear cookie (logout)
// Security: IP blocking, rate limiting (handled in middleware)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { recordFailedAuthAttempt, resetFailedAuthAttempts, isIPBlocked } from "@/lib/ip-block";
import bcrypt from "bcryptjs";

// Cookie configuration
const COOKIE_NAME = "admin-token";
const COOKIE_MAX_AGE = 12 * 60 * 60; // 12 hours (Improved session persistence for admin)

// Simple token generator
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      const ip = value.split(",")[0].trim();
      if (ip) return ip;
    }
  }

  return "unknown";
}

// ---------------------------------------------------------------------------
// POST - Login
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Check if IP is blocked
    const ipCheck = await isIPBlocked(ip);
    if (ipCheck.blocked) {
      return NextResponse.json(
        { success: false, error: "Access denied. Your IP has been blocked." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find admin account in database
    const adminAccount = await db.adminAccount.findUnique({
      where: { username },
    });

    let isValid = false;
    let userId = username;

    if (adminAccount && adminAccount.isActive) {
      isValid = await bcrypt.compare(password, adminAccount.password);
      userId = adminAccount.username;
    } else if (!adminAccount && username === "admin") {
      // Fallback to .env for the first time if the database hasn't been seeded
      const adminPassword = process.env.ADMIN_PASSWORD || "slhub2024";
      isValid = password === adminPassword;
    }

    // Validate credentials
    if (!isValid) {
      // Record failed attempt
      const result = await recordFailedAuthAttempt(ip);

      if (result.blocked) {
        return NextResponse.json(
          { success: false, error: "Too many failed attempts. Your IP has been temporarily blocked." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful password validation
    resetFailedAuthAttempts(ip);

    // Check if 2FA is enabled
    try {
      const twoFactor = await db.adminTwoFactor.findUnique({
        where: { userId },
      });

      if (twoFactor && twoFactor.isEnabled) {
        // 2FA is enabled - return pending state, don't set cookie yet
        const pendingToken = generateToken();
        return NextResponse.json({
          success: true,
          requires2FA: true,
          pendingToken,
          message: "2FA verification required",
        });
      }
    } catch (dbError) {
      console.error("2FA check error:", dbError);
      // If 2FA check fails, proceed without 2FA (graceful fallback)
    }

    // Update last login if account exists
    if (adminAccount) {
      await db.adminAccount.update({
        where: { id: adminAccount.id },
        data: { lastLogin: new Date() },
      }).catch(err => console.error("Update last login error:", err));
    }

    // No 2FA - generate auth token and set cookie
    const token = generateToken();

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE - Logout
// ---------------------------------------------------------------------------
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
