// =============================================================================
// SL HUB COMPUTER - Admin Brands API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const brands = await db.brand.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } });
    return NextResponse.json({ success: true, data: brands });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand = await db.brand.create({ data: body });
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
