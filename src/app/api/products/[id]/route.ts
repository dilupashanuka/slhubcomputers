// =============================================================================
// SL HUB COMPUTER - Single Product API Route
// =============================================================================
// Purpose: GET endpoint for fetching a single product with full details
// Features: Includes category, brand, approved reviews, and review stats
// Route: /api/products/[id]
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const approvedReviews = product.reviews;
    const averageRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: approvedReviews.length,
      },
    });
  } catch (error) {
    console.error("Product detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
