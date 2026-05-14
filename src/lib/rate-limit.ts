// =============================================================================
// SL HUB COMPUTER - In-Memory Rate Limiter
// =============================================================================
// Purpose: Sliding window rate limiting for API route protection
// Features:
//   - Configurable limits per route type
//   - Sliding window with auto-cleanup
//   - Returns remaining count and reset time
//   - Thread-safe for serverless environments
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// Rate limit configurations per route type
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 120_000, maxRequests: 15 }, // 15 attempts per 2 minutes (mobile-friendly)
  api: { windowMs: 60_000, maxRequests: 60 },   // 60 requests per minute
  admin: { windowMs: 60_000, maxRequests: 120 }, // 120 requests per minute
  chat: { windowMs: 60_000, maxRequests: 20 },   // 20 messages per minute
};

// In-memory store: Map<key, RateLimitEntry>
const store = new Map<string, RateLimitEntry>();

// Cleanup interval - remove expired entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetTime) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Allow the timer to not prevent process exit
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

startCleanup();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a given key and route type
 * @param key - Identifier (IP address, session ID, etc.)
 * @param routeType - Type of route (auth, api, admin, chat)
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(key: string, routeType: string = "api"): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[routeType] || RATE_LIMIT_CONFIGS.api;
  const storeKey = `${routeType}:${key}`;
  const now = Date.now();

  let entry = store.get(storeKey);

  // If no entry exists or window has expired, create new entry
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    store.set(storeKey, entry);
  }

  // Increment request count
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    limit: config.maxRequests,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Determine the route type based on the request path
 */
export function getRouteType(pathname: string): string {
  // Auth routes
  if (
    pathname.startsWith("/api/admin/auth") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return "auth";
  }

  // Chat routes
  if (pathname.startsWith("/api/chat") || pathname.startsWith("/api/admin/chat")) {
    return "chat";
  }

  // Admin API routes
  if (pathname.startsWith("/api/admin")) {
    return "admin";
  }

  // General API routes
  if (pathname.startsWith("/api/")) {
    return "api";
  }

  return "api";
}

/**
 * Reset rate limit for a specific key (useful after successful auth)
 */
export function resetRateLimit(key: string, routeType: string = "auth"): void {
  const storeKey = `${routeType}:${key}`;
  store.delete(storeKey);
}
