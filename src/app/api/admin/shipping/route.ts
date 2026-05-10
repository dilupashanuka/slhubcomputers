// =============================================================================
// SL HUB COMPUTER - Admin Shipping Configuration API
// =============================================================================
// Purpose: GET and PUT endpoints for managing shipping configuration
// GET: Returns current shipping zones and settings
// PUT: Updates shipping zones and settings (stored in memory/config)
// Note: In production, this would persist to database. For now, returns
//       the default configuration from /src/lib/shipping.ts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { SHIPPING_ZONES, type ShippingZone } from "@/lib/shipping";

// Current live configuration (mutable copy)
let liveZones: ShippingZone[] = JSON.parse(JSON.stringify(SHIPPING_ZONES));

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        zones: liveZones,
        expressSurcharge: 50, // percentage
        defaultWeightPerItem: 0.5, // kg
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Shipping config GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { zones } = body;

    if (!zones || !Array.isArray(zones)) {
      return NextResponse.json(
        { success: false, error: "Zones array is required" },
        { status: 400 }
      );
    }

    // Validate each zone
    for (const zone of zones) {
      if (!zone.id || !zone.name || !Array.isArray(zone.districts)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid zone: ${zone.name || zone.id || "unknown"}. Missing required fields.`,
          },
          { status: 400 }
        );
      }
    }

    // Update live configuration
    liveZones = zones.map((zone: ShippingZone) => ({
      ...zone,
      id: zone.id,
      name: zone.name,
      districts: zone.districts,
      baseRate: Number(zone.baseRate) || 0,
      maxRate: Number(zone.maxRate) || 0,
      freeShippingAbove: Number(zone.freeShippingAbove) || 0,
      estimatedDays: zone.estimatedDays || { standard: [3, 5], express: [1, 3] },
      codAvailable: Boolean(zone.codAvailable),
      weightTiers: zone.weightTiers || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        zones: liveZones,
        message: "Shipping configuration updated successfully",
      },
    });
  } catch (error) {
    console.error("Shipping config PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update shipping config" },
      { status: 500 }
    );
  }
}
