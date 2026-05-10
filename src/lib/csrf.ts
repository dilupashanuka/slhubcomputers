// =============================================================================
// SL HUB COMPUTER - CSRF Protection Library (Edge Runtime Compatible)
// =============================================================================
// Purpose: Generate and validate CSRF tokens for state-changing requests
// Features:
//   - Token generation using Web Crypto API (Edge Runtime compatible)
//   - Double-submit cookie pattern (cookie + header validation)
//   - Skip validation for routes using other auth (admin token)
//   - No Node.js crypto dependency - works in Edge Runtime
// =============================================================================

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a new CSRF token using Web Crypto API (Edge Runtime compatible)
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID() + "-" + crypto.randomUUID();
}

/**
 * Get the CSRF cookie name
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

/**
 * Get the CSRF header name
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Check if a route should skip CSRF validation
 * Routes that use other authentication (admin token, etc.) can skip CSRF
 */
export function shouldSkipCsrf(pathname: string): boolean {
  // Admin API routes use admin-token cookie for auth
  if (pathname.startsWith("/api/admin")) return true;

  // Auth routes don't need CSRF (login/register have no session yet)
  if (pathname.startsWith("/api/auth")) return true;

  // Webhook routes
  if (pathname.startsWith("/api/webhook")) return true;

  // Analytics tracking
  if (pathname.startsWith("/api/analytics")) return true;

  // Shipping calculator (public read-only calculation)
  if (pathname.startsWith("/api/shipping")) return true;

  // Seed route
  if (pathname.startsWith("/api/seed")) return true;

  return false;
}

/**
 * Check if the request method requires CSRF validation
 */
export function requiresCsrfValidation(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

/**
 * Validate CSRF token using double-submit cookie pattern
 * Compares the CSRF cookie value with the CSRF header value
 * This is a stateless approach that works in Edge Runtime
 */
export function validateCsrfToken(cookieValue: string, headerValue: string): boolean {
  if (!cookieValue || !headerValue) return false;

  // Simple string comparison for double-submit pattern
  // Both values should be identical
  if (cookieValue.length !== headerValue.length) return false;

  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < cookieValue.length; i++) {
    result |= cookieValue.charCodeAt(i) ^ headerValue.charCodeAt(i);
  }
  return result === 0;
}
