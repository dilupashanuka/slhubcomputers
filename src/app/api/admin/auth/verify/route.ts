// =============================================================================
// SL HUB COMPUTER - Admin Auth Verification API
// =============================================================================
// GET /api/admin/auth/verify - Check if admin-token cookie is valid
// =============================================================================

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin-token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token || !token.value) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    // Token exists = authenticated (simple cookie-based auth)
    return NextResponse.json({
      success: true,
      authenticated: true,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    );
  }
}
