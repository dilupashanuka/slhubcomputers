// =============================================================================
// SL HUB COMPUTER - Email Notification Utility
// =============================================================================
// Purpose: Reusable email sending module with SMTP support and graceful fallback
// Features:
//   - SMTP configuration via environment variables
//   - Professional HTML email templates with SL HUB branding
//   - Graceful console.log fallback when SMTP is not configured
//   - Order confirmation, status update, welcome, contact, and stock alert emails
// Environment:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
// =============================================================================

import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// SMTP Configuration
// ---------------------------------------------------------------------------
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "SL HUB COMPUTER <noreply@slhub.lk>";

const isSmtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

// ---------------------------------------------------------------------------
// Create transporter (only when SMTP is configured)
// ---------------------------------------------------------------------------
let transporter: nodemailer.Transporter | null = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// ---------------------------------------------------------------------------
// Base Email Template - Professional dark theme with emerald accents
// ---------------------------------------------------------------------------
function generateEmailTemplate(content: {
  title: string;
  heading: string;
  body: string;
  ctaLink?: string;
  ctaText?: string;
  footer?: string;
}): string {
  const { title, heading, body, ctaLink, ctaText, footer } = content;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center; }
    .header h1 { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
    .header .logo { font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 4px; font-weight: 500; }
    .content { background: #1e293b; padding: 36px 40px; }
    .content h2 { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 16px; }
    .content p { font-size: 14px; line-height: 1.7; color: #cbd5e1; margin-bottom: 14px; }
    .content .highlight { color: #34d399; font-weight: 600; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #334155, transparent); margin: 24px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 8px 0; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th { text-align: left; padding: 10px 12px; background: #0f172a; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .order-table td { padding: 10px 12px; border-bottom: 1px solid #334155; font-size: 13px; color: #e2e8f0; }
    .order-table .total-row td { border-bottom: none; font-weight: 700; color: #34d399; font-size: 14px; padding-top: 14px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-pending { background: #fbbf2433; color: #fbbf24; }
    .status-confirmed { background: #3b82f633; color: #60a5fa; }
    .status-processing { background: #8b5cf633; color: #a78bfa; }
    .status-shipped { background: #f9731633; color: #fb923c; }
    .status-delivered { background: #22c55e33; color: #4ade80; }
    .status-cancelled { background: #ef444433; color: #f87171; }
    .footer-section { background: #0f172a; border-radius: 0 0 12px 12px; padding: 24px 40px; text-align: center; }
    .footer-section p { font-size: 12px; color: #64748b; margin-bottom: 6px; }
    .footer-section a { color: #34d399; text-decoration: none; }
    .footer-section .social { margin-top: 12px; }
    .footer-section .social a { margin: 0 8px; color: #64748b; text-decoration: none; font-size: 12px; }
    .alert-box { background: #ef444420; border: 1px solid #ef444440; border-radius: 8px; padding: 14px 18px; margin: 14px 0; }
    .alert-box.warning { background: #f59e0b20; border-color: #f59e0b40; }
    .alert-box.info { background: #3b82f620; border-color: #3b82f640; }
    .alert-box p { color: #fca5a5; margin: 0; font-size: 13px; }
    .alert-box.warning p { color: #fcd34d; }
    .alert-box.info p { color: #93c5fd; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>SL HUB COMPUTER</h1>
      <div class="logo">Your Trusted Tech Partner</div>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>${heading}</h2>
      ${body}
      ${ctaLink && ctaText ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${ctaLink}" class="cta-button">${ctaText}</a>
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <p style="color: #94a3b8; font-weight: 500;">SL HUB COMPUTER</p>
      <p>Hakmana Road, Deiyandara, Sri Lanka</p>
      <p>Hotline: <a href="tel:+94710678944">071 067 8944</a> | Email: <a href="mailto:slhubcomputer@gmail.com">slhubcomputer@gmail.com</a></p>
      <div class="social">
        <a href="https://www.facebook.com/profile.php?id=100063543731370">Facebook</a>
        <a href="https://wa.me/94710678944">WhatsApp</a>
      </div>
      ${footer ? `<p style="margin-top: 12px; color: #475569;">${footer}</p>` : ""}
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Status label mapping
// ---------------------------------------------------------------------------
function getStatusLabel(status: string): { label: string; class: string } {
  const map: Record<string, { label: string; class: string }> = {
    pending: { label: "Pending", class: "status-pending" },
    confirmed: { label: "Confirmed", class: "status-confirmed" },
    processing: { label: "Processing", class: "status-processing" },
    shipped: { label: "Shipped", class: "status-shipped" },
    delivered: { label: "Delivered", class: "status-delivered" },
    cancelled: { label: "Cancelled", class: "status-cancelled" },
  };
  return map[status] || { label: status, class: "status-pending" };
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

// ---------------------------------------------------------------------------
// sendEmail - Core send function with graceful fallback
// ---------------------------------------------------------------------------
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!isSmtpConfigured || !transporter) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 EMAIL (SMTP not configured - console fallback)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return { success: true, message: "Email logged to console (SMTP not configured)" };
  }

  try {
    const result = await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    return { success: true, message: result.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, message: "Failed to send email" };
  }
}

// ---------------------------------------------------------------------------
// sendOrderConfirmation - Email to customer when order is placed
// ---------------------------------------------------------------------------
export async function sendOrderConfirmation(order: {
  orderNumber: string;
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  items: { name: string; price: number; quantity: number }[];
}): Promise<{ success: boolean; message?: string }> {
  if (!order.email) {
    console.log(`📧 Order confirmation skipped - no email for order ${order.orderNumber}`);
    return { success: true, message: "No email address provided" };
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">${formatCurrency(item.price)}</td>
        <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const paymentLabel = order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer";

  const html = generateEmailTemplate({
    title: `Order Confirmed - ${order.orderNumber}`,
    heading: "Order Confirmed! 🎉",
    body: `
      <p>Hi <span class="highlight">${order.name}</span>,</p>
      <p>Thank you for your order! We've received your order and will process it shortly.</p>

      <div class="divider"></div>

      <p style="margin-bottom:8px;"><strong>Order Details</strong></p>
      <p><strong>Order Number:</strong> <span class="highlight">${order.orderNumber}</span></p>
      <p><strong>Payment Method:</strong> ${paymentLabel}</p>

      <table class="order-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3" style="text-align:right;">Subtotal</td>
            <td style="text-align:right;">${formatCurrency(order.subtotal)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" style="text-align:right;">Shipping</td>
            <td style="text-align:right;">${formatCurrency(order.shipping)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" style="text-align:right; font-size:16px;">Grand Total</td>
            <td style="text-align:right; font-size:16px;">${formatCurrency(order.total)}</td>
          </tr>
        </tbody>
      </table>

      <div class="divider"></div>

      <p style="margin-bottom:8px;"><strong>Shipping Address</strong></p>
      <p>${order.name}<br>${order.address || "N/A"}${order.city ? `<br>${order.city}` : ""}<br>Phone: ${order.phone}</p>

      <div class="alert-box info">
        <p>💡 You can contact us on WhatsApp at <strong>071 067 8944</strong> for any order-related queries.</p>
      </div>
    `,
    ctaLink: "https://wa.me/94710678944",
    ctaText: "Chat on WhatsApp",
    footer: `This is an automated email from SL HUB COMPUTER. Order: ${order.orderNumber}`,
  });

  return sendEmail({
    to: order.email,
    subject: `Order Confirmed - ${order.orderNumber} | SL HUB COMPUTER`,
    html,
  });
}

// ---------------------------------------------------------------------------
// sendOrderStatusUpdate - Email to customer when order status changes
// ---------------------------------------------------------------------------
export async function sendOrderStatusUpdate(
  order: {
    orderNumber: string;
    name: string;
    email?: string | null;
    status: string;
    total: number;
  },
  newStatus: string
): Promise<{ success: boolean; message?: string }> {
  if (!order.email) {
    console.log(`📧 Status update skipped - no email for order ${order.orderNumber}`);
    return { success: true, message: "No email address provided" };
  }

  const statusInfo = getStatusLabel(newStatus);
  const statusMessages: Record<string, string> = {
    pending: "Your order has been received and is awaiting confirmation.",
    confirmed: "Great news! Your order has been confirmed and will be prepared soon.",
    processing: "Your order is now being processed and prepared for shipping.",
    shipped: "Your order has been shipped! It's on the way to you.",
    delivered: "Your order has been delivered. Thank you for shopping with us!",
    cancelled: "Your order has been cancelled. If you didn't request this, please contact us immediately.",
  };

  const html = generateEmailTemplate({
    title: `Order ${statusInfo.label} - ${order.orderNumber}`,
    heading: `Order Status Update`,
    body: `
      <p>Hi <span class="highlight">${order.name}</span>,</p>
      <p>The status of your order <strong>${order.orderNumber}</strong> has been updated.</p>

      <div style="text-align:center; margin: 24px 0;">
        <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
      </div>

      <p>${statusMessages[newStatus] || "Your order status has been updated."}</p>

      <div class="divider"></div>

      <p><strong>Order Number:</strong> <span class="highlight">${order.orderNumber}</span><br>
      <strong>Total:</strong> ${formatCurrency(order.total)}</p>

      ${newStatus === "shipped" ? `
      <div class="alert-box info">
        <p>📦 Your order is on the way! Please ensure someone is available to receive the delivery.</p>
      </div>
      ` : ""}

      ${newStatus === "cancelled" ? `
      <div class="alert-box">
        <p>⚠️ If you did not request this cancellation, please contact us immediately.</p>
      </div>
      ` : ""}
    `,
    ctaLink: "https://wa.me/94710678944",
    ctaText: "Track via WhatsApp",
    footer: `This is an automated email from SL HUB COMPUTER. Order: ${order.orderNumber}`,
  });

  return sendEmail({
    to: order.email,
    subject: `Order ${statusInfo.label} - ${order.orderNumber} | SL HUB COMPUTER`,
    html,
  });
}

// ---------------------------------------------------------------------------
// sendWelcomeEmail - Email to new customer
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(customer: {
  name: string;
  email: string;
}): Promise<{ success: boolean; message?: string }> {
  const html = generateEmailTemplate({
    title: "Welcome to SL HUB COMPUTER",
    heading: "Welcome to SL HUB COMPUTER! 🖥️",
    body: `
      <p>Hi <span class="highlight">${customer.name}</span>,</p>
      <p>Welcome to SL HUB COMPUTER — your trusted tech partner in Deiyandara, Sri Lanka! We're thrilled to have you on board.</p>

      <div class="divider"></div>

      <p style="margin-bottom:8px;"><strong>What you can do:</strong></p>
      <p>🛒 <strong>Shop Premium Products</strong> — Browse our wide range of computer parts, peripherals, and accessories.</p>
      <p>🖥️ <strong>Build Your Dream PC</strong> — Use our PC Builder to create the perfect custom build.</p>
      <p>🔧 <strong>Expert Services</strong> — From repairs to CCTV installations, we've got you covered.</p>
      <p>💰 <strong>Best Deals</strong> — Enjoy competitive prices and exclusive offers.</p>

      <div class="divider"></div>

      <div class="alert-box info">
        <p>📞 Need help? Reach us on WhatsApp at <strong>071 067 8944</strong> or visit our store on Hakmana Road, Deiyandara.</p>
      </div>
    `,
    ctaLink: "https://wa.me/94710678944",
    ctaText: "Chat with Us",
    footer: "You're receiving this email because you created an account at SL HUB COMPUTER.",
  });

  return sendEmail({
    to: customer.email,
    subject: "Welcome to SL HUB COMPUTER! 🖥️",
    html,
  });
}

// ---------------------------------------------------------------------------
// sendContactFormNotification - Email to admin about new contact message
// ---------------------------------------------------------------------------
export async function sendContactFormNotification(message: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> {
  const adminEmail = process.env.EMAIL_FROM?.includes("<")
    ? process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || "slhubcomputer@gmail.com"
    : process.env.EMAIL_FROM || "slhubcomputer@gmail.com";

  const html = generateEmailTemplate({
    title: `New Contact: ${message.subject}`,
    heading: "New Contact Message 📩",
    body: `
      <p>A new message has been submitted through the contact form.</p>

      <div class="divider"></div>

      <p><strong>From:</strong> <span class="highlight">${message.name}</span></p>
      <p><strong>Email:</strong> ${message.email}</p>
      ${message.phone ? `<p><strong>Phone:</strong> ${message.phone}</p>` : ""}
      <p><strong>Subject:</strong> ${message.subject}</p>

      <div class="divider"></div>

      <p style="margin-bottom:8px;"><strong>Message:</strong></p>
      <div style="background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155;">
        <p style="white-space: pre-wrap; margin: 0;">${message.message}</p>
      </div>

      <div style="margin-top: 16px;">
        <a href="mailto:${message.email}" class="cta-button" style="background: linear-gradient(135deg, #3b82f6, #60a5fa);">Reply via Email</a>
      </div>
    `,
    ctaLink: `mailto:${message.email}`,
    ctaText: "Reply to Customer",
    footer: "This is an admin notification from SL HUB COMPUTER.",
  });

  return sendEmail({
    to: adminEmail,
    subject: `New Contact: ${message.subject} from ${message.name} | SL HUB`,
    html,
  });
}

// ---------------------------------------------------------------------------
// sendStockAlertEmail - Email to admin about low stock product
// ---------------------------------------------------------------------------
export async function sendStockAlertEmail(product: {
  name: string;
  sku?: string | null;
  stock: number;
  price: number;
  category?: string;
}): Promise<{ success: boolean; message?: string }> {
  const adminEmail = process.env.EMAIL_FROM?.includes("<")
    ? process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || "slhubcomputer@gmail.com"
    : process.env.EMAIL_FROM || "slhubcomputer@gmail.com";

  const html = generateEmailTemplate({
    title: `Low Stock Alert: ${product.name}`,
    heading: "⚠️ Low Stock Alert",
    body: `
      <p>A product is running low on stock and needs attention.</p>

      <div class="alert-box warning">
        <p>⚠️ <strong>${product.name}</strong> has only <strong>${product.stock}</strong> unit${product.stock === 1 ? "" : "s"} remaining!</p>
      </div>

      <div class="divider"></div>

      <p><strong>Product:</strong> <span class="highlight">${product.name}</span></p>
      ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ""}
      <p><strong>Current Stock:</strong> ${product.stock} unit${product.stock === 1 ? "" : "s"}</p>
      <p><strong>Price:</strong> ${formatCurrency(product.price)}</p>
      ${product.category ? `<p><strong>Category:</strong> ${product.category}</p>` : ""}

      <p style="margin-top: 16px;">Consider restocking this item to avoid out-of-stock situations.</p>
    `,
    footer: "This is an automated stock alert from SL HUB COMPUTER.",
  });

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock: ${product.name} (${product.stock} left) | SL HUB`,
    html,
  });
}

// ---------------------------------------------------------------------------
// isEmailConfigured - Check if SMTP is available
// ---------------------------------------------------------------------------
export function isEmailConfigured(): boolean {
  return isSmtpConfigured;
}
