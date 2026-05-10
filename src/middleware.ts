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
import { updateSession } from "@/utils/supabase/middleware";
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
  
  // Refresh Supabase session
  const supabaseResponse = await updateSession(request);

  // -----------------------------------------------------------------------
  // Allow auth API routes (login, logout, verify) without authentication
  // -----------------------------------------------------------------------
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    // Still apply rate limiting to auth routes
    const ip = getClientIP(request);
    const routeType = getRouteType(pathname);
    const rateLimitResult = checkRateLimit(ip, routeType);

    if (!rateLimitResult.allowed) {
      const errorResponse = NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      errorResponse.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
      errorResponse.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
      errorResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
      errorResponse.headers.set("Retry-After", String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)));
      // Copy cookies from supabaseResponse
      supabaseResponse.cookies.getAll().forEach(cookie => {
        errorResponse.cookies.set(cookie.name, cookie.value);
      });
      return errorResponse;
    }

    supabaseResponse.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    supabaseResponse.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    supabaseResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
    return supabaseResponse;
  }

  // -----------------------------------------------------------------------
  // Rate Limiting for all API routes
  // -----------------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(request);
    const routeType = getRouteType(pathname);
    const rateLimitResult = checkRateLimit(ip, routeType);

    if (!rateLimitResult.allowed) {
      const errorResponse = NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      errorResponse.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
      errorResponse.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
      errorResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
      errorResponse.headers.set("Retry-After", String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)));
      // Copy cookies from supabaseResponse
      supabaseResponse.cookies.getAll().forEach(cookie => {
        errorResponse.cookies.set(cookie.name, cookie.value);
      });
      return errorResponse;
    }

    // -------------------------------------------------------------------
    // CSRF Validation for state-changing requests on non-skip routes
    // Uses double-submit cookie pattern (cookie + header must match)
    // -------------------------------------------------------------------
    if (requiresCsrfValidation(request.method) && !shouldSkipCsrf(pathname)) {
      const csrfCookie = request.cookies.get(getCsrfCookieName())?.value;
      const csrfHeader = request.headers.get(getCsrfHeaderName());

      if (!csrfCookie || !csrfHeader) {
        const errorResponse = NextResponse.json(
          { success: false, error: "CSRF token missing" },
          { status: 403 }
        );
        supabaseResponse.cookies.getAll().forEach(cookie => {
          errorResponse.cookies.set(cookie.name, cookie.value);
        });
        return errorResponse;
      }

      if (!validateCsrfToken(csrfCookie, csrfHeader)) {
        const errorResponse = NextResponse.json(
          { success: false, error: "CSRF token validation failed" },
          { status: 403 }
        );
        supabaseResponse.cookies.getAll().forEach(cookie => {
          errorResponse.cookies.set(cookie.name, cookie.value);
        });
        return errorResponse;
      }
    }

    supabaseResponse.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    supabaseResponse.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    supabaseResponse.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetTime / 1000)));
    return supabaseResponse;
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
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
    return supabaseResponse;
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
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    return supabaseResponse;
  }

  // -----------------------------------------------------------------------
  // All other routes pass through
  // -----------------------------------------------------------------------
  return supabaseResponse;
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
