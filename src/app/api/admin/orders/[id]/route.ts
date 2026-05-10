// =============================================================================
// SL HUB COMPUTER - Admin Order Detail API
// =============================================================================
// Purpose: CRUD for individual order management by admin
// Features:
//   - GET: Fetch order with items and product details
//   - PUT: Update order (including status change with email notification)
//   - DELETE: Delete an order
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderStatusUpdate } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Fetch the existing order to compare status
  const existingOrder = await db.order.findUnique({
    where: { id },
    select: { status: true, orderNumber: true, name: true, email: true, total: true },
  });

  const order = await db.order.update({ where: { id }, data: body, include: { items: true } });

  // ---------------------------------------------------------------
  // If status changed, send email notification and create admin notification
  // ---------------------------------------------------------------
  if (existingOrder && body.status && body.status !== existingOrder.status) {
    // Send status update email to customer (non-blocking)
    if (order.email) {
      sendOrderStatusUpdate(
        {
          orderNumber: order.orderNumber,
          name: order.name,
          email: order.email,
          status: existingOrder.status,
          total: order.total,
        },
        body.status
      ).catch((emailError) => {
        console.error("Order status email error:", emailError);
      });
    }

    // Create admin notification for status change
    try {
      await db.notification.create({
        data: {
          type: "order",
          title: `Order ${order.orderNumber} → ${body.status}`,
          message: `${order.name}'s order status updated to ${body.status}`,
          link: "/admin/orders",
        },
      });
    } catch (notifError) {
      console.error("Failed to create status notification:", notifError);
    }
  }

  return NextResponse.json({ success: true, data: order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.order.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Deleted" });
}
