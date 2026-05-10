// =============================================================================
// SL HUB COMPUTER - Brands API Route
// =============================================================================
// Purpose: GET endpoint for fetching brands with product counts
// Features: Returns active brands ordered by sort order,
//           includes product count for each brand
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Brands API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
