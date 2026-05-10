// =============================================================================
// SL HUB COMPUTER - Admin Gift Card Detail API (Get / Update / Delete)
// =============================================================================
// GET: Get a single gift card with full transaction history
// PUT: Update a gift card (activate/deactivate, adjust balance)
// DELETE: Delete a gift card
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const giftCard = await db.giftCard.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!giftCard) {
      return NextResponse.json(
        { success: false, error: "Gift card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: giftCard,
    });
  } catch (error) {
    console.error("Admin gift card get error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gift card" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.giftCard.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Gift card not found" },
        { status: 404 }
      );
    }

    const { action } = body;

    // Toggle active status
    if (action === "toggleActive") {
      const updated = await db.giftCard.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });

      await db.giftCardTransaction.create({
        data: {
          giftCardId: id,
          type: "adjustment",
          amount: 0,
          description: `Gift card ${updated.isActive ? "activated" : "deactivated"} by admin`,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    // Adjust balance
    if (action === "adjustBalance") {
      const { adjustmentAmount, reason } = body;
      const numAmount = Number(adjustmentAmount);

      if (isNaN(numAmount) || numAmount === 0) {
        return NextResponse.json(
          { success: false, error: "Valid adjustment amount is required" },
          { status: 400 }
        );
      }

      const newBalance = existing.balance + numAmount;
      if (newBalance < 0) {
        return NextResponse.json(
          { success: false, error: "Balance cannot be negative" },
          { status: 400 }
        );
      }

      const updated = await db.giftCard.update({
        where: { id },
        data: {
          balance: newBalance,
          isRedeemed: newBalance === 0,
        },
      });

      await db.giftCardTransaction.create({
        data: {
          giftCardId: id,
          type: "adjustment",
          amount: Math.abs(numAmount),
          description: reason || `Balance ${numAmount > 0 ? "increased" : "decreased"} by Rs. ${Math.abs(numAmount).toLocaleString()}`,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    // General update
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.occasion !== undefined) updateData.occasion = body.occasion;
    if (body.message !== undefined) updateData.message = body.message;
    if (body.expiresAt !== undefined) updateData.expiresAt = new Date(body.expiresAt);
    if (body.purchaserName !== undefined) updateData.purchaserName = body.purchaserName;
    if (body.purchaserEmail !== undefined) updateData.purchaserEmail = body.purchaserEmail;
    if (body.recipientName !== undefined) updateData.recipientName = body.recipientName;
    if (body.recipientEmail !== undefined) updateData.recipientEmail = body.recipientEmail;

    const updated = await db.giftCard.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Admin gift card update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gift card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.giftCard.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Gift card not found" },
        { status: 404 }
      );
    }

    // Delete transactions first, then the gift card
    await db.giftCardTransaction.deleteMany({ where: { giftCardId: id } });
    await db.giftCard.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Gift card deleted successfully",
    });
  } catch (error) {
    console.error("Admin gift card delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gift card" },
      { status: 500 }
    );
  }
}
