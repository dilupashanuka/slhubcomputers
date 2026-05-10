// =============================================================================
// SL HUB COMPUTER - Public Orders API Route
// =============================================================================
// Purpose: Public endpoint for creating orders from the checkout page
// Features: Creates order with items in a transaction, generates order number,
//           validates required fields, returns created order with order number
// API: POST /api/orders - Create a new order
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/orders - Create a new order with items
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, phone, address, subtotal, total, items, orderNumber } = body;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and address are required" },
        { status: 400 }
      );
    }

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    if (!items || !items.create || items.create.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Create the order with items using nested create
    const order = await db.order.create({
      data: {
        orderNumber,
        name: String(name).trim(),
        email: body.email ? String(body.email).trim() : null,
        phone: String(phone).trim(),
        address: String(address).trim(),
        city: body.city ? String(body.city).trim() : null,
        notes: body.notes ? String(body.notes).trim() : null,
        subtotal: Number(subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        total: Number(total) || 0,
        status: body.status || "pending",
        paymentMethod: body.paymentMethod || "cod",
        items: {
          create: items.create.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
            productId: String(item.productId),
            name: String(item.name),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(
      { success: true, data: order, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
