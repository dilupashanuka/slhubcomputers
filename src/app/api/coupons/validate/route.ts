// =============================================================================
// SL HUB COMPUTER - Coupon Validation API
// =============================================================================
// Purpose: POST endpoint for validating coupon codes at checkout
// Features: Check code exists, is active, within date range, usage limits,
//           minimum order amount, and calculate discount amount
// Request Body: { code: string, subtotal: number, customerId?: string }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  customerId?: string;
}

interface ValidateCouponResponse {
  success: boolean;
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: string;
    value: number;
    discountAmount: number;
    maxDiscount: number | null;
    minOrder: number | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponRequest = await request.json();
    const { code, subtotal, customerId } = body;

    // -------------------------------------------------------------------------
    // Validate required fields
    // -------------------------------------------------------------------------
    if (!code || typeof code !== "string") {
      return NextResponse.json<ValidateCouponResponse>(
        { success: false, valid: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!subtotal || typeof subtotal !== "number" || subtotal <= 0) {
      return NextResponse.json<ValidateCouponResponse>(
        { success: false, valid: false, error: "Valid subtotal amount is required" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // Find the coupon by code (case-insensitive)
    // -------------------------------------------------------------------------
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: "Invalid coupon code. Please check and try again.",
      });
    }

    // -------------------------------------------------------------------------
    // Check if coupon is active
    // -------------------------------------------------------------------------
    if (!coupon.isActive) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: "This coupon is no longer active.",
      });
    }

    // -------------------------------------------------------------------------
    // Check date validity (start/end dates)
    // -------------------------------------------------------------------------
    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: `This coupon is not yet active. It will be available from ${coupon.startDate.toLocaleDateString("en-LK")}.`,
      });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: "This coupon has expired.",
      });
    }

    // -------------------------------------------------------------------------
    // Check total usage limit
    // -------------------------------------------------------------------------
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: "This coupon has reached its maximum usage limit.",
      });
    }

    // -------------------------------------------------------------------------
    // Check per-user usage limit (if customer is logged in)
    // -------------------------------------------------------------------------
    if (coupon.perUserLimit && customerId) {
      const customerOrderCount = await db.order2.count({
        where: {
          customerId,
          couponCode: coupon.code,
        },
      });

      if (customerOrderCount >= coupon.perUserLimit) {
        return NextResponse.json<ValidateCouponResponse>({
          success: true,
          valid: false,
          error: `You have already used this coupon ${coupon.perUserLimit} time(s). Per-user limit reached.`,
        });
      }
    }

    // -------------------------------------------------------------------------
    // Check minimum order amount
    // -------------------------------------------------------------------------
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        valid: false,
        error: `Minimum order amount of Rs. ${coupon.minOrder.toLocaleString("en-LK")} required to use this coupon.`,
      });
    }

    // -------------------------------------------------------------------------
    // Calculate discount amount based on coupon type
    // -------------------------------------------------------------------------
    let discountAmount = 0;

    switch (coupon.type) {
      case "percentage": {
        // Percentage discount (e.g., 10% off)
        discountAmount = (subtotal * coupon.value) / 100;
        // Apply max discount cap if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        break;
      }
      case "fixed": {
        // Fixed amount discount (e.g., Rs. 500 off)
        discountAmount = coupon.value;
        // Discount cannot exceed subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
        break;
      }
      case "free_shipping": {
        // Free shipping - discount equals shipping cost
        // The actual shipping calculation happens at checkout;
        // here we just flag it as a free shipping coupon
        discountAmount = 0; // Will be calculated at checkout with actual shipping
        break;
      }
      default: {
        return NextResponse.json<ValidateCouponResponse>({
          success: true,
          valid: false,
          error: "Unknown coupon type.",
        });
      }
    }

    // Ensure discount doesn't make total negative
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    // -------------------------------------------------------------------------
    // Return successful validation with coupon details
    // -------------------------------------------------------------------------
    return NextResponse.json<ValidateCouponResponse>({
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        maxDiscount: coupon.maxDiscount,
        minOrder: coupon.minOrder,
      },
    });
  } catch (error) {
    console.error("Coupon validation API error:", error);
    return NextResponse.json<ValidateCouponResponse>(
      { success: false, valid: false, error: "Failed to validate coupon. Please try again." },
      { status: 500 }
    );
  }
}
