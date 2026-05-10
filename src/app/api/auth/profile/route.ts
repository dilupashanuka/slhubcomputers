// =============================================================================
// SL HUB COMPUTER - Customer Profile Update API
// =============================================================================
// PUT: Update customer profile (name, phone, addresses)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("slhub_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, addresses } = body;

    const customer = await db.customer.findUnique({
      where: { id: sessionId },
    });

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update allowed fields only
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (addresses !== undefined) updateData.addresses = JSON.stringify(addresses);

    const updatedCustomer = await db.customer.update({
      where: { id: sessionId },
      data: updateData,
    });

    const { password: _, ...customerData } = updatedCustomer;

    return NextResponse.json({
      success: true,
      data: customerData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
