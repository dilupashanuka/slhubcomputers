// =============================================================================
// SL HUB COMPUTER - Testimonials API Route
// =============================================================================
// Purpose: GET endpoint for fetching active testimonials
// Features: Filter by featured flag, returns active testimonials ordered by sort
//           Server-side caching with 5min TTL
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, buildCacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    const cacheKey = buildCacheKey("testimonials", { featured });

    const result = await deduplicatedFetch(
      cacheKey,
      async () => {
        const where: Record<string, unknown> = { isActive: true };
        if (featured === "true") where.isFeatured = true;
        const testimonials = await db.testimonial.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
        return { success: true, data: testimonials };
      },
      CACHE_TTL.TESTIMONIALS
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
