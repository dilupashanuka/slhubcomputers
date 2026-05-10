// =============================================================================
// SL HUB COMPUTER - Stock Alert Subscribe API
// =============================================================================
// Purpose: Subscribe an email to receive back-in-stock notifications
// POST: Body { productId, email } - validates email and checks duplicates
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, email } = body;

    // Validate required fields
    if (!productId || !email) {
      return NextResponse.json(
        { success: false, error: "Product ID and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // If product is in stock, no need to subscribe
    if (product.stock > 0) {
      return NextResponse.json(
        { success: false, error: "Product is currently in stock", inStock: true },
        { status: 400 }
      );
    }

    // Check if already subscribed (unique constraint on productId+email)
    const existing = await db.stockAlertSubscription.findUnique({
      where: {
        productId_email: { productId, email: email.toLowerCase() },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to this alert",
        alreadySubscribed: true,
      });
    }

    // Create subscription
    await db.stockAlertSubscription.create({
      data: {
        productId,
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "We'll email you when this item is back in stock!",
    });
  } catch (error) {
    console.error("Stock alert subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
