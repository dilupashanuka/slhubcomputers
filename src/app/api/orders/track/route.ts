// =============================================================================
// SL HUB COMPUTER - Order Tracking API Route
// =============================================================================
// Purpose: Public endpoint for tracking orders by order number + phone verification
// Features: Finds order by orderNumber, verifies last 4 digits of phone number,
//           returns order details with status timeline (security: masks phone number)
// API: GET /api/orders/track?orderNumber=xxx&phone=xxx
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Order status flow for timeline
// ---------------------------------------------------------------------------
const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

// ---------------------------------------------------------------------------
// GET /api/orders/track - Track order by order number and phone last 4 digits
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const phoneLast4 = searchParams.get("phone")?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    if (!phoneLast4 || phoneLast4.length < 4) {
      return NextResponse.json(
        { success: false, error: "Last 4 digits of phone number are required" },
        { status: 400 }
      );
    }

    // Find the order by orderNumber
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please check your order number." },
        { status: 404 }
      );
    }

    // Verify last 4 digits of phone number
    const phoneDigits = order.phone.replace(/\D/g, "");
    if (!phoneDigits.endsWith(phoneLast4)) {
      return NextResponse.json(
        { success: false, error: "Phone number verification failed. Please check the last 4 digits." },
        { status: 403 }
      );
    }

    // Build status timeline
    const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    const timeline = STATUS_FLOW.map((status, index) => {
      let date: string | null = null;
      let isActive = false;
      let isCompleted = false;

      if (isCancelled) {
        // For cancelled orders, only show pending as completed if it was reached
        if (status === "pending") {
          isCompleted = true;
          date = order.createdAt.toISOString();
        }
      } else {
        if (index < currentStatusIndex) {
          isCompleted = true;
          date = getStatusDate(order.createdAt, order.updatedAt, index, currentStatusIndex);
        } else if (index === currentStatusIndex) {
          isActive = true;
          date = index === 0 ? order.createdAt.toISOString() : getStatusDate(order.createdAt, order.updatedAt, index, currentStatusIndex);
        }
      }

      return {
        status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        isCompleted,
        isActive,
        date,
      };
    });

    // Add cancelled step if order is cancelled
    if (isCancelled) {
      timeline.push({
        status: "cancelled",
        label: "Cancelled",
        isCompleted: true,
        isActive: true,
        date: order.updatedAt.toISOString(),
      });
    }

    // Mask phone number for security (show only last 4 digits)
    const maskedPhone = `****${phoneDigits.slice(-4)}`;

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        name: order.name,
        email: order.email,
        phone: maskedPhone,
        address: order.address,
        city: order.city,
        notes: order.notes,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        discount: order.discount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        timeline,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track order. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: Estimate date for a status based on order progression
// ---------------------------------------------------------------------------
function getStatusDate(createdAt: Date, updatedAt: Date, statusIndex: number, currentIndex: number): string {
  // For pending, always use createdAt
  if (statusIndex === 0) return createdAt.toISOString();
  // For current status (not pending), use updatedAt
  if (statusIndex === currentIndex) return updatedAt.toISOString();
  // For intermediate statuses, estimate proportional dates
  const totalMs = updatedAt.getTime() - createdAt.getTime();
  const stepMs = totalMs / Math.max(currentIndex, 1);
  const estimatedDate = new Date(createdAt.getTime() + stepMs * statusIndex);
  return estimatedDate.toISOString();
}
