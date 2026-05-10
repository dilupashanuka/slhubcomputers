// =============================================================================
// SL HUB COMPUTER - Shipping Calculator API
// =============================================================================
// Purpose: POST endpoint for calculating shipping cost
// Body: { city, items: [{productId, quantity, price?}], deliveryType, orderSubtotal? }
// Returns: { shippingCost, estimatedDays, codAvailable, zone, freeShippingThreshold,
//           freeShippingRemaining, isFreeShipping, deliveryType, weightUsed, breakdown }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  calculateShipping,
  estimateDeliveryDate,
  type ShippingCalculationResult,
} from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, items, deliveryType = "standard" } = body;

    if (!city || typeof city !== "string") {
      return NextResponse.json(
        { success: false, error: "City/district is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Calculate order subtotal from items if not provided
    const orderSubtotal =
      body.orderSubtotal ||
      items.reduce(
        (sum: number, item: { price?: number; quantity: number }) =>
          sum + (item.price || 0) * item.quantity,
        0
      );

    const result: ShippingCalculationResult = calculateShipping(
      city,
      items,
      orderSubtotal,
      deliveryType
    );

    // Get estimated delivery dates
    const deliveryDates = estimateDeliveryDate(result.zone, deliveryType);

    return NextResponse.json({
      success: true,
      data: {
        shippingCost: result.shippingCost,
        estimatedDays: result.estimatedDays,
        estimatedDelivery: deliveryDates,
        codAvailable: result.codAvailable,
        zone: {
          id: result.zone.id,
          name: result.zone.name,
          baseRate: result.zone.baseRate,
          maxRate: result.zone.maxRate,
        },
        freeShippingThreshold: result.freeShippingThreshold,
        freeShippingRemaining: result.freeShippingRemaining,
        isFreeShipping: result.isFreeShipping,
        deliveryType: result.deliveryType,
        weightUsed: result.weightUsed,
        breakdown: result.breakdown,
      },
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}
