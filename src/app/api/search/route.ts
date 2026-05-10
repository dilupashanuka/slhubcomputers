// =============================================================================
// SL HUB COMPUTER - Search API Route
// =============================================================================
// Purpose: GET endpoint for searching products, categories, and brands
// Features: Full-text search across products, categories, brands with
//           relevance-based results, returns aggregated search results
// Query Params: q (search query), limit (max results per section)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: { products: [], categories: [], brands: [] },
      });
    }

    // Search products
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { shortDesc: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Search categories
    const categories = await db.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 5,
      include: { _count: { select: { products: true } } },
    });

    // Search brands
    const brands = await db.brand.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 5,
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      success: true,
      data: { products, categories, brands },
      totalResults: products.length + categories.length + brands.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
