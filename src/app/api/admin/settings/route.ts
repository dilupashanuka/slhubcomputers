// =============================================================================
// SL HUB COMPUTER - Admin Settings API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "site-settings" } });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Define allowed fields based on Prisma model to prevent "500 Internal Server Error"
    // when the frontend sends fields not yet in the database schema.
    const allowedFields = [
      "siteName", "tagline", "description", "phone", "email", "address", 
      "whatsapp", "facebook", "instagram", "youtube", "currency", 
      "currencySymbol", "shippingFee", "freeShippingAbove", "taxRate", 
      "openingHours", "metaTitle", "metaDescription", "heroTitle", 
      "heroSubtitle", "heroImageUrl", "announcementBar", "primaryColor", 
      "accentColor", "enableCCTV", "enablePCBuilder", "enableAffiliate", 
      "enableTestimonials", "enableNewsletter", "enablePrebuiltPC", 
      "enableGiftCards", "enableCoupons", "enableReviews", "enableRepairServices",
      "smsProvider", "smsApiKey", "smsApiSecret", "smsFromNumber", 
      "smsEnabled", "smsOrderConfirmation", "smsStatusUpdates", 
      "smsBackInStock", "smsDeliveryUpdates"
    ];

    const filteredBody: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        filteredBody[field] = body[field];
      }
    });

    const settings = await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: filteredBody,
      create: { id: "site-settings", ...filteredBody },
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) { 
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed" }, { status: 500 }); 
  }
}
