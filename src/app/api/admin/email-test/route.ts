// =============================================================================
// SL HUB COMPUTER - Email Test API Route
// =============================================================================
// Purpose: Admin endpoint for testing email notifications
// Features: Send test emails of different types, check SMTP status
// API:
//   POST /api/admin/email-test - Send a test email
//     Body: { to: string, type: "order_confirmation" | "status_update" |
//            "welcome" | "contact" | "stock_alert" }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
  sendContactFormNotification,
  sendStockAlertEmail,
  isEmailConfigured,
} from "@/lib/email";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/admin/email-test - Send a test email
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, type } = body;

    if (!to || !type) {
      return NextResponse.json(
        { success: false, error: "Missing 'to' and 'type' fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "order_confirmation":
        result = await sendOrderConfirmation({
          orderNumber: "SLH-TEST-0001",
          name: "Test Customer",
          email: to,
          phone: "077 123 4567",
          address: "123 Test Street, Colombo",
          city: "Colombo",
          subtotal: 75000,
          shipping: 500,
          total: 75500,
          paymentMethod: "cod",
          items: [
            { name: "Intel Core i5-14400F", price: 55000, quantity: 1 },
            { name: "Corsair Vengeance 16GB DDR5", price: 20000, quantity: 1 },
          ],
        });
        break;

      case "status_update":
        result = await sendOrderStatusUpdate(
          {
            orderNumber: "SLH-TEST-0001",
            name: "Test Customer",
            email: to,
            status: "pending",
            total: 75500,
          },
          "shipped"
        );
        break;

      case "welcome":
        result = await sendWelcomeEmail({
          name: "Test Customer",
          email: to,
        });
        break;

      case "contact":
        result = await sendContactFormNotification({
          name: "Test User",
          email: "test@example.com",
          phone: "077 123 4567",
          subject: "Test Inquiry About GPU Availability",
          message:
            "Hi, I wanted to ask about the availability of the RTX 4070 Ti. Do you have it in stock? Thanks!",
        });
        break;

      case "stock_alert":
        result = await sendStockAlertEmail({
          name: "NVIDIA GeForce RTX 4070 Ti",
          sku: "GPU-RTX4070TI",
          stock: 2,
          price: 285000,
          category: "Graphics Cards",
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid type. Use: order_confirmation, status_update, welcome, contact, or stock_alert",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      message: result.message || "Test email processed",
      smtpConfigured: isEmailConfigured(),
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
