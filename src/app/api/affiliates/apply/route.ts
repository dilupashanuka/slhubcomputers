// =============================================================================
// SL HUB COMPUTER - Affiliate Apply API Route
// =============================================================================
// Purpose: Apply to become an affiliate partner
// Features:
//   - POST: Apply with name, email, phone
//   - Generate unique referral code (SLHUB-XXXXX format)
//   - Check for duplicate email
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage, validateEmail } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// Generate unique affiliate code
async function generateAffiliateCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let attempts = 0;

  while (attempts < 20) {
    code = "SLHUB-";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const existing = await db.affiliate.findUnique({ where: { code } });
    if (!existing) return code;
    attempts++;
  }

  // Fallback with timestamp
  return `SLHUB-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

// ---------------------------------------------------------------------------
// POST /api/affiliates/apply - Apply to become an affiliate
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeForStorage(name.trim());
    const sanitizedEmail = email.trim().toLowerCase();

    // Check for existing affiliate with same email
    const existing = await db.affiliate.findFirst({
      where: { email: sanitizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An affiliate with this email already exists" },
        { status: 409 }
      );
    }

    // Generate unique code
    const code = await generateAffiliateCode();

    // Create affiliate
    const affiliate = await db.affiliate.create({
      data: {
        code,
        name: sanitizedName,
        email: sanitizedEmail,
        phone: phone?.trim() ? sanitizeForStorage(phone.trim()) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: affiliate.id,
          code: affiliate.code,
          name: affiliate.name,
          email: affiliate.email,
        },
        message: "Affiliate application submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Affiliate apply error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit affiliate application" },
      { status: 500 }
    );
  }
}
