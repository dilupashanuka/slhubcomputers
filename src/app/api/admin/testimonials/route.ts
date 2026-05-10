// =============================================================================
// SL HUB COMPUTER - Admin Testimonials API
// =============================================================================
// Cache: Invalidates "testimonials" cache on POST
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testimonial = await db.testimonial.create({ data: { name: body.name, role: body.role || null, content: body.content, rating: body.rating || 5, avatar: body.avatar || null, isFeatured: body.isFeatured || false, isActive: body.isActive !== false, order: body.order || 0 } });

    // Invalidate testimonials cache
    invalidate("testimonials");

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
