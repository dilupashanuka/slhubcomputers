// =============================================================================
// SL HUB COMPUTER - Gift Card Balance Check API
// =============================================================================
// POST: Check gift card balance and status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { calculateGiftCardBalance, validateGiftCardCode } from "@/lib/gift-card";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Gift card code is required" },
        { status: 400 }
      );
    }

    // Validate format
    const validation = validateGiftCardCode(code);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check balance
    const result = await calculateGiftCardBalance(code);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: result.balance,
        amount: result.amount,
        isActive: result.isActive,
        isRedeemed: result.isRedeemed,
        expiresAt: result.expiresAt,
        name: result.name,
      },
    });
  } catch (error) {
    console.error("Gift card check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check gift card" },
      { status: 500 }
    );
  }
}
