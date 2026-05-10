// =============================================================================
// SL HUB COMPUTER - Input Sanitization Library
// =============================================================================
// Purpose: Prevent XSS, injection attacks, and validate user input
// Features:
//   - sanitizeHtml: Strip dangerous HTML tags
//   - sanitizeString: Trim and escape special characters
//   - sanitizeSql: Basic SQL injection prevention (defense in depth)
//   - validateEmail: Strict email validation
//   - validatePhone: Sri Lankan phone number validation
//   - validateUrl: URL validation
// =============================================================================

// Dangerous HTML tags to strip
const DANGEROUS_TAGS = [
  "script", "iframe", "object", "embed", "form", "input",
  "textarea", "select", "button", "link", "meta", "style",
  "base", "applet", "body", "html", "head", "svg",
];

// Dangerous attributes to remove
const DANGEROUS_ATTRS = [
  "onload", "onerror", "onclick", "onmouseover", "onmouseout",
  "onfocus", "onblur", "onsubmit", "onreset", "onchange",
  "oninput", "onkeydown", "onkeyup", "onkeypress",
  "onabort", "oncanplay", "oncontextmenu", "ondrag",
  "onanimationend", "ontransitionend", "onwheel",
];

/**
 * Sanitize HTML input - strip dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input;

  // Remove dangerous tags and their content
  for (const tag of DANGEROUS_TAGS) {
    const openRegex = new RegExp(`<${tag}[^>]*>`, "gi");
    const closeRegex = new RegExp(`</${tag}>`, "gi");
    const selfCloseRegex = new RegExp(`<${tag}[^>]*/>`, "gi");
    sanitized = sanitized.replace(openRegex, "");
    sanitized = sanitized.replace(closeRegex, "");
    sanitized = sanitized.replace(selfCloseRegex, "");
  }

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, "");

  // Remove data: URLs (can contain executable content)
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, "");

  // Remove dangerous event handler attributes
  for (const attr of DANGEROUS_ATTRS) {
    const attrRegex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, "gi");
    sanitized = sanitized.replace(attrRegex, "");
    // Also handle unquoted attributes
    const unquotedRegex = new RegExp(`\\s*${attr}\\s*=\\s*\\S+`, "gi");
    sanitized = sanitized.replace(unquotedRegex, "");
  }

  return sanitized.trim();
}

/**
 * Sanitize a plain string - trim and escape special characters
 */
export function sanitizeString(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return String(input).trim();

  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize string for storage (escape but keep readable)
 * Use this for data going into the database that will be displayed later
 */
export function sanitizeForStorage(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return String(input).trim();

  // Remove null bytes and control characters
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Basic SQL injection prevention (defense in depth - Prisma handles parameterization)
 * Still useful for any raw queries or log messages
 */
export function sanitizeSql(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = typeof input === "string" ? input : String(input);

  return str
    .trim()
    .replace(/['";\\]/g, "")
    .replace(/(--|\/\*|\*\/|xp_|sp_)/gi, "")
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE|EXEC|EXECUTE)\b/gi, "");
}

/**
 * Strict email validation
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email is required" };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  // RFC 5322 compliant regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check for common patterns in spam emails
  if (trimmed.includes("..") || trimmed.startsWith(".") || trimmed.endsWith(".")) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Sri Lankan phone number validation
 * Accepts formats: 07X XXXXXXX, +94 7X XXXXXXX, 94 7X XXXXXXX
 */
export function validatePhone(phone: string): { valid: boolean; error?: string; formatted?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" };
  }

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Sri Lankan mobile patterns
  const patterns = [
    /^07[0-9]{8}$/,        // 07XXXXXXXX (10 digits)
    /^\+947[0-9]{8}$/,     // +947XXXXXXXX (12 digits with +)
    /^947[0-9]{8}$/,       // 947XXXXXXXX (11 digits)
  ];

  let matched = false;
  let formatted = cleaned;

  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      matched = true;
      // Format to 07XXXXXXXX
      if (cleaned.startsWith("+94")) {
        formatted = "0" + cleaned.substring(3);
      } else if (cleaned.startsWith("94")) {
        formatted = "0" + cleaned.substring(2);
      }
      break;
    }
  }

  // Also accept landline numbers (0XX XXXXXXX)
  if (!matched) {
    const landlinePattern = /^0[1-9][0-9]{8}$/;
    if (landlinePattern.test(cleaned)) {
      matched = true;
      formatted = cleaned;
    }
  }

  if (!matched) {
    return { valid: false, error: "Invalid Sri Lankan phone number (use 07XXXXXXXX or +947XXXXXXXX)" };
  }

  return { valid: true, formatted };
}

/**
 * URL validation
 */
export function validateUrl(url: string): { valid: boolean; error?: string; normalized?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "URL is required" };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: "URL is too long" };
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    return { valid: true, normalized: parsed.href };
  } catch {
    // Try adding https:// prefix
    try {
      const withProtocol = new URL(`https://${trimmed}`);
      return { valid: true, normalized: withProtocol.href };
    } catch {
      return { valid: false, error: "Invalid URL format" };
    }
  }
}

/**
 * Sanitize an object's string fields for storage
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeForStorage(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
