// =============================================================================
// SL HUB COMPUTER - Admin Categories API
// =============================================================================
// Purpose: CRUD endpoints for category management
// GET: List all categories | POST: Create new category
// Cache: Invalidates "categories" cache on POST
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } }, children: true },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let order = body.order;

    if (order === undefined || order === null) {
      // Find the maximum order number and add 1
      const lastCategory = await db.category.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = lastCategory ? lastCategory.order + 1 : 1;
      body.order = order;
    } else {
      // Shift existing categories' order if a specific order is provided
      await db.category.updateMany({
        where: { order: { gte: order } },
        data: { order: { increment: 1 } },
      });
    }

    const category = await db.category.create({ data: body });

    // Invalidate categories cache
    invalidate("categories");

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
