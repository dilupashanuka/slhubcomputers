// Admin Brand Detail API - CRUD for single brand
// Cache: Invalidates "brands" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: brand });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // If order is changing, shift others
  if (body.order !== undefined) {
    const existing = await db.brand.findUnique({ where: { id } });
    if (existing && body.order !== existing.order) {
      await db.brand.updateMany({
        where: { order: { gte: body.order } },
        data: { order: { increment: 1 } },
      });
    }
  }

  const brand = await db.brand.update({ where: { id }, data: body });

  // Invalidate brands cache
  invalidate("brands");

  return NextResponse.json({ success: true, data: brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.brand.findUnique({ where: { id }, select: { order: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await db.brand.delete({ where: { id } });
    await db.brand.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    invalidate("brands");
    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
