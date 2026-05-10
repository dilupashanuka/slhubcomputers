// =============================================================================
// SL HUB COMPUTER - Invoice PDF API Route
// =============================================================================
// Purpose: Generate a printable HTML invoice for an order
// Features: Professional invoice layout with @media print styles, SL HUB branding,
//           items table, subtotal/shipping/discount/total, payment info
// API: GET /api/admin/orders/[id]/invoice
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Get site settings
    const settings = await db.siteSettings.findUnique({
      where: { id: "site-settings" },
    });

    const siteName = settings?.siteName || "SL HUB COMPUTER";
    const siteAddress = settings?.address || "Hakmana Road, Deiyandara, Sri Lanka";
    const sitePhone = settings?.phone || "071 067 8944";
    const siteEmail = settings?.email || "slhubcomputer@gmail.com";

    // Build items rows
    const itemRows = order.items
      .map(
        (item, i) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${i + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 500;">${item.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; font-weight: 500;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const statusColor = order.status === "cancelled" ? "#dc2626" : order.status === "delivered" ? "#16a34a" : "#2563eb";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderNumber} | ${siteName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f4f6;
      color: #1f2937;
      line-height: 1.6;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 30px auto;
      background: white;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      color: white;
      padding: 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .brand p {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta .invoice-label {
      font-size: 11px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-meta .invoice-number {
      font-size: 20px;
      font-weight: 700;
      margin-top: 2px;
    }
    .invoice-meta .invoice-date {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 4px;
    }
    .invoice-body {
      padding: 32px 40px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .info-box {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px 20px;
      border: 1px solid #e5e7eb;
    }
    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .info-box p {
      font-size: 13px;
      color: #374151;
    }
    .info-box .name {
      font-weight: 600;
      font-size: 14px;
      color: #111827;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
      background: ${statusColor};
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table thead th {
      background: #1e3a5f;
      color: white;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      text-align: left;
    }
    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(5) { text-align: right; }
    .items-table thead th:nth-child(4) { text-align: center; }
    .totals-section {
      display: flex;
      justify-content: flex-end;
    }
    .totals-box {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #6b7280;
    }
    .totals-row.grand-total {
      border-top: 2px solid #1e3a5f;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #1e3a5f;
    }
    .payment-info {
      margin-top: 32px;
      padding: 16px 20px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
    }
    .payment-info h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0369a1;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .payment-info p {
      font-size: 13px;
      color: #0c4a6e;
    }
    .footer {
      text-align: center;
      padding: 20px 40px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .footer p {
      font-size: 11px;
      color: #9ca3af;
    }
    .footer .brand-footer {
      font-weight: 600;
      color: #6b7280;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      transition: background 0.2s;
    }
    .print-btn:hover { background: #1d4ed8; }
    @media print {
      body { background: white; }
      .invoice-wrapper { box-shadow: none; margin: 0; border-radius: 0; }
      .print-btn { display: none !important; }
      .invoice-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .items-table thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .status-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .payment-info { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <div class="brand">
        <h1>🖥️ ${siteName}</h1>
        <p>${siteAddress}</p>
        <p>📞 ${sitePhone} | ✉️ ${siteEmail}</p>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-number">${order.orderNumber}</div>
        <div class="invoice-date">${invoiceDate}</div>
        <div style="margin-top:8px;">
          <span class="status-badge">${order.status.toUpperCase()}</span>
        </div>
      </div>
    </div>
    <div class="invoice-body">
      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To</h3>
          <p class="name">${order.name}</p>
          <p>${order.address || ""}</p>
          <p>${order.city || ""}</p>
          <p>📞 ${order.phone}</p>
          ${order.email ? `<p>✉️ ${order.email}</p>` : ""}
        </div>
        <div class="info-box">
          <h3>Order Details</h3>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${invoiceDate}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
          <p><strong>Status:</strong> <span class="status-badge">${order.status.toUpperCase()}</span></p>
        </div>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <div class="totals-section">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>Rs. ${order.subtotal.toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>Shipping</span>
            <span>${order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}</span>
          </div>
          ${order.discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-Rs. ${order.discount.toLocaleString()}</span></div>` : ""}
          <div class="totals-row grand-total">
            <span>Total</span>
            <span>Rs. ${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      ${order.paymentMethod === "bank_transfer" ? `
      <div class="payment-info">
        <h3>💳 Bank Transfer Details</h3>
        <p><strong>Bank:</strong> Bank of Ceylon</p>
        <p><strong>Account Name:</strong> SL Hub Computer</p>
        <p><strong>Account Number:</strong> 1234567890</p>
        <p><strong>Branch:</strong> Deiyandara</p>
        <p style="margin-top:8px; font-size:11px; color:#0369a1;">Please include your order number as the payment reference.</p>
      </div>` : ""}
      ${order.notes ? `
      <div style="margin-top:24px; padding:12px 16px; background:#fefce8; border:1px solid #fde68a; border-radius:8px;">
        <h3 style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#92400e; margin-bottom:4px; font-weight:600;">Notes</h3>
        <p style="font-size:13px; color:#78350f;">${order.notes}</p>
      </div>` : ""}
    </div>
    <div class="footer">
      <p class="brand-footer">${siteName}</p>
      <p>Thank you for your business! | ${sitePhone} | ${siteEmail}</p>
      <p style="margin-top:4px;">This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
