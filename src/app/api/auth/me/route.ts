// =============================================================================
// SL HUB COMPUTER - Get Current Customer API
// =============================================================================
// GET: Get current logged-in customer from session cookie
// Returns customer data with orders count and loyalty points
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("slhub_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        },
        reviews: true,
      },
    });

    if (!customer) {
      const response = NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 401 }
      );
      response.cookies.set("slhub_session", "", { maxAge: 0, path: "/" });
      return response;
    }

    if (!customer.isActive) {
      const response = NextResponse.json(
        { success: false, error: "Account deactivated" },
        { status: 403 }
      );
      response.cookies.set("slhub_session", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Return customer without password
    const { password: _, ...customerData } = customer;

    return NextResponse.json({
      success: true,
      data: customerData,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get customer data" },
      { status: 500 }
    );
  }
}
