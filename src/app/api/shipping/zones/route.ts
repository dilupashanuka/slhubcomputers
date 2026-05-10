// =============================================================================
// SL HUB COMPUTER - Shipping Zones API
// =============================================================================
// Purpose: GET endpoint for listing available shipping zones and rates
// Returns: Array of shipping zones with district mappings, rates, and options
// =============================================================================

import { NextResponse } from "next/server";
import { getShippingZones } from "@/lib/shipping";

export async function GET() {
  try {
    const zones = getShippingZones();

    // Return simplified zone data for frontend display
    const zoneData = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      districts: zone.districts,
      baseRate: zone.baseRate,
      maxRate: zone.maxRate,
      freeShippingAbove: zone.freeShippingAbove,
      estimatedDays: zone.estimatedDays,
      codAvailable: zone.codAvailable,
      weightTiers: zone.weightTiers,
    }));

    return NextResponse.json({
      success: true,
      data: zoneData,
    });
  } catch (error) {
    console.error("Shipping zones API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping zones" },
      { status: 500 }
    );
  }
}
