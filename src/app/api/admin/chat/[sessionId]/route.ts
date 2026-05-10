// =============================================================================
// SL HUB COMPUTER - Admin Chat Session Detail API Route
// =============================================================================
// Purpose: Manage individual chat sessions
// Features:
//   - GET: Get all messages for a session
//   - PUT: Mark session messages as read
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/chat/[sessionId] - Get all messages for a session
// ---------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Chat session GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/chat/[sessionId] - Mark session messages as read
// ---------------------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Mark all customer messages in this session as read
    const result = await db.chatMessage.updateMany({
      where: { sessionId, sender: "customer", isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} messages as read`,
      count: result.count,
    });
  } catch (error) {
    console.error("Chat session PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
