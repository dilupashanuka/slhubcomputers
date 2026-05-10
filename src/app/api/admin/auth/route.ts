// =============================================================================
// SL HUB COMPUTER - Admin Authentication API
// =============================================================================
// POST  /api/admin/auth      - Validate credentials, set httpOnly cookie
// DELETE /api/admin/auth      - Clear cookie (logout)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Cookie configuration
const COOKIE_NAME = "admin-token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
const ADMIN_USERNAME = "admin";

// Simple token generator (not cryptographic, but sufficient for simple auth)
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// POST - Login
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get admin password from env with fallback
    const adminPassword = process.env.ADMIN_PASSWORD || "slhub2024";

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate auth token
    const token = generateToken();

    // Set httpOnly cookie
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
