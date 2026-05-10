// =============================================================================
// SL HUB COMPUTER - Categories API Route
// =============================================================================
// Purpose: GET endpoint for fetching product categories with product counts
// Features: Returns active categories ordered by sort order,
//           includes product count for each category
//           Server-side caching with 5min TTL
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const result = await deduplicatedFetch(
      "categories:all",
      async () => {
        const categories = await db.category.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            _count: { select: { products: true } },
            children: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                _count: { select: { products: true } },
              },
            },
          },
        });

        return {
          success: true,
          data: categories,
        };
      },
      CACHE_TTL.CATEGORIES
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
