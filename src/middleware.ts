// =============================================================================
// SL HUB COMPUTER - Next.js Middleware (Edge Runtime Compatible)
// =============================================================================
// Purpose: Protect all /admin/* routes with cookie-based authentication
// Features:
//   - Checks for `admin-token` cookie on all /admin routes
//   - Allows /admin/login without authentication
//   - Allows /api/admin/auth/* routes for login/logout/verify
//   - Redirects unauthenticated users to /admin/login
//   - Preserves the intended URL in a `from` query param for post-login redirect
//   - Rate limiting on all API routes with configurable limits
//   - CSRF token validation on state-changing requests
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRouteType } from "@/lib/rate-limit";
import {
  shouldSkipCsrf,
  requiresCsrfValidation,
  getCsrfCookieName,
  getCsrfHeaderName,
  validateCsrfToken,
} from "@/lib/csrf";

const COOKIE_NAME = "admin-token";
const LOGIN_PATH = "/admin/login";
const ADMIN_PREFIX = "/admin";
const AUTH_API_PREFIX = "/api/admin/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -----------------------------------------------------------------------
  // Allow auth API routes (login, logout, verify) without authentication
  // -----------------------------------------------------------------------
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    // Still apply rate limiting to auth routes
    const ip = getClientIP(request);
    const routeType = getRouteType(pathname);
    const rateLimitResult = checkRateLimit(ip, routeType);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
      response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
      response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
      response.headers.set("Retry-After", String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)));
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
    return response;
  }

  // -----------------------------------------------------------------------
  // Rate Limiting for all API routes
  // -----------------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(request);
    const routeType = getRouteType(pathname);
    const rateLimitResult = checkRateLimit(ip, routeType);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
      response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
      response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
      response.headers.set("Retry-After", String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)));
      return response;
    }

    // -------------------------------------------------------------------
    // CSRF Validation for state-changing requests on non-skip routes
    // Uses double-submit cookie pattern (cookie + header must match)
    // -------------------------------------------------------------------
    if (requiresCsrfValidation(request.method) && !shouldSkipCsrf(pathname)) {
      const csrfCookie = request.cookies.get(getCsrfCookieName())?.value;
      const csrfHeader = request.headers.get(getCsrfHeaderName());

      if (!csrfCookie || !csrfHeader) {
        return NextResponse.json(
          { success: false, error: "CSRF token missing" },
          { status: 403 }
        );
      }

      if (!validateCsrfToken(csrfCookie, csrfHeader)) {
        return NextResponse.json(
          { success: false, error: "CSRF token validation failed" },
          { status: 403 }
        );
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
    return response;
  }

  // -----------------------------------------------------------------------
  // Allow the login page itself without authentication
  // -----------------------------------------------------------------------
  if (pathname === LOGIN_PATH) {
    // If already authenticated, redirect to admin dashboard
    const token = request.cookies.get(COOKIE_NAME);
    if (token && token.value) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_PREFIX;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------
  // Protect all other /admin routes
  // -----------------------------------------------------------------------
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const token = request.cookies.get(COOKIE_NAME);

    if (!token || !token.value) {
      // Not authenticated - redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // -----------------------------------------------------------------------
  // All other routes pass through
  // -----------------------------------------------------------------------
  return NextResponse.next();
}

/**
 * Get client IP address from request
 * Checks various headers that might contain the real IP (proxy, CDN, etc.)
 */
function getClientIP(request: NextRequest): string {
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "x-cluster-client-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(",")[0].trim();
      if (ip) return ip;
    }
  }

  return "unknown";
}

export const config = {
  matcher: [
    /*
     * Match all routes for rate limiting and security:
     * - /admin
     * - /admin/:path*
     * - /api/admin/auth/:path*
     * - /api/:path* (for rate limiting)
     */
    "/admin",
    "/admin/:path*",
    "/api/:path*",
  ],
};
