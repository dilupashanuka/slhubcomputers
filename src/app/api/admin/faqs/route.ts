// =============================================================================
// SL HUB COMPUTER - Admin FAQs API
// =============================================================================
// Cache: Invalidates "faqs" cache on POST
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    const faqs = await db.fAQ.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const faq = await db.fAQ.create({ data: { question: body.question, answer: body.answer, category: body.category || "General", order: body.order || 0, isActive: body.isActive !== false } });

    // Invalidate FAQs cache
    invalidate("faqs");

    return NextResponse.json({ success: true, data: faq });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
