// =============================================================================
// SL HUB COMPUTER - Admin Reviews API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (approved === "true") where.isApproved = true;
    if (approved === "false") where.isApproved = false;

    const [reviews, total] = await Promise.all([
      db.review.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { product: { select: { name: true } } } }),
      db.review.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: reviews, total, page, limit });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
