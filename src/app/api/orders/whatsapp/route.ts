// =============================================================================
// SL HUB COMPUTER - WhatsApp Order Confirmation API Route
// =============================================================================
// Purpose: Generate WhatsApp message URL for order confirmation
// Features: Creates a pre-filled WhatsApp message with order details,
//           returns wa.me URL for frontend to open
// API: POST /api/orders/whatsapp
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/orders/whatsapp - Generate WhatsApp confirmation URL
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderNumber } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order ID or order number is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await db.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Get site settings for WhatsApp number
    const settings = await db.siteSettings.findUnique({
      where: { id: "site-settings" },
    });

    const whatsappNumber = settings?.whatsapp || "94710678944";

    // Format items list
    const itemLines = order.items
      .map((item) => `  • ${item.name} × ${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    // Build the WhatsApp message
    const message = [
      `🖥️ *SL HUB COMPUTER*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Order Confirmation*`,
      ``,
      `📦 Order: *${order.orderNumber}*`,
      `📅 Date: ${new Date(order.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}`,
      ``,
      `👤 *Customer:* ${order.name}`,
      `📞 *Phone:* ${order.phone}`,
      `📍 *Address:* ${order.address || "N/A"}${order.city ? `, ${order.city}` : ""}`,
      ``,
      `🛒 *Items:*`,
      itemLines,
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 Subtotal: Rs. ${order.subtotal.toLocaleString()}`,
      `🚚 Shipping: ${order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}`,
      `${order.discount > 0 ? `🏷️ Discount: -Rs. ${order.discount.toLocaleString()}\n` : ""}💵 *Total: Rs. ${order.total.toLocaleString()}*`,
      ``,
      `💳 Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`,
      ``,
      `🚛 *Estimated Delivery:* 2-5 business days`,
      ``,
      `Thank you for choosing SL HUB COMPUTER! 🙏`,
      `For support, call us at 071 067 8944`,
    ].join("\n");

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      data: {
        whatsappUrl,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("WhatsApp order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate WhatsApp message" },
      { status: 500 }
    );
  }
}
