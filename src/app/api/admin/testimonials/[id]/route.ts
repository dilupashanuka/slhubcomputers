// =============================================================================
// SL HUB COMPUTER - Admin Testimonial Detail API
// =============================================================================
// Cache: Invalidates "testimonials" cache on PUT/DELETE
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const testimonial = await db.testimonial.update({ where: { id }, data: body });

    // Invalidate testimonials cache
    invalidate("testimonials");

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.testimonial.findUnique({ where: { id }, select: { order: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await db.testimonial.delete({ where: { id } });
    await db.testimonial.updateMany({
      where: { order: { gt: existing.order } },
      data: { order: { decrement: 1 } },
    });

    // Invalidate testimonials cache
    invalidate("testimonials");

    return NextResponse.json({ success: true, message: "Deleted and re-ordered" });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
