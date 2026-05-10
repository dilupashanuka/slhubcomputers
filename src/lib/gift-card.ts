// =============================================================================
// SL HUB COMPUTER - Gift Card Utility Library
// =============================================================================
// Purpose: Gift card code generation, validation, balance calculation, redemption
// Features: SLHUB-XXXX-XXXX format, no confusing chars (O/0/I/1), unique codes
// =============================================================================

import { db } from "@/lib/db";

// Character set without confusing characters (no O, 0, I, 1, L)
const SAFE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// ---------------------------------------------------------------------------
// Generate a unique gift card code in SLHUB-XXXX-XXXX format
// ---------------------------------------------------------------------------
export function generateGiftCardCode(): string {
  const segment = (length: number): string => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
    }
    return result;
  };
  return `SLHUB-${segment(4)}-${segment(4)}`;
}

// ---------------------------------------------------------------------------
// Validate gift card code format (SLHUB-XXXX-XXXX)
// ---------------------------------------------------------------------------
export function validateGiftCardCode(code: string): { valid: boolean; error?: string } {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Gift card code is required" };
  }

  const trimmed = code.trim().toUpperCase();
  const pattern = /^SLHUB-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  if (!pattern.test(trimmed)) {
    return { valid: false, error: "Invalid gift card code format. Expected: SLHUB-XXXX-XXXX" };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Calculate gift card balance by code
// ---------------------------------------------------------------------------
export async function calculateGiftCardBalance(code: string): Promise<{
  success: boolean;
  balance?: number;
  amount?: number;
  isActive?: boolean;
  isRedeemed?: boolean;
  expiresAt?: Date | null;
  name?: string;
  error?: string;
}> {
  try {
    const giftCard = await db.giftCard.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!giftCard) {
      return { success: false, error: "Gift card not found" };
    }

    if (!giftCard.isActive) {
      return { success: false, error: "Gift card has been deactivated" };
    }

    if (giftCard.isRedeemed) {
      return { success: false, error: "Gift card has been fully redeemed" };
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return { success: false, error: "Gift card has expired" };
    }

    return {
      success: true,
      balance: giftCard.balance,
      amount: giftCard.amount,
      isActive: giftCard.isActive,
      isRedeemed: giftCard.isRedeemed,
      expiresAt: giftCard.expiresAt,
      name: giftCard.name,
    };
  } catch (error) {
    console.error("Calculate gift card balance error:", error);
    return { success: false, error: "Failed to check gift card balance" };
  }
}

// ---------------------------------------------------------------------------
// Redeem a gift card (deduct balance and create transaction)
// ---------------------------------------------------------------------------
export async function redeemGiftCard(
  code: string,
  amount: number,
  orderId?: string
): Promise<{
  success: boolean;
  remainingBalance?: number;
  redeemedAmount?: number;
  error?: string;
}> {
  try {
    const trimmedCode = code.trim().toUpperCase();

    // Validate the code format
    const validation = validateGiftCardCode(trimmedCode);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (amount <= 0) {
      return { success: false, error: "Redemption amount must be greater than zero" };
    }

    // Find the gift card
    const giftCard = await db.giftCard.findUnique({
      where: { code: trimmedCode },
    });

    if (!giftCard) {
      return { success: false, error: "Gift card not found" };
    }

    if (!giftCard.isActive) {
      return { success: false, error: "Gift card has been deactivated" };
    }

    if (giftCard.isRedeemed) {
      return { success: false, error: "Gift card has been fully redeemed" };
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return { success: false, error: "Gift card has expired" };
    }

    if (amount > giftCard.balance) {
      return { success: false, error: `Insufficient balance. Available: Rs. ${giftCard.balance.toLocaleString()}` };
    }

    // Calculate new balance
    const newBalance = giftCard.balance - amount;
    const isFullyRedeemed = newBalance <= 0;

    // Update gift card and create transaction in a single transaction
    const result = await db.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          type: "redemption",
          amount: amount,
          orderId: orderId || null,
          description: `Redeemed Rs. ${amount.toLocaleString()}${orderId ? ` for order ${orderId}` : ""}`,
        },
      });

      // Update gift card balance
      const updated = await tx.giftCard.update({
        where: { id: giftCard.id },
        data: {
          balance: newBalance,
          isRedeemed: isFullyRedeemed,
          redeemedAt: isFullyRedeemed ? new Date() : undefined,
          redeemedBy: isFullyRedeemed ? (orderId || "full_redemption") : undefined,
        },
      });

      return { transaction, giftCard: updated };
    });

    return {
      success: true,
      remainingBalance: result.giftCard.balance,
      redeemedAmount: amount,
    };
  } catch (error) {
    console.error("Redeem gift card error:", error);
    return { success: false, error: "Failed to redeem gift card" };
  }
}

// ---------------------------------------------------------------------------
// Generate a unique code that doesn't already exist in the database
// ---------------------------------------------------------------------------
export async function generateUniqueGiftCardCode(): Promise<string> {
  let code = generateGiftCardCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await db.giftCard.findUnique({ where: { code } });
    if (!existing) return code;
    code = generateGiftCardCode();
    attempts++;
  }

  throw new Error("Failed to generate unique gift card code after multiple attempts");
}
