// Admin Service Detail API
// Cache: Invalidates "services" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } });
  if (!service) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: service });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const service = await db.service.update({ where: { id }, data: body });

  // Invalidate services cache
  invalidate("services");

  return NextResponse.json({ success: true, data: service });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.service.delete({ where: { id } });

  // Invalidate services cache
  invalidate("services");

  return NextResponse.json({ success: true, message: "Deleted" });
}
