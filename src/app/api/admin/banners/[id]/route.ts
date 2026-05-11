// Admin Banner Detail API
// Cache: Invalidates "banners" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await db.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: banner });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const banner = await db.banner.update({ where: { id }, data: body });

  // Invalidate banners cache
  invalidate("banners");

  return NextResponse.json({ success: true, data: banner });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.banner.findUnique({ where: { id }, select: { order: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await db.banner.delete({ where: { id } });
    await db.banner.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    invalidate("banners");
    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
