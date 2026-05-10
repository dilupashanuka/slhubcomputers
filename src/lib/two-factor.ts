// =============================================================================
// SL HUB COMPUTER - Two-Factor Authentication (TOTP) Library
// =============================================================================
// Purpose: TOTP-based 2FA for admin accounts
// Features:
//   - Generate TOTP secrets (Base32 encoded)
//   - Generate QR code URLs for authenticator apps
//   - Verify TOTP codes (6-digit, 30-second window, allow 1 drift)
//   - Backup codes generation (10 single-use codes)
//   - Uses Node.js crypto module (no external TOTP library)
// =============================================================================

import { createHmac, randomBytes, createHash } from "crypto";

// TOTP Configuration
const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;
const TOTP_DRIFT = 1; // Allow 1 period drift (before and after)

// Base32 character set (RFC 4648)
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encode a buffer to Base32 string
 */
function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let result = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    result += BASE32_CHARS[parseInt(chunk, 2)];
  }

  return result;
}

/**
 * Generate a new TOTP secret (Base32 encoded, 160 bits)
 */
export function generateTOTPSecret(): string {
  const secret = randomBytes(20); // 160 bits
  return base32Encode(secret);
}

/**
 * Generate the otpauth:// URL for QR code scanning
 * Format: otpauth://totp/SLHUB:admin?secret=XXX&issuer=SLHUB
 */
export function generateQRCodeUrl(secret: string, label: string = "admin"): string {
  const encodedLabel = encodeURIComponent(`SLHUB:${label}`);
  const encodedIssuer = encodeURIComponent("SLHUB");
  return `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}`;
}

/**
 * Calculate TOTP code for a given secret and time
 */
function calculateTOTP(secret: string, timeCounter: number): string {
  // Decode Base32 secret to buffer
  const secretBuffer = base32Decode(secret);

  // Convert time counter to 8-byte buffer (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(0, 0);
  counterBuffer.writeUInt32BE(timeCounter, 4);

  // Calculate HMAC-SHA1
  const hmac = createHmac("sha1", secretBuffer);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Decode a Base32 string to buffer
 */
function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[=]+$/, "");
  const lookup: Record<string, number> = {};
  for (let i = 0; i < BASE32_CHARS.length; i++) {
    lookup[BASE32_CHARS[i]] = i;
  }

  let bits = "";
  for (const char of cleaned) {
    if (!(char in lookup)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    bits += lookup[char].toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

/**
 * Get current time counter for TOTP
 */
function getTimeCounter(drift: number = 0): number {
  return Math.floor(Date.now() / 1000 / TOTP_PERIOD) + drift;
}

/**
 * Verify a TOTP code against a secret
 * Allows 1 period drift (before and after current time)
 */
export function verifyTOTP(secret: string, code: string): boolean {
  if (!code || code.length !== TOTP_DIGITS) return false;

  // Check against current time and allowed drift
  for (let drift = -TOTP_DRIFT; drift <= TOTP_DRIFT; drift++) {
    const counter = getTimeCounter(drift);
    const expectedCode = calculateTOTP(secret, counter);
    if (code === expectedCode) {
      return true;
    }
  }

  return false;
}

/**
 * Generate backup codes (10 single-use codes, 8 characters each)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(4);
    const code = bytes.toString("hex").toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Hash a backup code for storage (one-way hash)
 */
export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/**
 * Verify a backup code against its hash
 */
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  const codeHash = hashBackupCode(code);
  try {
    const a = Buffer.from(codeHash, "hex");
    const b = Buffer.from(hashedCode, "hex");
    if (a.length !== b.length) return false;
    return a.equals(b);
  } catch {
    return false;
  }
}

/**
 * Verify a backup code against a list of hashed codes
 * Returns the index of the matching code, or -1 if not found
 */
export function findBackupCodeIndex(code: string, hashedCodes: string[]): number {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (verifyBackupCode(code, hashedCodes[i])) {
      return i;
    }
  }
  return -1;
}
