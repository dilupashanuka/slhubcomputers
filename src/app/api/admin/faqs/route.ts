// =============================================================================
// SL HUB COMPUTER - Admin FAQs API Route
// =============================================================================
// Purpose: API endpoint for managing FAQs in the admin panel
// Features: 
//   - GET /api/admin/faqs: List all FAQs (with filters)
//   - POST /api/admin/faqs: Create a new FAQ
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET: Fetch all FAQs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const faqs = await db.fAQ.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new FAQ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, order, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Question and Answer are required" },
        { status: 400 }
      );
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category || "General",
        order: parseInt(order) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
