// =============================================================================
// SL HUB COMPUTER - Admin Product Detail API
// =============================================================================
// Purpose: CRUD endpoints for single product management
// GET: Fetch single product by ID
// PUT: Update product by ID (with low stock notification)
// DELETE: Delete product by ID
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStockAlertEmail } from "@/lib/email";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, brand: true, reviews: true },
    });
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch existing product to check stock change
    const existingProduct = await db.product.findUnique({
      where: { id },
      select: { stock: true, name: true },
    });

    const product = await db.product.update({
      where: { id },
      data: body,
      include: { category: true },
    });

    // ---------------------------------------------------------------
    // If stock was updated and is now low (≤5), create notification
    // ---------------------------------------------------------------
    if (
      existingProduct &&
      body.stock !== undefined &&
      body.stock !== existingProduct.stock &&
      product.stock <= 5 &&
      product.stock >= 0
    ) {
      try {
        await db.notification.create({
          data: {
            type: "stock",
            title: `Low Stock: ${product.name}`,
            message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} remaining`,
            link: "/admin/products",
          },
        });
      } catch (notifError) {
        console.error("Failed to create stock notification:", notifError);
      }

      // Send stock alert email to admin (non-blocking)
      sendStockAlertEmail({
        name: product.name,
        sku: product.sku || null,
        stock: product.stock,
        price: product.price,
        category: product.category?.name,
      }).catch((emailError) => {
        console.error("Stock alert email error:", emailError);
      });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
