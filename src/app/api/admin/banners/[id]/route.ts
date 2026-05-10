// Admin Banner Detail API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  return NextResponse.json({ success: true, data: banner });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.banner.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}
