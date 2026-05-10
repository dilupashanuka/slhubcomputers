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
    await db.testimonial.delete({ where: { id } });

    // Invalidate testimonials cache
    invalidate("testimonials");

    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
