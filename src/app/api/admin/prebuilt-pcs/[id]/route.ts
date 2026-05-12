// Admin Pre-Built PC Detail API
// Cache: Invalidates "prebuilt-pcs" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pc = await db.prebuiltPC.findUnique({ where: { id } });
  if (!pc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: pc });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

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

  const pc = await db.prebuiltPC.update({ where: { id }, data: body });

  // Invalidate prebuilt-pcs cache
  invalidate("prebuilt-pcs");

  return NextResponse.json({ success: true, data: pc });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.prebuiltPC.findUnique({ where: { id }, select: { order: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await db.prebuiltPC.delete({ where: { id } });
    await db.prebuiltPC.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    // Invalidate prebuilt-pcs cache
    invalidate("prebuilt-pcs");

    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
