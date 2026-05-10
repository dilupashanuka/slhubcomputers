// =============================================================================
// SL HUB COMPUTER - Stock Alerts Admin API
// =============================================================================
// Purpose: Admin endpoints for managing stock alert subscriptions
// GET: List products with stock alert subscriptions + stats
// POST: Send manual back-in-stock notifications for a product
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBackInStockEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // Get products that have stock alert subscriptions
    const productsWithAlerts = await db.product.findMany({
      where: {
        stockAlertSubscriptions: { some: {} },
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      include: {
        category: { select: { name: true } },
        _count: { select: { stockAlertSubscriptions: true } },
        stockAlertSubscriptions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            email: true,
            notifiedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.product.count({
      where: {
        stockAlertSubscriptions: { some: {} },
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
    });

    // Get last notification sent for each product
    const lastNotifiedMap: Record<string, Date | null> = {};
    for (const product of productsWithAlerts) {
      const lastNotified = product.stockAlertSubscriptions.find(
        (s) => s.notifiedAt
      );
      lastNotifiedMap[product.id] = lastNotified?.notifiedAt || null;
    }

    const data = productsWithAlerts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || null,
      subscribersCount: product._count.stockAlertSubscriptions,
      lastNotificationSent: lastNotifiedMap[product.id],
      recentSubscribers: product.stockAlertSubscriptions,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Stock alerts GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "Product is still out of stock" },
        { status: 400 }
      );
    }

    // Get all unnotified subscriptions
    const subscriptions = await db.stockAlertSubscription.findMany({
      where: { productId, notifiedAt: null },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending subscriptions to notify",
        notifiedCount: 0,
      });
    }

    // Send emails (non-blocking)
    for (const sub of subscriptions) {
      sendBackInStockEmail({
        email: sub.email,
        productName: product.name,
        productPrice: product.price,
        productId: product.id,
      }).catch((err) => {
        console.error(`Failed to send back-in-stock email to ${sub.email}:`, err);
      });
    }

    // Mark as notified
    await db.stockAlertSubscription.updateMany({
      where: { productId, notifiedAt: null },
      data: { notifiedAt: new Date() },
    });

    // Create admin notification
    await db.notification.create({
      data: {
        type: "system",
        title: `Manual Notification: ${product.name}`,
        message: `${subscriptions.length} customer${subscriptions.length === 1 ? "" : "s"} manually notified about back-in-stock`,
        link: "/admin/stock-alerts",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Notified ${subscriptions.length} subscriber${subscriptions.length === 1 ? "" : "s"}`,
      notifiedCount: subscriptions.length,
    });
  } catch (error) {
    console.error("Stock alerts POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
