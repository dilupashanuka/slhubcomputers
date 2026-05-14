// =============================================================================
// SL HUB COMPUTER - Clear All Auto-Blocked IPs
// =============================================================================
// POST /api/admin/security/clear-blocks - Remove all auto-blocked IPs
// Use this when mobile users can't login due to shared IP blocking
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Delete all auto-blocked IPs (not manually blocked ones)
    const result = await db.blockedIP.deleteMany({
      where: { autoBlocked: true },
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} auto-blocked IP(s). Users can now login.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Failed to clear auto-blocks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear auto-blocked IPs" },
      { status: 500 }
    );
  }
}
