// =============================================================================
// SL HUB COMPUTER - Admin Services API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, data: services });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = await db.service.create({ data: body });
    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
