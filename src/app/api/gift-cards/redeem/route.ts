// =============================================================================
// SL HUB COMPUTER - Gift Card Redemption API
// =============================================================================
// POST: Redeem a gift card (apply to order)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { redeemGiftCard, validateGiftCardCode } from "@/lib/gift-card";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount, orderId } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Gift card code is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid redemption amount is required" },
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

    // Redeem
    const result = await redeemGiftCard(code, Number(amount), orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        redeemedAmount: result.redeemedAmount,
        remainingBalance: result.remainingBalance,
      },
    });
  } catch (error) {
    console.error("Gift card redeem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to redeem gift card" },
      { status: 500 }
    );
  }
}
