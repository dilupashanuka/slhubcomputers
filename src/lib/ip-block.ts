// =============================================================================
// SL HUB COMPUTER - IP Blocking Library
// =============================================================================
// Purpose: Block malicious IPs and auto-block after failed auth attempts
// Features:
//   - Check if IP is blocked
//   - Auto-block after too many failed auth attempts
//   - Log blocked attempts
//   - Graceful fallbacks when database unavailable
// =============================================================================

import { db } from "@/lib/db";

// In-memory fallback for when database is unavailable
const memoryBlockedIPs = new Map<string, { reason: string; expiresAt: number }>();
const failedAuthAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_FAILED_ATTEMPTS = 10;               // 10 attempts before blocking
const AUTO_BLOCK_DURATION = 5 * 60 * 1000;    // 5 minutes block
const FAILED_ATTEMPTS_WINDOW = 15 * 60 * 1000; // 15 minute window

/**
 * Check if an IP address is currently blocked
 * Checks both database and in-memory store
 */
export async function isIPBlocked(ip: string): Promise<{ blocked: boolean; reason?: string; expiresAt?: Date }> {
  // Check in-memory store first (fast)
  const memBlocked = memoryBlockedIPs.get(ip);
  if (memBlocked) {
    if (Date.now() < memBlocked.expiresAt) {
      return { blocked: true, reason: memBlocked.reason, expiresAt: new Date(memBlocked.expiresAt) };
    }
    memoryBlockedIPs.delete(ip);
  }

  // Check database
  try {
    const blocked = await db.blockedIP.findUnique({ where: { ip } });
    if (blocked) {
      // Check if block has expired
      if (blocked.expiresAt && new Date() > blocked.expiresAt) {
        // Auto-unblock expired entries
        await db.blockedIP.delete({ where: { ip } }).catch(() => {});
        return { blocked: false };
      }
      return { blocked: true, reason: blocked.reason || undefined, expiresAt: blocked.expiresAt || undefined };
    }
  } catch (error) {
    console.error("IP block check database error:", error);
    // Fallback to in-memory only
  }

  return { blocked: false };
}

/**
 * Record a failed authentication attempt for an IP
 * Auto-blocks after MAX_FAILED_ATTEMPTS within the window
 */
export async function recordFailedAuthAttempt(ip: string): Promise<{ blocked: boolean; attempts: number }> {
  const now = Date.now();
  const entry = failedAuthAttempts.get(ip);

  let count = 1;
  if (entry) {
    // Reset count if outside the window
    if (now - entry.lastAttempt > FAILED_ATTEMPTS_WINDOW) {
      count = 1;
    } else {
      count = entry.count + 1;
    }
  }

  failedAuthAttempts.set(ip, { count, lastAttempt: now });

  // Auto-block if too many failed attempts
  if (count >= MAX_FAILED_ATTEMPTS) {
    const expiresAt = now + AUTO_BLOCK_DURATION;
    const reason = `Auto-blocked: ${count} failed login attempts`;

    // Add to in-memory store
    memoryBlockedIPs.set(ip, { reason, expiresAt });

    // Add to database
    try {
      await db.blockedIP.upsert({
        where: { ip },
        update: {
          reason,
          autoBlocked: true,
          expiresAt: new Date(expiresAt),
        },
        create: {
          ip,
          reason,
          autoBlocked: true,
          expiresAt: new Date(expiresAt),
        },
      });
    } catch (error) {
      console.error("Failed to auto-block IP in database:", error);
    }

    // Reset the counter after blocking
    failedAuthAttempts.delete(ip);

    return { blocked: true, attempts: count };
  }

  return { blocked: false, attempts: count };
}

/**
 * Reset failed auth attempts for an IP (after successful login)
 */
export function resetFailedAuthAttempts(ip: string): void {
  failedAuthAttempts.delete(ip);
}

/**
 * Block an IP address manually
 */
export async function blockIP(
  ip: string,
  reason?: string,
  blockedBy?: string,
  durationMs?: number
): Promise<{ success: boolean }> {
  const expiresAt = durationMs ? new Date(Date.now() + durationMs) : null;

  // Add to in-memory store
  memoryBlockedIPs.set(ip, {
    reason: reason || "Manually blocked",
    expiresAt: expiresAt?.getTime() || Date.now() + 365 * 24 * 60 * 60 * 1000, // Default 1 year if permanent
  });

  // Add to database
  try {
    await db.blockedIP.upsert({
      where: { ip },
      update: {
        reason: reason || "Manually blocked",
        blockedBy: blockedBy || "admin",
        autoBlocked: false,
        expiresAt,
      },
      create: {
        ip,
        reason: reason || "Manually blocked",
        blockedBy: blockedBy || "admin",
        autoBlocked: false,
        expiresAt,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to block IP in database:", error);
    // In-memory block still active
    return { success: true };
  }
}

/**
 * Unblock an IP address
 */
export async function unblockIP(ip: string): Promise<{ success: boolean }> {
  // Remove from in-memory store
  memoryBlockedIPs.delete(ip);
  failedAuthAttempts.delete(ip);

  // Remove from database
  try {
    await db.blockedIP.delete({ where: { ip } }).catch(() => {});
  } catch (error) {
    console.error("Failed to unblock IP in database:", error);
  }

  return { success: true };
}

/**
 * Get all blocked IPs
 */
export async function getBlockedIPs(): Promise<Array<{
  ip: string;
  reason: string | null;
  blockedBy: string | null;
  autoBlocked: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}>> {
  try {
    const blocked = await db.blockedIP.findMany({
      orderBy: { createdAt: "desc" },
    });
    return blocked;
  } catch (error) {
    console.error("Failed to get blocked IPs from database:", error);
    // Return in-memory entries as fallback
    const entries: Array<{
      ip: string;
      reason: string | null;
      blockedBy: string | null;
      autoBlocked: boolean;
      expiresAt: Date | null;
      createdAt: Date;
    }> = [];
    for (const [ip, entry] of memoryBlockedIPs.entries()) {
      entries.push({
        ip,
        reason: entry.reason,
        blockedBy: null,
        autoBlocked: true,
        expiresAt: new Date(entry.expiresAt),
        createdAt: new Date(),
      });
    }
    return entries;
  }
}

/**
 * Clean up expired IP blocks (can be called periodically)
 */
export async function cleanupExpiredBlocks(): Promise<number> {
  const now = new Date();
  let cleaned = 0;

  // Clean in-memory
  for (const [ip, entry] of memoryBlockedIPs.entries()) {
    if (Date.now() >= entry.expiresAt) {
      memoryBlockedIPs.delete(ip);
      cleaned++;
    }
  }

  // Clean database
  try {
    const result = await db.blockedIP.deleteMany({
      where: {
        expiresAt: { not: null, lt: now },
      },
    });
    cleaned += result.count;
  } catch (error) {
    console.error("Failed to cleanup expired IP blocks:", error);
  }

  return cleaned;
}
