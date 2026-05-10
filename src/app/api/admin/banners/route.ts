// =============================================================================
// SL HUB COMPUTER - Admin Banners API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const banners = await db.banner.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const banner = await db.banner.create({ data: body });
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
