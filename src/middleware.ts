// =============================================================================
// SL HUB COMPUTER - Next.js Middleware
// =============================================================================
// Purpose: Protect all /admin/* routes with cookie-based authentication
// Features:
//   - Checks for `admin-token` cookie on all /admin routes
//   - Allows /admin/login without authentication
//   - Allows /api/admin/auth/* routes for login/logout/verify
//   - Redirects unauthenticated users to /admin/login
//   - Preserves the intended URL in a `from` query param for post-login redirect
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin-token";
const LOGIN_PATH = "/admin/login";
const ADMIN_PREFIX = "/admin";
const AUTH_API_PREFIX = "/api/admin/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -----------------------------------------------------------------------
  // Allow auth API routes (login, logout, verify) without authentication
  // -----------------------------------------------------------------------
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next();
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

export const config = {
  matcher: [
    /*
     * Match all admin routes and auth API routes:
     * - /admin
     * - /admin/:path*
     * - /api/admin/auth/:path*
     */
    "/admin",
    "/admin/:path*",
    "/api/admin/auth/:path*",
  ],
};
