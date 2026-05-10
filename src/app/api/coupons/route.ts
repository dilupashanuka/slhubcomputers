import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    const coupons = await db.coupon.findMany({
      where: isActive ? { isActive: true } : {},
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
