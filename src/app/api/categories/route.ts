// =============================================================================
// SL HUB COMPUTER - Categories API Route
// =============================================================================
// Purpose: GET endpoint for fetching product categories with product counts
// Features: Returns active categories ordered by sort order,
//           includes product count for each category
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
