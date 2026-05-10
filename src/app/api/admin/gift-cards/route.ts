// =============================================================================
// SL HUB COMPUTER - Admin Gift Cards API (List / Create)
// =============================================================================
// GET: List all gift cards with search/filter
// POST: Create a new gift card (admin) or bulk generate
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUniqueGiftCardCode } from "@/lib/gift-card";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const occasion = searchParams.get("occasion") || "";
    const status = searchParams.get("status") || ""; // active, redeemed, expired, inactive
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { purchaserName: { contains: search, mode: "insensitive" } },
        { recipientName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (occasion) {
      where.occasion = occasion;
    }

    if (status === "active") {
      where.isActive = true;
      where.isRedeemed = false;
    } else if (status === "redeemed") {
      where.isRedeemed = true;
    } else if (status === "expired") {
      where.expiresAt = { lt: new Date() };
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const [giftCards, total] = await Promise.all([
      db.giftCard.findMany({
        where,
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: { select: { transactions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.giftCard.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: giftCards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin gift cards list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gift cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Bulk generate gift cards for promotions
    if (action === "bulk") {
      const { count, amount, name, occasion, expiresMonths } = body;

      if (!count || !amount || !name) {
        return NextResponse.json(
          { success: false, error: "Count, amount, and name are required for bulk generation" },
          { status: 400 }
        );
      }

      const numCount = Math.min(Number(count), 100); // Max 100 at a time
      const numAmount = Number(amount);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (Number(expiresMonths) || 12));

      const giftCards = [];

      for (let i = 0; i < numCount; i++) {
        const code = await generateUniqueGiftCardCode();
        const card = await db.giftCard.create({
          data: {
            code,
            name: `${name} #${i + 1}`,
            amount: numAmount,
            balance: numAmount,
            currency: "LKR",
            occasion: occasion || "promotion",
            expiresAt,
          },
        });

        await db.giftCardTransaction.create({
          data: {
            giftCardId: card.id,
            type: "purchase",
            amount: numAmount,
            description: `Bulk generated for promotion`,
          },
        });

        giftCards.push({
          id: card.id,
          code: card.code,
          name: card.name,
          amount: card.amount,
          balance: card.balance,
          expiresAt: card.expiresAt,
        });
      }

      return NextResponse.json({
        success: true,
        data: giftCards,
        message: `${numCount} gift cards generated successfully`,
      });
    }

    // Single gift card creation
    const {
      name,
      amount,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
      occasion,
      expiresMonths,
    } = body;

    if (!name || !amount) {
      return NextResponse.json(
        { success: false, error: "Name and amount are required" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least Rs. 500" },
        { status: 400 }
      );
    }

    const code = await generateUniqueGiftCardCode();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (Number(expiresMonths) || 12));

    const giftCard = await db.giftCard.create({
      data: {
        code,
        name,
        amount: numAmount,
        balance: numAmount,
        currency: "LKR",
        purchaserName: purchaserName || null,
        purchaserEmail: purchaserEmail || null,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        message: message || null,
        occasion: occasion || null,
        expiresAt,
      },
    });

    await db.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        type: "purchase",
        amount: numAmount,
        description: `Gift card created by admin`,
      },
    });

    return NextResponse.json({
      success: true,
      data: giftCard,
    });
  } catch (error) {
    console.error("Admin gift card create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gift card" },
      { status: 500 }
    );
  }
}
