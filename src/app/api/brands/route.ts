// =============================================================================
// SL HUB COMPUTER - Brands API Route
// =============================================================================
// Purpose: GET endpoint for fetching brands with product counts
// Features: Returns active brands ordered by sort order,
//           includes product count for each brand
//           Server-side caching with 5min TTL
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const result = await deduplicatedFetch(
      "brands:all",
      async () => {
        const brands = await db.brand.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            _count: { select: { products: true } },
          },
        });

        return {
          success: true,
          data: brands,
        };
      },
      CACHE_TTL.BRANDS
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Brands API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
