// =============================================================================
// SL HUB COMPUTER - Admin Product Detail API
// =============================================================================
// Purpose: CRUD endpoints for single product management
// GET: Fetch single product by ID
// PUT: Update product by ID (with low stock notification, price history
//      tracking, and back-in-stock alert notifications)
// DELETE: Delete product by ID
// Cache: Invalidates "products" cache on PUT/DELETE
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStockAlertEmail, sendBackInStockEmail } from "@/lib/email";
import { invalidate } from "@/lib/cache";

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

    // Fetch existing product to check stock and price changes
    const existingProduct = await db.product.findUnique({
      where: { id },
      select: { stock: true, name: true, price: true, originalPrice: true, sku: true },
    });

    const product = await db.product.update({
      where: { id },
      data: body,
      include: { category: true },
    });

    // Invalidate products cache
    invalidate("products");

    // ---------------------------------------------------------------
    // Track price changes in PriceHistory
    // ---------------------------------------------------------------
    if (existingProduct) {
      const priceChanged = body.price !== undefined && body.price !== existingProduct.price;
      const originalPriceChanged = body.originalPrice !== undefined && body.originalPrice !== existingProduct.originalPrice;

      if (priceChanged || originalPriceChanged) {
        try {
          await db.priceHistory.create({
            data: {
              productId: id,
              price: body.price ?? existingProduct.price,
              originalPrice: body.originalPrice ?? existingProduct.originalPrice,
              changedBy: body.changedBy || "admin",
              changeType: body.changeType || "manual",
            },
          });
        } catch (historyError) {
          console.error("Failed to record price history:", historyError);
        }
      }

      // ---------------------------------------------------------------
      // If stock was updated and is now low (≤5), create notification
      // ---------------------------------------------------------------
      if (
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

      // ---------------------------------------------------------------
      // If stock changed from 0 to >0, notify back-in-stock subscribers
      // ---------------------------------------------------------------
      if (
        body.stock !== undefined &&
        existingProduct.stock === 0 &&
        product.stock > 0
      ) {
        try {
          const subscriptions = await db.stockAlertSubscription.findMany({
            where: {
              productId: id,
              notifiedAt: null, // Not yet notified
            },
          });

          if (subscriptions.length > 0) {
            // Send email to each subscriber (non-blocking)
            for (const sub of subscriptions) {
              sendBackInStockEmail({
                email: sub.email,
                productName: product.name,
                productPrice: product.price,
                productId: id,
              }).catch((emailError) => {
                console.error(`Back-in-stock email error for ${sub.email}:`, emailError);
              });
            }

            // Mark all subscriptions as notified
            await db.stockAlertSubscription.updateMany({
              where: {
                productId: id,
                notifiedAt: null,
              },
              data: {
                notifiedAt: new Date(),
              },
            });

            // Create admin notification about back-in-stock alerts sent
            await db.notification.create({
              data: {
                type: "system",
                title: `Back in Stock: ${product.name}`,
                message: `${subscriptions.length} customer${subscriptions.length === 1 ? "" : "s"} notified that this product is back in stock`,
                link: "/admin/stock-alerts",
              },
            });
          }
        } catch (alertError) {
          console.error("Back-in-stock notification error:", alertError);
        }
      }
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

    // Invalidate products cache
    invalidate("products");

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
