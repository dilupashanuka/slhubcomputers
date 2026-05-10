// =============================================================================
// SL HUB COMPUTER - Admin 2FA Backup Codes API
// =============================================================================
// Purpose: Regenerate backup codes for admin 2FA
// POST: Generate new backup codes (invalidates old ones)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateBackupCodes, hashBackupCode } from "@/lib/two-factor";

const ADMIN_USER_ID = "admin";

export async function POST(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken || !adminToken.value) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get existing 2FA record
    const twoFactor = await db.adminTwoFactor.findUnique({
      where: { userId: ADMIN_USER_ID },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      return NextResponse.json(
        { success: false, error: "2FA must be enabled to regenerate backup codes" },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map((code) => hashBackupCode(code));

    // Update database
    await db.adminTwoFactor.update({
      where: { userId: ADMIN_USER_ID },
      data: {
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        backupCodes, // Plain text - shown only once
      },
      message: "New backup codes generated. Save them in a secure location.",
    });
  } catch (error) {
    console.error("Backup codes regeneration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}
