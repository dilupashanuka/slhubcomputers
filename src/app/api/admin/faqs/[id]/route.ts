// =============================================================================
// SL HUB COMPUTER - Admin FAQ Detail API Route
// =============================================================================
// Purpose: API endpoint for updating and deleting specific FAQs
// Features: 
//   - PUT /api/admin/faqs/[id]: Update an existing FAQ
//   - DELETE /api/admin/faqs/[id]: Delete an FAQ
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PUT: Update an existing FAQ
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { question, answer, category, order, isActive } = body;

    const faq = await db.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        category,
        order: parseInt(order) || 0,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete an FAQ
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await db.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
