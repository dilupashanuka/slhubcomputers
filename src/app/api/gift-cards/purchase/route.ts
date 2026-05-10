// =============================================================================
// SL HUB COMPUTER - Gift Card Purchase API
// =============================================================================
// POST: Purchase a new gift card
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueGiftCardCode } from "@/lib/gift-card";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      amount,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
      occasion,
    } = body;

    // Validate required fields
    if (!name || !amount) {
      return NextResponse.json(
        { success: false, error: "Name and amount are required" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least Rs. 500" },
        { status: 400 }
      );
    }

    if (numAmount > 500000) {
      return NextResponse.json(
        { success: false, error: "Amount cannot exceed Rs. 500,000" },
        { status: 400 }
      );
    }

    // Generate unique code
    const code = await generateUniqueGiftCardCode();

    // Default expiry: 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create the gift card
    const giftCard = await db.giftCard.create({
      data: {
        code,
        name,
        amount: numAmount,
        balance: numAmount,
        currency: "LKR",
        purchaserName: purchaserName || null,
        purchaserEmail: purchaserEmail || null,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        message: message || null,
        occasion: occasion || null,
        expiresAt,
      },
    });

    // Create initial transaction record
    await db.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        type: "purchase",
        amount: numAmount,
        description: `Gift card purchased for Rs. ${numAmount.toLocaleString()}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: giftCard.id,
        code: giftCard.code,
        name: giftCard.name,
        amount: giftCard.amount,
        balance: giftCard.balance,
        expiresAt: giftCard.expiresAt,
        occasion: giftCard.occasion,
      },
    });
  } catch (error) {
    console.error("Gift card purchase error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gift card" },
      { status: 500 }
    );
  }
}
