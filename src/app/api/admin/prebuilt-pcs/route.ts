// =============================================================================
// SL HUB COMPUTER - Admin Pre-Built PCs API
// =============================================================================
// Purpose: CRUD endpoints for pre-built PC management
// GET: List all pre-built PCs | POST: Create new pre-built PC
// NEW: Added for Pre-Built PCs feature
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const prebuiltPCs = await db.prebuiltPC.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, data: prebuiltPCs });
  } catch (error) {
    console.error("Admin prebuilt PCs GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pc = await db.prebuiltPC.create({ data: body });
    return NextResponse.json({ success: true, data: pc }, { status: 201 });
  } catch (error) {
    console.error("Admin prebuilt PCs POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}
