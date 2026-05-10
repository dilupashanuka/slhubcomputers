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
  const brand = await db.brand.update({ where: { id }, data: body });

  // Invalidate brands cache
  invalidate("brands");

  return NextResponse.json({ success: true, data: brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.brand.delete({ where: { id } });

  // Invalidate brands cache
  invalidate("brands");

  return NextResponse.json({ success: true, message: "Deleted" });
}
