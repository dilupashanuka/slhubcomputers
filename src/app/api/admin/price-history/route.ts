// =============================================================================
// SL HUB COMPUTER - Admin Price History API
// =============================================================================
// Purpose: Fetch price changes across all products for the admin dashboard
// GET: List recent price changes with product info, old/new prices, change %,
//      who changed, and date. Supports date range, product, and category filters.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (productId) where.productId = productId;
    if (categoryId) {
      where.product = { categoryId };
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.gte = new Date(from);
      if (to) createdAt.lte = new Date(to);
      where.createdAt = createdAt;
    }

    const [history, total] = await Promise.all([
      db.priceHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      db.priceHistory.count({ where }),
    ]);

    // Enrich with previous price for change calculation
    const allHistory = await db.priceHistory.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: { id: true, productId: true, price: true, createdAt: true },
    });

    // Build a map of previous prices
    const prevPriceMap: Record<string, number> = {};
    const productHistoryMap: Record<string, typeof allHistory> = {};
    for (const h of allHistory) {
      if (!productHistoryMap[h.productId]) productHistoryMap[h.productId] = [];
      productHistoryMap[h.productId].push(h);
    }
    for (const h of history) {
      const productHistory = productHistoryMap[h.productId] || [];
      const idx = productHistory.findIndex((p) => p.id === h.id);
      if (idx > 0) {
        prevPriceMap[h.id] = productHistory[idx - 1].price;
      }
    }

    const data = history.map((h) => {
      const prevPrice = prevPriceMap[h.id];
      const changePercent =
        prevPrice !== undefined
          ? ((h.price - prevPrice) / prevPrice) * 100
          : null;

      return {
        id: h.id,
        productId: h.productId,
        productName: h.product.name,
        productSlug: h.product.slug,
        productSku: h.product.sku,
        category: h.product.category?.name || null,
        categoryId: h.product.category?.id || null,
        price: h.price,
        originalPrice: h.originalPrice,
        previousPrice: prevPrice ?? null,
        changePercent,
        changeType: h.changeType,
        changedBy: h.changedBy,
        date: h.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin price history GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
