// =============================================================================
// SL HUB COMPUTER - Public FAQ API
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    
    return NextResponse.json({ 
      success: true, 
      data: faqs 
    });
  } catch (error) {
    console.error("Public FAQ fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
