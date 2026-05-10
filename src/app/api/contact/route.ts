// =============================================================================
// SL HUB COMPUTER - Contact API Route
// =============================================================================
// Purpose: POST endpoint for submitting contact form messages
// Features: Validates required fields, stores message in database,
//           returns success/error response
// Fields: name, email, phone (optional), subject, message
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Create contact message in database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      data: contactMessage,
      message: "Thank you for contacting SL HUB COMPUTER! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
