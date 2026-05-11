// =============================================================================
// SL HUB COMPUTER - Service Worker
// =============================================================================
// Purpose: Offline caching and PWA support
// Strategy: Cache-first for static assets, Network-first for API calls
// =============================================================================

const CACHE_NAME = "sl-hub-v2";
const STATIC_CACHE = "sl-hub-static-v2";
const DYNAMIC_CACHE = "sl-hub-dynamic-v2";

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.ico",
  "/logo.svg",
];

// Install event - pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some static assets failed to cache:", err);
      });
    })
  );
  // Activate immediately without waiting
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name !== CACHE_NAME &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE
          )
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  // Skip Next.js hot reload and dev requests
  if (url.pathname.includes("/_next/") && url.pathname.includes(".hot-update")) return;

  // Network-first strategy for API calls and navigation
  if (url.pathname.startsWith("/api/") || request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets (CSS, JS, images, fonts)
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/) ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/uploads/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first for everything else
  event.respondWith(networkFirst(request));
});

// Cache-first strategy: check cache first, fall back to network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // If offline and not in cache, return offline fallback for images
    if (request.destination === "image") {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1e293b" width="200" height="200"/><text fill="#475569" font-family="sans-serif" font-size="14" x="100" y="105" text-anchor="middle">Offline</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

// Network-first strategy: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Offline fallback for navigation requests
    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }

    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}
