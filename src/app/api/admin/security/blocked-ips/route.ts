// =============================================================================
// SL HUB COMPUTER - Blocked IPs Admin API
// =============================================================================
// Purpose: Manage blocked IP addresses
// Features:
//   - GET: List all blocked IPs
//   - POST: Block an IP address
//   - DELETE: Unblock an IP address
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getBlockedIPs, blockIP, unblockIP } from "@/lib/ip-block";
import { sanitizeForStorage } from "@/lib/sanitize";

// ---------------------------------------------------------------------------
// GET /api/admin/security/blocked-ips - List all blocked IPs
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const blockedIPs = await getBlockedIPs();

    // Filter out expired entries
    const now = new Date();
    const activeIPs = blockedIPs.filter(
      (entry) => !entry.expiresAt || entry.expiresAt > now
    );

    return NextResponse.json({
      success: true,
      data: activeIPs,
    });
  } catch (error) {
    console.error("Failed to fetch blocked IPs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blocked IPs" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/security/blocked-ips - Block an IP address
// Body: { ip, reason?, durationMs? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, reason, durationMs } = body;

    if (!ip || typeof ip !== "string") {
      return NextResponse.json(
        { success: false, error: "IP address is required" },
        { status: 400 }
      );
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const sanitizedIP = sanitizeForStorage(ip.trim());

    if (!ipRegex.test(sanitizedIP)) {
      return NextResponse.json(
        { success: false, error: "Invalid IP address format" },
        { status: 400 }
      );
    }

    const sanitizedReason = reason ? sanitizeForStorage(String(reason)) : undefined;
    const parsedDuration = durationMs ? Number(durationMs) : undefined;

    await blockIP(sanitizedIP, sanitizedReason, "admin", parsedDuration);

    return NextResponse.json({
      success: true,
      message: `IP ${sanitizedIP} has been blocked`,
    });
  } catch (error) {
    console.error("Failed to block IP:", error);
    return NextResponse.json(
      { success: false, error: "Failed to block IP address" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/security/blocked-ips - Unblock an IP address
// Body: { ip }
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip } = body;

    if (!ip || typeof ip !== "string") {
      return NextResponse.json(
        { success: false, error: "IP address is required" },
        { status: 400 }
      );
    }

    const sanitizedIP = sanitizeForStorage(ip.trim());

    await unblockIP(sanitizedIP);

    return NextResponse.json({
      success: true,
      message: `IP ${sanitizedIP} has been unblocked`,
    });
  } catch (error) {
    console.error("Failed to unblock IP:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unblock IP address" },
      { status: 500 }
    );
  }
}
