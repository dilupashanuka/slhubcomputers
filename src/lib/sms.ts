// =============================================================================
// SL HUB COMPUTER - SMS Notification Utility
// =============================================================================
// Purpose: Reusable SMS sending module with multiple provider support
// Features:
//   - Provider support: Twilio, Dialog SMS API, Hutch Business SMS
//   - Configure via env vars: SMS_PROVIDER, SMS_API_KEY, SMS_API_SECRET, SMS_FROM_NUMBER
//   - sendSMS - send single SMS
//   - sendBulkSMS - send to multiple numbers
//   - sendOrderConfirmationSMS - order confirmation
//   - sendOrderStatusSMS - status update
//   - sendBackInStockSMS - back in stock notification
//   - sendDeliveryUpdateSMS - delivery status
//   - Graceful console.log fallback when SMS not configured
//   - Sri Lankan phone format: +94XXXXXXXXX or 0XXXXXXXXX
//   - Message templates in English and Sinhala
// Environment:
//   SMS_PROVIDER, SMS_API_KEY, SMS_API_SECRET, SMS_FROM_NUMBER, SMS_ENABLED
// =============================================================================

// ---------------------------------------------------------------------------
// SMS Configuration
// ---------------------------------------------------------------------------
const SMS_PROVIDER = process.env.SMS_PROVIDER || ""; // twilio, dialog, hutch
const SMS_API_KEY = process.env.SMS_API_KEY || "";
const SMS_API_SECRET = process.env.SMS_API_SECRET || "";
const SMS_FROM_NUMBER = process.env.SMS_FROM_NUMBER || "";
const SMS_ENABLED = process.env.SMS_ENABLED === "true";

const isSmsConfigured = !!(SMS_PROVIDER && SMS_API_KEY && SMS_API_SECRET && SMS_FROM_NUMBER && SMS_ENABLED);

// ---------------------------------------------------------------------------
// Phone Number Formatting - Sri Lankan format
// ---------------------------------------------------------------------------
function formatSriLankanPhone(phone: string): string {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Convert local format to international
  if (cleaned.startsWith("0")) {
    cleaned = "+94" + cleaned.substring(1);
  } else if (cleaned.startsWith("94") && !cleaned.startsWith("+94")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+94" + cleaned;
  }

  // Validate Sri Lankan format: +94XXXXXXXXX (12 digits total)
  const sriLankanRegex = /^\+94[0-9]{9}$/;
  if (!sriLankanRegex.test(cleaned)) {
    return ""; // Invalid format
  }

  return cleaned;
}

// ---------------------------------------------------------------------------
// Core SMS Send Function
// ---------------------------------------------------------------------------
export async function sendSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  if (!isSmsConfigured) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 SMS (not configured - console fallback)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return { success: true, message: "SMS logged to console (not configured)" };
  }

  const formattedPhone = formatSriLankanPhone(phone);
  if (!formattedPhone) {
    console.error(`❌ Invalid Sri Lankan phone number: ${phone}`);
    return { success: false, message: "Invalid phone number format" };
  }

  try {
    switch (SMS_PROVIDER.toLowerCase()) {
      case "twilio":
        return await sendViaTwilio(formattedPhone, message);
      case "dialog":
        return await sendViaDialog(formattedPhone, message);
      case "hutch":
        return await sendViaHutch(formattedPhone, message);
      default:
        console.error(`❌ Unknown SMS provider: ${SMS_PROVIDER}`);
        return { success: false, message: `Unknown SMS provider: ${SMS_PROVIDER}` };
    }
  } catch (error) {
    console.error("❌ SMS send error:", error);
    return { success: false, message: "Failed to send SMS" };
  }
}

// ---------------------------------------------------------------------------
// Twilio Provider
// ---------------------------------------------------------------------------
async function sendViaTwilio(
  to: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${SMS_API_KEY}/Messages.json`;

  const params = new URLSearchParams();
  params.append("To", to);
  params.append("From", SMS_FROM_NUMBER);
  params.append("Body", message);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SMS_API_KEY}:${SMS_API_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ SMS sent via Twilio to ${to}: ${data.sid}`);
    return { success: true, message: data.sid };
  } else {
    const error = await response.text();
    console.error(`❌ Twilio SMS error: ${error}`);
    return { success: false, message: `Twilio error: ${error}` };
  }
}

// ---------------------------------------------------------------------------
// Dialog SMS API Provider
// ---------------------------------------------------------------------------
async function sendViaDialog(
  to: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  const url = "https://e-sms.dialog.lk/api/v1/message";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SMS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msisdn: to,
      message: message,
      source: SMS_FROM_NUMBER,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ SMS sent via Dialog to ${to}`);
    return { success: true, message: data.request_id || "sent" };
  } else {
    const error = await response.text();
    console.error(`❌ Dialog SMS error: ${error}`);
    return { success: false, message: `Dialog error: ${error}` };
  }
}

// ---------------------------------------------------------------------------
// Hutch Business SMS Provider
// ---------------------------------------------------------------------------
async function sendViaHutch(
  to: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  const url = "https://hutchsmsservice.azurewebsites.net/api/SMS";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: SMS_API_KEY,
      api_secret: SMS_API_SECRET,
      from: SMS_FROM_NUMBER,
      to: to,
      message: message,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ SMS sent via Hutch to ${to}`);
    return { success: true, message: data.id || "sent" };
  } else {
    const error = await response.text();
    console.error(`❌ Hutch SMS error: ${error}`);
    return { success: false, message: `Hutch error: ${error}` };
  }
}

// ---------------------------------------------------------------------------
// Send Bulk SMS
// ---------------------------------------------------------------------------
export async function sendBulkSMS(
  phones: string[],
  message: string
): Promise<{ success: boolean; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const phone of phones) {
    const result = await sendSMS(phone, message);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { success: true, sent, failed };
}

// ---------------------------------------------------------------------------
// Order Confirmation SMS
// ---------------------------------------------------------------------------
export async function sendOrderConfirmationSMS(order: {
  orderNumber: string;
  name: string;
  phone: string;
  total: number;
  paymentMethod: string;
}): Promise<{ success: boolean; message?: string }> {
  const paymentLabel =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer";
  const totalFormatted = `Rs. ${order.total.toLocaleString("en-LK")}`;

  const message = [
    `SL HUB COMPUTER - Order Confirmed!`,
    `Hi ${order.name}, your order ${order.orderNumber} has been placed.`,
    `Total: ${totalFormatted}`,
    `Payment: ${paymentLabel}`,
    `We'll notify you when it's ready.`,
    `WhatsApp: 071 067 8944`,
    ``,
    `ඔබගේ ඇණවුම ${order.orderNumber} තහවුරු විය. මුළු මුදල: ${totalFormatted}`,
  ].join("\n");

  return sendSMS(order.phone, message);
}

// ---------------------------------------------------------------------------
// Order Status Update SMS
// ---------------------------------------------------------------------------
export async function sendOrderStatusSMS(
  order: {
    orderNumber: string;
    name: string;
    phone: string;
    status: string;
    total: number;
  },
  newStatus: string
): Promise<{ success: boolean; message?: string }> {
  const statusMessages: Record<string, { en: string; si: string }> = {
    pending: {
      en: "Your order has been received and is awaiting confirmation.",
      si: "ඔබගේ ඇණවුම ලැබී ඇත.",
    },
    confirmed: {
      en: "Great news! Your order has been confirmed.",
      si: "ඔබගේ ඇණවුම තහවුරු විය.",
    },
    processing: {
      en: "Your order is being prepared for shipping.",
      si: "ඔබගේ ඇණවුම සූදානම් කරමින් පවතී.",
    },
    shipped: {
      en: "Your order has been shipped! It's on the way.",
      si: "ඔබගේ ඇණවුම යවා ඇත!",
    },
    delivered: {
      en: "Your order has been delivered. Thank you!",
      si: "ඔබගේ ඇණවුම ලැබී ඇත. ස්තුතියි!",
    },
    cancelled: {
      en: "Your order has been cancelled. Contact us if you didn't request this.",
      si: "ඔබගේ ඇණවුම අවලංගු කර ඇත.",
    },
  };

  const statusInfo = statusMessages[newStatus] || {
    en: "Your order status has been updated.",
    si: "ඔබගේ ඇණවුම් තත්ත්වය යාවත්කාලීන විය.",
  };

  const totalFormatted = `Rs. ${order.total.toLocaleString("en-LK")}`;
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  const message = [
    `SL HUB COMPUTER - Order ${statusLabel}`,
    `Hi ${order.name}, order ${order.orderNumber}`,
    statusInfo.en,
    `Total: ${totalFormatted}`,
    newStatus === "shipped"
      ? "Please ensure someone is available to receive the delivery."
      : "",
    `WhatsApp: 071 067 8944`,
    ``,
    statusInfo.si,
  ]
    .filter(Boolean)
    .join("\n");

  return sendSMS(order.phone, message);
}

// ---------------------------------------------------------------------------
// Back In Stock SMS
// ---------------------------------------------------------------------------
export async function sendBackInStockSMS(
  phone: string,
  productName: string,
  productPrice: number
): Promise<{ success: boolean; message?: string }> {
  const priceFormatted = `Rs. ${productPrice.toLocaleString("en-LK")}`;

  const message = [
    `SL HUB COMPUTER - Back in Stock!`,
    `${productName} is now available again!`,
    `Price: ${priceFormatted}`,
    `Order now on WhatsApp: 071 067 8944`,
    ``,
    `${productName} නැවත ලබා ගත හැක! මිල: ${priceFormatted}`,
  ].join("\n");

  return sendSMS(phone, message);
}

// ---------------------------------------------------------------------------
// Delivery Update SMS
// ---------------------------------------------------------------------------
export async function sendDeliveryUpdateSMS(order: {
  orderNumber: string;
  name: string;
  phone: string;
  trackingInfo?: string;
}): Promise<{ success: boolean; message?: string }> {
  const message = [
    `SL HUB COMPUTER - Delivery Update`,
    `Hi ${order.name}, your order ${order.orderNumber} is out for delivery!`,
    order.trackingInfo ? `Tracking: ${order.trackingInfo}` : "",
    `Please ensure someone is available to receive it.`,
    `Call us: 071 067 8944`,
    ``,
    `ඔබගේ ඇණවුම ${order.orderNumber} බෙදාහැරීමට පැමිණ ඇත.`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendSMS(order.phone, message);
}

// ---------------------------------------------------------------------------
// Check if SMS is configured
// ---------------------------------------------------------------------------
export function isSmsConfiguredCheck(): boolean {
  return isSmsConfigured;
}

// ---------------------------------------------------------------------------
// Get SMS provider info (for admin settings page)
// ---------------------------------------------------------------------------
export function getSmsProviderInfo(): {
  configured: boolean;
  provider: string;
  enabled: boolean;
} {
  return {
    configured: isSmsConfigured,
    provider: SMS_PROVIDER || "none",
    enabled: SMS_ENABLED,
  };
}
