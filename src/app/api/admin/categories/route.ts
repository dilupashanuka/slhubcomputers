// =============================================================================
// SL HUB COMPUTER - Admin Categories API
// =============================================================================
// Purpose: CRUD endpoints for category management
// GET: List all categories | POST: Create new category
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const category = await db.category.create({ data: body });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
