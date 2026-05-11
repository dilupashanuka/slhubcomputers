// =============================================================================
// SL HUB COMPUTER - Admin Category Detail API
// =============================================================================
// Purpose: CRUD for single category by ID
// Cache: Invalidates "categories" cache on PUT/DELETE
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If order is changing, shift others
    if (body.order !== undefined) {
      const existing = await db.category.findUnique({ where: { id } });
      if (existing && body.order !== existing.order) {
        await db.category.updateMany({
          where: { order: { gte: body.order } },
          data: { order: { increment: 1 } },
        });
      }
    }

    const category = await db.category.update({ where: { id }, data: body });

    // Invalidate categories cache
    invalidate("categories");

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // 1. Get the category to be deleted to know its order
    const existing = await db.category.findUnique({
      where: { id },
      select: { order: true }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // 2. Delete the category
    await db.category.delete({ where: { id } });

    // 3. Re-order categories with higher order number
    await db.category.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    // Invalidate categories cache
    invalidate("categories");

    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
