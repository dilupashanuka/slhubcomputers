// =============================================================================
// SL HUB COMPUTER - Admin Affiliate [id] API Route
// =============================================================================
// Purpose: Update/Delete a specific affiliate
// Features:
//   - GET: Get single affiliate details with referrals
//   - PUT: Update affiliate (commission rate, active status, bank details)
//   - DELETE: Delete an affiliate
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/affiliates/[id] - Get affiliate details
// ---------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const affiliate = await db.affiliate.findUnique({
      where: { id },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: affiliate });
  } catch (error) {
    console.error("Admin affiliate GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliate" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/affiliates/[id] - Update affiliate
// Body: { name?, email?, phone?, commissionRate?, isActive?, bankDetails? }
// ---------------------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, commissionRate, isActive, bankDetails } = body;

    // Check affiliate exists
    const existing = await db.affiliate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name?.trim()) updateData.name = sanitizeForStorage(name.trim());
    if (email?.trim()) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() ? sanitizeForStorage(phone.trim()) : null;
    if (typeof commissionRate === "number" && commissionRate >= 0 && commissionRate <= 50) {
      updateData.commissionRate = commissionRate;
    }
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (bankDetails !== undefined) updateData.bankDetails = bankDetails ? JSON.stringify(bankDetails) : null;

    const updated = await db.affiliate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin affiliate PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update affiliate" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/affiliates/[id] - Delete affiliate
// ---------------------------------------------------------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.affiliate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Delete related records first
    await db.affiliateReferral.deleteMany({ where: { affiliateId: id } });
    await db.affiliatePayment.deleteMany({ where: { affiliateId: id } });
    await db.affiliate.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Affiliate deleted successfully",
    });
  } catch (error) {
    console.error("Admin affiliate DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete affiliate" },
      { status: 500 }
    );
  }
}
