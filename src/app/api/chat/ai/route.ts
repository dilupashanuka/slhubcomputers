// =============================================================================
// SL HUB COMPUTER - AI Chat API Route
// =============================================================================
// Purpose: AI-powered chat response endpoint
// Features:
//   - POST: Process customer message and return AI/FAQ/fallback response
//   - Rate limiting: 20 AI messages per session per day
//   - FAQ matching with fuzzy keyword search
//   - AI response generation using z-ai-web-dev-sdk
//   - Saves AI response as chat message for history
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";
import { processAIChat, checkRateLimit, getAISettings } from "@/lib/ai-chat";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/chat/ai - Process a customer message with AI
// Body: { sessionId, message, name?, email? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, name, email } = body;

    if (!sessionId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    const sanitizedSessionId = sanitizeForStorage(sessionId);
    const sanitizedMessage = sanitizeForStorage(message.trim());

    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Check rate limit first
    const rateCheck = await checkRateLimit(sanitizedSessionId);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: true,
        data: {
          response: "You've reached the daily AI chat limit. Please contact us at 071 067 8944 for further help.",
          source: "fallback",
          remaining: 0,
        },
      });
    }

    // Get AI settings to check if enabled
    const settings = await getAISettings();

    // Save the customer message
    const customerMessage = await db.chatMessage.create({
      data: {
        sessionId: sanitizedSessionId,
        name: name?.trim() ? sanitizeForStorage(name.trim()) : null,
        email: email?.trim() ? sanitizeForStorage(email.trim()) : null,
        message: sanitizedMessage,
        sender: "customer",
        isRead: true, // AI already "read" it
      },
    });

    // Process with AI
    const result = await processAIChat(sanitizedMessage, sanitizedSessionId);

    // Save the AI response as a chat message
    const aiMessage = await db.chatMessage.create({
      data: {
        sessionId: sanitizedSessionId,
        name: "AI Assistant",
        message: result.response,
        sender: "ai_bot",
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        customerMessage,
        aiMessage,
        source: result.source,
        remaining: rateCheck.remaining - 1,
        aiEnabled: settings.enabled,
      },
    });
  } catch (error) {
    console.error("AI Chat POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process AI chat message" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/chat/ai?sessionId=xxx - Get AI settings and rate limit status
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const settings = await getAISettings();

    let remaining = settings.maxMessagesPerDay;
    if (sessionId) {
      const rateCheck = await checkRateLimit(sanitizeForStorage(sessionId));
      remaining = rateCheck.remaining;
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: settings.enabled,
        welcomeMessage: settings.welcomeMessage,
        fallbackMessage: settings.fallbackMessage,
        remaining,
        maxPerDay: settings.maxMessagesPerDay,
      },
    });
  } catch (error) {
    console.error("AI Chat GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI settings" },
      { status: 500 }
    );
  }
}
