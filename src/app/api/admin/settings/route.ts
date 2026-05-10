// =============================================================================
// SL HUB COMPUTER - Admin Settings API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "site-settings" } });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: body,
      create: { id: "site-settings", ...body },
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
