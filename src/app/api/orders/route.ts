// =============================================================================
// SL HUB COMPUTER - Public Orders API Route
// =============================================================================
// Purpose: Public endpoint for creating orders from the checkout page
// Features: Creates order with items in a transaction, generates order number,
//           validates required fields, returns created order with order number,
//           sends email confirmation, creates admin notification
// Security: Input sanitization, phone validation
// API: POST /api/orders - Create a new order
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { sanitizeForStorage, validatePhone, validateEmail } from "@/lib/sanitize";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/orders - Create a new order with items
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, phone, address, subtotal, total, items, orderNumber } = body;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and address are required" },
        { status: 400 }
      );
    }

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    if (!items || !items.create || items.create.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = validatePhone(String(phone));
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (body.email) {
      const emailValidation = validateEmail(String(body.email));
      if (!emailValidation.valid) {
        return NextResponse.json(
          { success: false, error: emailValidation.error },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const sanitizedName = sanitizeForStorage(String(name).trim());
    const sanitizedPhone = phoneValidation.formatted || sanitizeForStorage(String(phone).trim());
    const sanitizedAddress = sanitizeForStorage(String(address).trim());
    const sanitizedEmail = body.email ? String(body.email).trim().toLowerCase() : null;
    const sanitizedCity = body.city ? sanitizeForStorage(String(body.city).trim()) : null;
    const sanitizedNotes = body.notes ? sanitizeForStorage(String(body.notes).trim()) : null;

    // Create the order with items using nested create
    const order = await db.order.create({
      data: {
        orderNumber: sanitizeForStorage(String(orderNumber)),
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        address: sanitizedAddress,
        city: sanitizedCity,
        notes: sanitizedNotes,
        subtotal: Number(subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        total: Number(total) || 0,
        status: body.status || "pending",
        paymentMethod: body.paymentMethod || "cod",
        items: {
          create: items.create.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
            productId: sanitizeForStorage(String(item.productId)),
            name: sanitizeForStorage(String(item.name)),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // ---------------------------------------------------------------
    // Handle Affiliate Commission Tracking
    // Check for affiliate code in cookies or request body
    // ---------------------------------------------------------------
    try {
      const affiliateCode = body.affiliateCode || request.cookies.get("slhub_affiliate_code")?.value;

      if (affiliateCode) {
        const affiliate = await db.affiliate.findUnique({
          where: { code: sanitizeForStorage(affiliateCode.toUpperCase()) },
        });

        if (affiliate && affiliate.isActive) {
          const commissionAmount = (order.total * affiliate.commissionRate) / 100;

          // Create referral record
          await db.affiliateReferral.create({
            data: {
              affiliateId: affiliate.id,
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: order.name,
              customerEmail: order.email,
              amount: order.total,
              commission: commissionAmount,
              status: "pending",
            },
          });

          // Update affiliate stats
          await db.affiliate.update({
            where: { id: affiliate.id },
            data: {
              conversions: { increment: 1 },
              pendingEarnings: { increment: commissionAmount },
              totalEarnings: { increment: commissionAmount },
            },
          });

          // Create notification for affiliate referral
          try {
            await db.notification.create({
              data: {
                type: "system",
                title: `Affiliate Referral - ${affiliate.code}`,
                message: `${affiliate.name} earned Rs. ${commissionAmount.toLocaleString("en-LK")} from order ${order.orderNumber}`,
                link: "/admin/affiliates",
              },
            });
          } catch {
            // Notification is non-critical
          }
        }
      }
    } catch (affiliateError) {
      console.error("Affiliate tracking error:", affiliateError);
      // Don't fail the order if affiliate tracking fails
    }

    // ---------------------------------------------------------------
    // Create admin notification for new order
    // ---------------------------------------------------------------
    try {
      await db.notification.create({
        data: {
          type: "order",
          title: `New Order ${order.orderNumber}`,
          message: `${order.name} - Rs. ${order.total.toLocaleString("en-LK")}`,
          link: "/admin/orders",
        },
      });
    } catch (notifError) {
      console.error("Failed to create order notification:", notifError);
      // Non-blocking - don't fail the order
    }

    // ---------------------------------------------------------------
    // Send order confirmation email (non-blocking)
    // ---------------------------------------------------------------
    if (order.email) {
      sendOrderConfirmation({
        orderNumber: order.orderNumber,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }).catch((emailError) => {
        console.error("Order confirmation email error:", emailError);
        // Non-blocking
      });
    }

    // ---------------------------------------------------------------
    // Send order confirmation SMS (non-blocking)
    // ---------------------------------------------------------------
    sendOrderConfirmationSMS({
      orderNumber: order.orderNumber,
      name: order.name,
      phone: order.phone,
      total: order.total,
      paymentMethod: order.paymentMethod,
    }).catch((smsError) => {
      console.error("Order confirmation SMS error:", smsError);
      // Non-blocking
    });

    return NextResponse.json(
      { success: true, data: order, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
