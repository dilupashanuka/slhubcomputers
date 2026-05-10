// =============================================================================
// SL HUB COMPUTER - Admin AI Settings API Route
// =============================================================================
// Purpose: CRUD for AI chatbot configuration
// Features:
//   - GET: Fetch AI settings
//   - PUT: Update AI settings (enabled, model, temperature, welcome/fallback messages)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/ai-settings - Fetch AI chat settings
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    let settings = await db.aISettings.findUnique({
      where: { id: "ai-settings" },
    });

    if (!settings) {
      settings = await db.aISettings.create({
        data: { id: "ai-settings" },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("AI Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI settings" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/ai-settings - Update AI chat settings
// Body: { enabled?, model?, temperature?, welcomeMessage?, fallbackMessage?, maxMessagesPerDay? }
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, model, temperature, welcomeMessage, fallbackMessage, maxMessagesPerDay } = body;

    // Ensure settings record exists
    let settings = await db.aISettings.findUnique({
      where: { id: "ai-settings" },
    });

    if (!settings) {
      settings = await db.aISettings.create({
        data: { id: "ai-settings" },
      });
    }

    // Update with provided values
    const updateData: Record<string, unknown> = {};
    if (typeof enabled === "boolean") updateData.enabled = enabled;
    if (model && typeof model === "string") updateData.model = sanitizeForStorage(model);
    if (typeof temperature === "number" && temperature >= 0 && temperature <= 2) {
      updateData.temperature = temperature;
    }
    if (welcomeMessage && typeof welcomeMessage === "string") {
      updateData.welcomeMessage = sanitizeForStorage(welcomeMessage);
    }
    if (fallbackMessage && typeof fallbackMessage === "string") {
      updateData.fallbackMessage = sanitizeForStorage(fallbackMessage);
    }
    if (typeof maxMessagesPerDay === "number" && maxMessagesPerDay >= 1 && maxMessagesPerDay <= 100) {
      updateData.maxMessagesPerDay = maxMessagesPerDay;
    }

    const updated = await db.aISettings.update({
      where: { id: "ai-settings" },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("AI Settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update AI settings" },
      { status: 500 }
    );
  }
}
