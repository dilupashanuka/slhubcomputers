// =============================================================================
// SL HUB COMPUTER - Admin Pre-Built PCs API
// =============================================================================
// Purpose: CRUD endpoints for pre-built PC management
// GET: List all pre-built PCs | POST: Create new pre-built PC
// Cache: Invalidates "prebuilt-pcs" cache on POST
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

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

    // Map `images` array to `image` and `additionalImages`
    if (body.images && Array.isArray(body.images)) {
      if (body.images.length > 0) {
        body.image = body.images[0];
        body.additionalImages = JSON.stringify(body.images.slice(1));
      } else {
        body.image = "";
        body.additionalImages = "[]";
      }
      delete body.images;
    }

    // Auto-assign display order if not provided
    if (body.order === undefined || body.order === null) {
      const last = await db.prebuiltPC.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      body.order = (last?.order ?? -1) + 1;
    }

    const pc = await db.prebuiltPC.create({ data: body });

    // Invalidate prebuilt-pcs cache
    invalidate("prebuilt-pcs");

    return NextResponse.json({ success: true, data: pc }, { status: 201 });
  } catch (error) {
    console.error("Admin prebuilt PCs POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}
