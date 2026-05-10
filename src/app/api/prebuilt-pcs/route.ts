// =============================================================================
// SL HUB COMPUTER - Pre-Built PCs API Route
// =============================================================================
// Purpose: GET endpoint for fetching pre-built PC packages
// Features: Filter by category (budget, gaming, office, workstation),
//           returns available PCs ordered by sort order with specs parsed
//           Server-side caching with 2min TTL
// Query Params: category (optional filter), featured (optional)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, buildCacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const cacheKey = buildCacheKey("prebuilt-pcs", { category, featured });

    const result = await deduplicatedFetch(
      cacheKey,
      async () => {
        // Build where clause
        const where: Record<string, unknown> = { isAvailable: true };
        if (category && ["budget", "gaming", "office", "workstation"].includes(category)) {
          where.category = category;
        }
        if (featured === "true") {
          where.isFeatured = true;
        }

        const prebuiltPCs = await db.prebuiltPC.findMany({
          where,
          orderBy: { order: "asc" },
        });

        return {
          success: true,
          data: prebuiltPCs,
          total: prebuiltPCs.length,
        };
      },
      CACHE_TTL.PREBUILT_PCS
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Pre-built PCs API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pre-built PCs" },
      { status: 500 }
    );
  }
}
