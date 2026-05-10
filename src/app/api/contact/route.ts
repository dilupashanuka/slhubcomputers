// =============================================================================
// SL HUB COMPUTER - Contact API Route
// =============================================================================
// Purpose: POST endpoint for submitting contact form messages
// Features: Validates required fields, stores message in database,
//           creates admin notification, sends email to admin,
//           returns success/error response
// Fields: name, email, phone (optional), subject, message
// Security: Input sanitization, email/phone validation
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendContactFormNotification } from "@/lib/email";
import { sanitizeForStorage, validateEmail, validatePhone } from "@/lib/sanitize";

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

    // Validate email
    const emailValidation = validateEmail(String(email));
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneValidation = validatePhone(String(phone));
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { success: false, error: phoneValidation.error },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs for storage
    const sanitizedData = {
      name: sanitizeForStorage(name),
      email: emailValidation.valid ? String(email).trim().toLowerCase() : email,
      phone: phone ? sanitizeForStorage(phone) : null,
      subject: sanitizeForStorage(subject),
      message: sanitizeForStorage(message),
    };

    // Create contact message in database
    const contactMessage = await db.contactMessage.create({
      data: sanitizedData,
    });

    // ---------------------------------------------------------------
    // Create admin notification for new message
    // ---------------------------------------------------------------
    try {
      await db.notification.create({
        data: {
          type: "message",
          title: `Message from ${sanitizedData.name}`,
          message: sanitizedData.subject || "No subject",
          link: "/admin/messages",
        },
      });
    } catch (notifError) {
      console.error("Failed to create contact notification:", notifError);
      // Non-blocking
    }

    // ---------------------------------------------------------------
    // Send contact form notification email to admin (non-blocking)
    // ---------------------------------------------------------------
    sendContactFormNotification({
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
    }).catch((emailError) => {
      console.error("Contact form email error:", emailError);
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
