// =============================================================================
// SL HUB COMPUTER - FAQs API Route
// =============================================================================
// Purpose: GET endpoint for fetching active FAQs
// Features: Filter by category, returns active FAQs ordered by sort order
//           Server-side caching with 5min TTL
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, buildCacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const cacheKey = buildCacheKey("faqs", { category });

    const result = await deduplicatedFetch(
      cacheKey,
      async () => {
        const where: Record<string, unknown> = { isActive: true };
        if (category) where.category = category;
        const faqs = await db.fAQ.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
        return { success: true, data: faqs };
      },
      CACHE_TTL.FAQS
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
