// =============================================================================
// SL HUB COMPUTER - Banners API Route
// =============================================================================
// Purpose: GET endpoint for fetching active homepage banners
// Features: Returns active banners ordered by sort order,
//           optionally filters by date range (startDate/endDate)
//           Server-side caching with 2min TTL
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const result = await deduplicatedFetch(
      "banners:all",
      async () => {
        const now = new Date();

        const banners = await db.banner.findMany({
          where: {
            isActive: true,
            OR: [
              { startDate: null, endDate: null },
              { startDate: { lte: now }, endDate: { gte: now } },
              { startDate: null, endDate: { gte: now } },
              { startDate: { lte: now }, endDate: null },
            ],
          },
          orderBy: { order: "asc" },
        });

        return {
          success: true,
          data: banners,
        };
      },
      CACHE_TTL.BANNERS
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Banners API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}
