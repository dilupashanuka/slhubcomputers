import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    // Build where clause
    const where: Record<string, unknown> = { isAvailable: true };
    if (category && ["budget", "gaming", "office", "workstation"].includes(category)) {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    const prebuiltPCs = await db.prebuiltPC.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: prebuiltPCs,
      total: prebuiltPCs.length,
    });
  } catch (error) {
    console.error("Pre-built PCs API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pre-built PCs" },
      { status: 500 }
    );
  }
}
