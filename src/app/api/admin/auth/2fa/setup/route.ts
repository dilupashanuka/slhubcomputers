// =============================================================================
// SL HUB COMPUTER - Admin 2FA Setup API
// =============================================================================
// Purpose: Manage 2FA setup for admin account
// POST: Generate TOTP secret and backup codes
// DELETE: Disable 2FA
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateTOTPSecret,
  generateQRCodeUrl,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/two-factor";

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

    // Generate TOTP secret
    const secret = generateTOTPSecret();

    // Generate QR code URL
    const qrCodeUrl = generateQRCodeUrl(secret);

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map((code) => hashBackupCode(code));

    // Store in database (2FA not enabled yet - user must verify first)
    await db.adminTwoFactor.upsert({
      where: { userId: ADMIN_USER_ID },
      update: {
        secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
        isEnabled: false,
        verifiedAt: null,
      },
      create: {
        userId: ADMIN_USER_ID,
        secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
        isEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes, // Plain text - shown only once
      },
      message: "2FA setup initiated. Verify with a code from your authenticator app to enable.",
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE - Disable 2FA
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin is authenticated
    const adminToken = request.cookies.get("admin-token");
    if (!adminToken || !adminToken.value) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Delete 2FA record
    await db.adminTwoFactor.deleteMany({
      where: { userId: ADMIN_USER_ID },
    });

    return NextResponse.json({
      success: true,
      message: "2FA has been disabled",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
