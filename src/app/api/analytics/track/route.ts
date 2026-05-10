// =============================================================================
// SL HUB COMPUTER - Analytics Track API
// =============================================================================
// POST: Track a page view or event from client side
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { trackEventInDB } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, page, productId, sessionId, meta } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Event type is required" },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = ["page_view", "product_view", "add_to_cart", "checkout", "order_placed"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    await trackEventInDB({
      type,
      page: page || undefined,
      productId: productId || undefined,
      sessionId: sessionId || undefined,
      meta: meta || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track event" },
      { status: 500 }
    );
  }
}
