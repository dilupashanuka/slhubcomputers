// =============================================================================
// SL HUB COMPUTER - Admin 2FA Verify API
// =============================================================================
// Purpose: Verify 2FA code during login or setup verification
// POST: Verify TOTP code or backup code
//   - During login: verify code, set admin-token cookie
//   - During setup: verify code, enable 2FA
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyTOTP, findBackupCodeIndex, hashBackupCode } from "@/lib/two-factor";

const COOKIE_NAME = "admin-token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
const ADMIN_USER_ID = "admin";

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, backupCode, pendingToken, action } = body;

    // -------------------------------------------------------------------
    // Mode 1: Setup verification (enable 2FA after scanning QR)
    // -------------------------------------------------------------------
    if (action === "enable") {
      // Verify admin is authenticated
      const adminToken = request.cookies.get("admin-token");
      if (!adminToken || !adminToken.value) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }

      // Get 2FA record
      const twoFactor = await db.adminTwoFactor.findUnique({
        where: { userId: ADMIN_USER_ID },
      });

      if (!twoFactor) {
        return NextResponse.json(
          { success: false, error: "2FA setup not found. Please set up 2FA first." },
          { status: 400 }
        );
      }

      // Verify TOTP code
      if (!code || !verifyTOTP(twoFactor.secret, String(code))) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code. Please try again." },
          { status: 400 }
        );
      }

      // Enable 2FA
      await db.adminTwoFactor.update({
        where: { userId: ADMIN_USER_ID },
        data: {
          isEnabled: true,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "2FA has been enabled successfully!",
      });
    }

    // -------------------------------------------------------------------
    // Mode 2: Login verification (verify code after password login)
    // -------------------------------------------------------------------
    if (!pendingToken) {
      return NextResponse.json(
        { success: false, error: "Pending token is required for login verification" },
        { status: 400 }
      );
    }

    // Get 2FA record
    const twoFactor = await db.adminTwoFactor.findUnique({
      where: { userId: ADMIN_USER_ID },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      return NextResponse.json(
        { success: false, error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    // Verify TOTP code
    if (code) {
      const isValid = verifyTOTP(twoFactor.secret, String(code));
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code. Please try again." },
          { status: 400 }
        );
      }
    } else if (backupCode) {
      // Verify backup code
      const hashedCodes: string[] = JSON.parse(twoFactor.backupCodes);
      const codeIndex = findBackupCodeIndex(String(backupCode), hashedCodes);

      if (codeIndex === -1) {
        return NextResponse.json(
          { success: false, error: "Invalid backup code. Please try again." },
          { status: 400 }
        );
      }

      // Remove used backup code
      hashedCodes.splice(codeIndex, 1);
      await db.adminTwoFactor.update({
        where: { userId: ADMIN_USER_ID },
        data: {
          backupCodes: JSON.stringify(hashedCodes),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Verification code or backup code is required" },
        { status: 400 }
      );
    }

    // Set admin-token cookie (complete login)
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
      message: "2FA verification successful",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
