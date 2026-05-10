// =============================================================================
// SL HUB COMPUTER - SMS Test API
// =============================================================================
// Purpose: Test endpoint to send a test SMS message
// Features:
//   - POST: Send a test SMS to a specified phone number
//   - Returns success/failure status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const testMessage =
      message || "SL HUB COMPUTER - Test SMS: Your SMS notifications are working correctly! 📱";

    const result = await sendSMS(phone, testMessage);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test SMS sent to ${phone}`,
        detail: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test SMS",
          detail: result.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("SMS test error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test SMS" },
      { status: 500 }
    );
  }
}
