// =============================================================================
// SL HUB COMPUTER - Admin Analytics API
// =============================================================================
// GET: Comprehensive analytics data for admin dashboard
// - Page views, unique visitors
// - Top viewed products
// - Conversion funnel
// - Customer demographics
// - Return customer rate
// =============================================================================

import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/analytics";

export async function GET() {
  try {
    const data = await getAnalyticsData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
