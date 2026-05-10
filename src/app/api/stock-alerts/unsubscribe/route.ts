// =============================================================================
// SL HUB COMPUTER - Stock Alert Unsubscribe API
// =============================================================================
// Purpose: Unsubscribe an email from back-in-stock notifications
// POST: Body { productId, email }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, email } = body;

    if (!productId || !email) {
      return NextResponse.json(
        { success: false, error: "Product ID and email are required" },
        { status: 400 }
      );
    }

    const subscription = await db.stockAlertSubscription.findUnique({
      where: {
        productId_email: { productId, email: email.toLowerCase() },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    await db.stockAlertSubscription.delete({
      where: { id: subscription.id },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from stock alert",
    });
  } catch (error) {
    console.error("Stock alert unsubscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
