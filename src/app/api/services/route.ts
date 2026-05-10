// =============================================================================
// SL HUB COMPUTER - Services API Route
// =============================================================================
// Purpose: GET endpoint for fetching SL HUB COMPUTER services
// Features: Returns active services ordered by sort order
// Services: PC Parts & Repair, Laptop Repair, Mobile Accessories, CCTV, etc.
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
