// =============================================================================
// SL HUB COMPUTER - Reviews API Route
// =============================================================================
// Purpose: POST endpoint for submitting product reviews
// Features: Validates input, creates review (pending approval), updates product
//           rating and review count, creates admin notification
// Security: Input sanitization, email validation
// Route: /api/reviews
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage, validateEmail } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rating, title, comment, productId } = body;

    // ---- Validation ----
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && typeof email === "string") {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return NextResponse.json(
          { success: false, error: emailValidation.error },
          { status: 400 }
        );
      }
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Comment must be at least 5 characters" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: sanitizeForStorage(productId) },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // ---- Create Review (pending approval) ----
    const review = await db.review.create({
      data: {
        productId: sanitizeForStorage(productId),
        name: sanitizeForStorage(name.trim()),
        email: email?.trim() ? String(email).trim().toLowerCase() : null,
        rating: Math.round(rating),
        title: title?.trim() ? sanitizeForStorage(title.trim()) : null,
        comment: sanitizeForStorage(comment.trim()),
        isApproved: false, // Requires admin approval
      },
    });

    // ---------------------------------------------------------------
    // Create admin notification for new review
    // ---------------------------------------------------------------
    try {
      await db.notification.create({
        data: {
          type: "review",
          title: `New Review by ${name}`,
          message: `${rating}/5 stars on ${product.name} - Pending approval`,
          link: "/admin/reviews",
        },
      });
    } catch (notifError) {
      console.error("Failed to create review notification:", notifError);
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review submitted successfully! It will appear after approval.",
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET - Fetch approved reviews for a product (with sorting)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const sort = searchParams.get("sort") || "newest";

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const reviews = await db.review.findMany({
      where: {
        productId: sanitizeForStorage(productId),
        isApproved: true,
      },
      orderBy,
    });

    // Calculate stats
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Rating distribution
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percentage:
        reviews.length > 0
          ? Math.round(
              (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
            )
          : 0,
    }));

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        distribution,
      },
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
