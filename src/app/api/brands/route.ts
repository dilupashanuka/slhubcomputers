import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("Brands API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
  }
}
