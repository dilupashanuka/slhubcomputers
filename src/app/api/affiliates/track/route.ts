// =============================================================================
// SL HUB COMPUTER - Affiliate Track API Route
// =============================================================================
// Purpose: Track referral clicks and set affiliate cookie
// Features:
//   - GET: Track referral click (?code=SLHUB-XXXXX)
//   - Increment click count on affiliate
//   - Return response with affiliate info for cookie setting on client
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/affiliates/track?code=SLHUB-XXXXX - Track a referral click
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Affiliate code is required" },
        { status: 400 }
      );
    }

    const sanitizedCode = sanitizeForStorage(code.trim().toUpperCase());

    // Find the affiliate
    const affiliate = await db.affiliate.findUnique({
      where: { code: sanitizedCode },
    });

    if (!affiliate || !affiliate.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive affiliate code" },
        { status: 404 }
      );
    }

    // Increment click count
    await db.affiliate.update({
      where: { id: affiliate.id },
      data: { clicks: { increment: 1 } },
    });

    // Set affiliate cookie and return success
    const response = NextResponse.json({
      success: true,
      data: {
        code: affiliate.code,
        name: affiliate.name,
      },
    });

    // Set cookie for 30 days
    response.cookies.set("slhub_affiliate_code", affiliate.code, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Affiliate track error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track referral" },
      { status: 500 }
    );
  }
}
