// =============================================================================
// SL HUB COMPUTER - Admin 2FA Status API
// =============================================================================
// Purpose: Get current 2FA status for the admin account
// GET: Returns whether 2FA is enabled and verification date
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ADMIN_USER_ID = "admin";

export async function GET(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken || !adminToken.value) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get 2FA status
    const twoFactor = await db.adminTwoFactor.findUnique({
      where: { userId: ADMIN_USER_ID },
      select: {
        isEnabled: true,
        verifiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: twoFactor?.isEnabled || false,
        verifiedAt: twoFactor?.verifiedAt || null,
      },
    });
  } catch (error) {
    console.error("2FA status error:", error);
    // Graceful fallback - return disabled status
    return NextResponse.json({
      success: true,
      data: {
        isEnabled: false,
        verifiedAt: null,
      },
    });
  }
}
