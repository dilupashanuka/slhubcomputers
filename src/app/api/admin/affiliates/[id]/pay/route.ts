// =============================================================================
// SL HUB COMPUTER - Admin Affiliate Pay API Route
// =============================================================================
// Purpose: Process affiliate payment
// Features:
//   - POST: Create a payment for an affiliate
//   - Marks referrals as paid and updates affiliate earnings
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/admin/affiliates/[id]/pay - Process payment for affiliate
// Body: { amount, method?, reference? }
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, method, reference } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    // Check affiliate exists
    const affiliate = await db.affiliate.findUnique({ where: { id } });
    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await db.affiliatePayment.create({
      data: {
        affiliateId: id,
        amount,
        method: method || "bank_transfer",
        reference: reference?.trim() ? sanitizeForStorage(reference.trim()) : null,
        status: "completed",
        paidAt: new Date(),
      },
    });

    // Update affiliate earnings
    await db.affiliate.update({
      where: { id },
      data: {
        paidEarnings: { increment: amount },
        pendingEarnings: { decrement: Math.min(amount, affiliate.pendingEarnings) },
        totalEarnings: affiliate.totalEarnings, // total stays the same, just moving from pending to paid
      },
    });

    // Mark approved referrals as paid (up to the payment amount)
    const approvedReferrals = await db.affiliateReferral.findMany({
      where: { affiliateId: id, status: "approved" },
      orderBy: { createdAt: "asc" },
    });

    let remaining = amount;
    for (const referral of approvedReferrals) {
      if (remaining <= 0) break;
      if (referral.commission <= remaining) {
        await db.affiliateReferral.update({
          where: { id: referral.id },
          data: { status: "paid" },
        });
        remaining -= referral.commission;
      }
    }

    return NextResponse.json({
      success: true,
      data: payment,
      message: `Payment of Rs. ${amount.toLocaleString("en-LK")} processed successfully`,
    });
  } catch (error) {
    console.error("Admin affiliate pay error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
