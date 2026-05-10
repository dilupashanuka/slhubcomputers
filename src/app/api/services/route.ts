// =============================================================================
// SL HUB COMPUTER - Services API Route
// =============================================================================
// Purpose: GET endpoint for fetching SL HUB COMPUTER services
// Features: Returns active services ordered by sort order
//           Server-side caching with 5min TTL
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const result = await deduplicatedFetch(
      "services:all",
      async () => {
        const services = await db.service.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });

        return {
          success: true,
          data: services,
        };
      },
      CACHE_TTL.SERVICES
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
