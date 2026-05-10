// =============================================================================
// SL HUB COMPUTER - Admin Chat Management API Route
// =============================================================================
// Purpose: Admin-side chat session management
// Features:
//   - GET: List all chat sessions with last message and unread count
//   - POST: Send admin reply (sessionId, message)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/chat - List all chat sessions
// Returns: Array of sessions with name, email, last message, unread count, etc.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    // Get all distinct sessionIds with aggregated data
    const sessions = await db.chatMessage.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });

    // For each session, get customer info and unread count
    const sessionData = await Promise.all(
      sessions.map(async (session) => {
        const [lastMessage, unreadCount, firstCustomerMessage] = await Promise.all([
          db.chatMessage.findFirst({
            where: { sessionId: session.sessionId },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              message: true,
              sender: true,
              createdAt: true,
            },
          }),
          db.chatMessage.count({
            where: { sessionId: session.sessionId, sender: "customer", isRead: false },
          }),
          db.chatMessage.findFirst({
            where: { sessionId: session.sessionId, name: { not: null } },
            select: { name: true, email: true },
            orderBy: { createdAt: "asc" },
          }),
        ]);

        // Check if session is "online" (activity in last 5 minutes)
        const lastActivity = session._max.createdAt;
        const isOnline = lastActivity
          ? new Date().getTime() - new Date(lastActivity).getTime() < 5 * 60 * 1000
          : false;

        return {
          sessionId: session.sessionId,
          name: firstCustomerMessage?.name || "Visitor",
          email: firstCustomerMessage?.email || null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                message: lastMessage.message,
                sender: lastMessage.sender,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          messageCount: session._count.id,
          unreadCount,
          isOnline,
          firstActivity: session._min.createdAt?.toISOString() || null,
          lastActivity: lastActivity?.toISOString() || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: sessionData,
    });
  } catch (error) {
    console.error("Admin chat GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/chat - Send admin reply
// Body: { sessionId, message }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    // Create the admin message
    const chatMessage = await db.chatMessage.create({
      data: {
        sessionId,
        name: "SL HUB Support",
        message: message.trim(),
        sender: "admin",
        isRead: true, // Admin's own messages are read
      },
    });

    return NextResponse.json(
      { success: true, data: chatMessage, message: "Reply sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin chat POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
