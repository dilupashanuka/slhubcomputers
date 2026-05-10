// =============================================================================
// SL HUB COMPUTER - Affiliate Dashboard API Route
// =============================================================================
// Purpose: Affiliate's own dashboard data (for affiliate's view)
// Features:
//   - GET: Fetch affiliate dashboard stats and recent referrals
//   - Stats: clicks, conversions, earnings, recent referrals
//   - Filter by date range
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/affiliates/dashboard?code=SLHUB-XXXXX - Affiliate dashboard data
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Affiliate code is required" },
        { status: 400 }
      );
    }

    const sanitizedCode = sanitizeForStorage(code.trim().toUpperCase());

    // Find the affiliate
    const affiliate = await db.affiliate.findUnique({
      where: { code: sanitizedCode },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Filter referrals by date range if provided
    let filteredReferrals = affiliate.referrals;
    if (startDate || endDate) {
      filteredReferrals = affiliate.referrals.filter((ref) => {
        const refDate = new Date(ref.createdAt);
        if (startDate && refDate < new Date(startDate)) return false;
        if (endDate && refDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate stats from filtered referrals
    const totalCommission = filteredReferrals
      .filter((r) => r.status === "approved" || r.status === "paid")
      .reduce((sum, r) => sum + r.commission, 0);

    const pendingCommission = filteredReferrals
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.commission, 0);

    const conversionCount = filteredReferrals.filter(
      (r) => r.status !== "rejected"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          code: affiliate.code,
          name: affiliate.name,
          email: affiliate.email,
          commissionRate: affiliate.commissionRate,
          clicks: affiliate.clicks,
          conversions: affiliate.conversions,
          totalEarnings: affiliate.totalEarnings,
          pendingEarnings: affiliate.pendingEarnings,
          paidEarnings: affiliate.paidEarnings,
          isActive: affiliate.isActive,
        },
        stats: {
          totalCommission,
          pendingCommission,
          conversionCount,
          clickCount: affiliate.clicks,
          conversionRate: affiliate.clicks > 0
            ? ((conversionCount / affiliate.clicks) * 100).toFixed(2)
            : "0",
        },
        referrals: filteredReferrals,
        payments: affiliate.payments,
      },
    });
  } catch (error) {
    console.error("Affiliate dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliate dashboard" },
      { status: 500 }
    );
  }
}
