// =============================================================================
// SL HUB COMPUTER - Server-Side In-Memory Cache
// =============================================================================
// Purpose: Simple in-memory cache with TTL for optimizing API response times
// Features:
//   - get(key) / set(key, value, ttl) / invalidate(pattern) / clear()
//   - Auto-cleanup of expired entries every 60 seconds
//   - Thread-safe for concurrent requests via request deduplication
//   - Default TTLs: 30s products, 5min categories/brands/services/FAQs/testimonials,
//                   2min banners/prebuilt-pcs
// =============================================================================

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

// Default TTLs in milliseconds
export const CACHE_TTL = {
  PRODUCTS: 30_000,       // 30 seconds
  CATEGORIES: 300_000,    // 5 minutes
  BRANDS: 300_000,        // 5 minutes
  BANNERS: 120_000,       // 2 minutes
  FAQS: 300_000,          // 5 minutes
  PREBUILT_PCS: 120_000,  // 2 minutes
  TESTIMONIALS: 300_000,  // 5 minutes
  SERVICES: 300_000,      // 5 minutes
} as const;

// In-memory store
const store = new Map<string, CacheEntry>();

// In-flight request deduplication: prevents concurrent requests from hitting DB
const inflightRequests = new Map<string, Promise<unknown>>();

// Cleanup interval reference
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// Auto-cleanup: runs every 60 seconds to remove expired entries
// ---------------------------------------------------------------------------
function startCleanup() {
  if (cleanupTimer) return; // already running
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.expiresAt) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Prevent the timer from keeping the process alive
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    (cleanupTimer as ReturnType<typeof setInterval> & { unref: () => void }).unref();
  }
}

// Start cleanup on module load
startCleanup();

// ---------------------------------------------------------------------------
// get: Retrieve a cached value by key
// ---------------------------------------------------------------------------
export function get<T = unknown>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

// ---------------------------------------------------------------------------
// set: Store a value with optional TTL
// ---------------------------------------------------------------------------
export function set<T = unknown>(key: string, value: T, ttl: number = CACHE_TTL.PRODUCTS): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

// ---------------------------------------------------------------------------
// invalidate: Remove entries matching a pattern (prefix-based)
// e.g., invalidate("products") removes all keys starting with "products:"
// ---------------------------------------------------------------------------
export function invalidate(pattern: string): number {
  let count = 0;
  const prefix = pattern.endsWith(":") ? pattern : `${pattern}:`;

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
      count++;
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// clear: Remove all cached entries
// ---------------------------------------------------------------------------
export function clear(): void {
  store.clear();
  inflightRequests.clear();
}

// ---------------------------------------------------------------------------
// deduplicatedFetch: Prevents concurrent identical DB queries
// If a request for the same key is already in-flight, returns the same promise
// ---------------------------------------------------------------------------
export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCTS
): Promise<T> {
  // Check cache first
  const cached = get<T>(key);
  if (cached !== null) return cached;

  // Check if a request is already in-flight
  const inflight = inflightRequests.get(key) as Promise<T> | undefined;
  if (inflight) return inflight;

  // Create new fetch promise
  const fetchPromise = fetcher()
    .then((result) => {
      set(key, result, ttl);
      inflightRequests.delete(key);
      return result;
    })
    .catch((error) => {
      inflightRequests.delete(key);
      throw error;
    });

  inflightRequests.set(key, fetchPromise);
  return fetchPromise;
}

// ---------------------------------------------------------------------------
// buildCacheKey: Creates a unique cache key from a prefix and query params
// ---------------------------------------------------------------------------
export function buildCacheKey(prefix: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const sortedEntries = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);

  return sortedEntries.length > 0 ? `${prefix}:${sortedEntries.join("&")}` : `${prefix}:all`;
}

// ---------------------------------------------------------------------------
// stats: Get cache statistics (useful for debugging)
// ---------------------------------------------------------------------------
export function stats(): { size: number; keys: string[]; inflight: number } {
  return {
    size: store.size,
    keys: Array.from(store.keys()),
    inflight: inflightRequests.size,
  };
}
