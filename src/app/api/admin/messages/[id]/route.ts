// Admin Message Detail API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await db.contactMessage.findUnique({ where: { id } });
  if (!message) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  // Mark as read
  await db.contactMessage.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ success: true, data: { ...message, isRead: true } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const message = await db.contactMessage.update({ where: { id }, data: body });
  return NextResponse.json({ success: true, data: message });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}
