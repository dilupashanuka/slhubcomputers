// =============================================================================
// SL HUB COMPUTER - Sales Reports CSV Export API
// =============================================================================
// Purpose: Generate CSV export of orders for download
// Features:
//   - Same filter support as reports API (period, dates, category, payment method)
//   - CSV format with proper headers and escaping
//   - Returns CSV as downloadable file
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const category = searchParams.get("category");
    const paymentMethod = searchParams.get("paymentMethod");

    // -----------------------------------------------------------------------
    // Date range calculation
    // -----------------------------------------------------------------------
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case "daily":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "monthly":
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
    }

    // -----------------------------------------------------------------------
    // Build where clause
    // -----------------------------------------------------------------------
    const where: Record<string, unknown> = {
      createdAt: { gte: startDate, lte: endDate },
    };

    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    // -----------------------------------------------------------------------
    // Fetch orders
    // -----------------------------------------------------------------------
    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply category filter in-memory (since it requires join filtering)
    const filteredOrders = category && category !== "all"
      ? orders.filter((order) =>
          order.items.some(
            (item) => item.product?.category?.name === category
          )
        )
      : orders;

    // -----------------------------------------------------------------------
    // Generate CSV
    // -----------------------------------------------------------------------
    const headers = [
      "Order Number",
      "Date",
      "Customer",
      "Phone",
      "Email",
      "Items",
      "Subtotal (Rs.)",
      "Shipping (Rs.)",
      "Discount (Rs.)",
      "Total (Rs.)",
      "Status",
      "Payment Method",
      "Payment Status",
      "City",
    ];

    const escapeCSV = (value: string | number | null | undefined): string => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const formatPaymentMethod = (method: string): string => {
      switch (method) {
        case "cod":
          return "Cash on Delivery";
        case "bank_transfer":
          return "Bank Transfer";
        default:
          return method;
      }
    };

    const formatStatus = (status: string): string => {
      return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    };

    const rows = filteredOrders.map((order) => {
      const itemsList = order.items
        .map((item) => `${item.name} x${item.quantity}`)
        .join("; ");

      return [
        escapeCSV(order.orderNumber),
        escapeCSV(new Date(order.createdAt).toLocaleDateString("en-LK")),
        escapeCSV(order.name),
        escapeCSV(order.phone),
        escapeCSV(order.email),
        escapeCSV(itemsList),
        escapeCSV(order.subtotal),
        escapeCSV(order.shipping),
        escapeCSV(order.discount),
        escapeCSV(order.total),
        escapeCSV(formatStatus(order.status)),
        escapeCSV(formatPaymentMethod(order.paymentMethod)),
        escapeCSV(formatStatus(order.paymentStatus)),
        escapeCSV(order.city),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Add BOM for Excel compatibility with Unicode
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // -----------------------------------------------------------------------
    // Return as downloadable CSV
    // -----------------------------------------------------------------------
    const filename = `slhub-orders-${period}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export report" },
      { status: 500 }
    );
  }
}
