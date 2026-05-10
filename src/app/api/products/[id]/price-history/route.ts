// =============================================================================
// SL HUB COMPUTER - Product Price History API
// =============================================================================
// Purpose: Fetch price history for a specific product
// GET: Returns array of price changes with date, price, originalPrice, changeType
//      Supports date range filtering via ?from=ISO&to=ISO query params
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build where clause with optional date range filter
    const where: Record<string, unknown> = { productId: id };

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.gte = new Date(from);
      if (to) createdAt.lte = new Date(to);
      where.createdAt = createdAt;
    }

    const priceHistory = await db.priceHistory.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        price: true,
        originalPrice: true,
        changeType: true,
        changedBy: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const prices = priceHistory.map((h) => h.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Check if price dropped in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDrops = priceHistory.filter(
      (h) => new Date(h.createdAt) >= sevenDaysAgo
    );

    // Calculate "lowest in X days"
    let lowestInDays = 0;
    if (priceHistory.length >= 2) {
      const currentPrice = priceHistory[priceHistory.length - 1].price;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHistory = priceHistory.filter(
        (h) => new Date(h.createdAt) >= thirtyDaysAgo
      );
      const recentPrices = recentHistory.map((h) => h.price);
      if (recentPrices.length > 0 && currentPrice <= Math.min(...recentPrices)) {
        // Find how many days the current price has been the lowest
        const firstOccurrence = recentHistory.find(
          (h) => h.price === currentPrice
        );
        if (firstOccurrence) {
          const daysDiff = Math.floor(
            (Date.now() - new Date(firstOccurrence.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          lowestInDays = Math.max(daysDiff, 1);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: priceHistory.map((h) => ({
        id: h.id,
        date: h.createdAt,
        price: h.price,
        originalPrice: h.originalPrice,
        changeType: h.changeType,
        changedBy: h.changedBy,
      })),
      stats: {
        lowestPrice,
        highestPrice,
        priceDroppedRecently: recentDrops.some(
          (h, i) => i > 0 && h.price < recentDrops[i - 1]?.price
        ),
        lowestInDays,
      },
    });
  } catch (error) {
    console.error("Price history GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
