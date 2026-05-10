// =============================================================================
// SL HUB COMPUTER - Admin Notifications API Route
// =============================================================================
// Purpose: CRUD operations for admin Notification model
// Features:
//   - GET: Fetch unread notifications (with optional type filter)
//   - POST: Create a new notification (for internal system use)
//   - PUT: Mark notification(s) as read
// API:
//   GET  /api/admin/notifications?unread=true&type=order
//   POST /api/admin/notifications { type, title, message, link }
//   PUT  /api/admin/notifications { id } or { markAll: true }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/notifications - Fetch notifications
// Query params:
//   unread: "true" to fetch only unread notifications
//   type: filter by notification type (order, message, review, stock, coupon, system)
//   limit: max results (default 20)
//   includeCount: "true" to include total unread count
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const type = searchParams.get("type");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const includeCount = searchParams.get("includeCount") === "true";

    const where: {
      isRead?: boolean;
      type?: string;
    } = {};

    if (unreadOnly) {
      where.isRead = false;
    }
    if (type) {
      where.type = type;
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      includeCount
        ? db.notification.count({ where: { isRead: false } })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/notifications - Create a new notification
// Body: { type, title, message, link? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, link } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "type, title, and message are required" },
        { status: 400 }
      );
    }

    const validTypes = ["order", "message", "review", "stock", "coupon", "system"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        link: link || null,
      },
    });

    return NextResponse.json(
      { success: true, data: notification, message: "Notification created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Notification POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/notifications - Mark notification(s) as read
// Body: { id: string } or { markAll: true }
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      // Mark all unread notifications as read
      const result = await db.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: `Marked ${result.count} notifications as read`,
        count: result.count,
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provide 'id' or set 'markAll' to true" },
        { status: 400 }
      );
    }

    // Mark a single notification as read
    const notification = await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Notification PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
