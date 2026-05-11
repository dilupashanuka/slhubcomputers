// =============================================================================
// SL HUB COMPUTER - Admin FAQ Detail API
// =============================================================================
// Cache: Invalidates "faqs" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const faq = await db.fAQ.update({ where: { id }, data: body });

    // Invalidate FAQs cache
    invalidate("faqs");

    return NextResponse.json({ success: true, data: faq });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.fAQ.findUnique({ where: { id }, select: { order: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await db.fAQ.delete({ where: { id } });
    await db.fAQ.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    // Invalidate FAQs cache
    invalidate("faqs");

    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    console.error("FAQ DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
