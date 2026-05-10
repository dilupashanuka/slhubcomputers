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
    await db.fAQ.delete({ where: { id } });

    // Invalidate FAQs cache
    invalidate("faqs");

    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
