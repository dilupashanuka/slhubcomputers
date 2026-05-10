// Admin Pre-Built PC Detail API
// Cache: Invalidates "prebuilt-pcs" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pc = await db.prebuiltPC.findUnique({ where: { id } });
  if (!pc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: pc });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const pc = await db.prebuiltPC.update({ where: { id }, data: body });

  // Invalidate prebuilt-pcs cache
  invalidate("prebuilt-pcs");

  return NextResponse.json({ success: true, data: pc });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.prebuiltPC.delete({ where: { id } });

  // Invalidate prebuilt-pcs cache
  invalidate("prebuilt-pcs");

  return NextResponse.json({ success: true, message: "Deleted" });
}
