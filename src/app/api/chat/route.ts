// =============================================================================
// SL HUB COMPUTER - Customer Chat API Route
// =============================================================================
// Purpose: Handle customer-side chat messages
// Features:
//   - GET: Fetch messages for a session (?sessionId=xxx)
//   - POST: Send a message (sessionId, name, email, message, sender=customer)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/chat?sessionId=xxx - Fetch messages for a session
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    // Count unread messages from admin
    const unreadCount = await db.chatMessage.count({
      where: { sessionId, sender: "admin", isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/chat - Send a customer message
// Body: { sessionId, name?, email?, message }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, name, email, message } = body;

    if (!sessionId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    // Create the customer message
    const chatMessage = await db.chatMessage.create({
      data: {
        sessionId,
        name: name?.trim() || null,
        email: email?.trim() || null,
        message: message.trim(),
        sender: "customer",
        isRead: false,
      },
    });

    // Create a notification for admin
    try {
      await db.notification.create({
        data: {
          type: "message",
          title: `New chat message`,
          message: name
            ? `${name}: ${message.trim().substring(0, 80)}`
            : `Visitor: ${message.trim().substring(0, 80)}`,
          link: "/admin/chat",
        },
      });
    } catch {
      // Notification creation is non-critical
    }

    return NextResponse.json(
      { success: true, data: chatMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
