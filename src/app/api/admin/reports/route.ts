// =============================================================================
// SL HUB COMPUTER - Sales Reports API
// =============================================================================
// Purpose: Aggregated sales data for admin reporting
// Features:
//   - Revenue by period (daily, weekly, monthly)
//   - Order counts by period
//   - Top products by revenue
//   - Category distribution
//   - Payment method distribution
//   - Average order value
//   - Comparison with previous period
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly"; // daily, weekly, monthly
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const category = searchParams.get("category");

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

    // Previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDuration);
    const prevEndDate = new Date(startDate.getTime() - 1);

    // -----------------------------------------------------------------------
    // Build where clause
    // -----------------------------------------------------------------------
    const orderWhere: Record<string, unknown> = {
      createdAt: { gte: startDate, lte: endDate },
      status: { notIn: ["cancelled"] },
    };

    const prevOrderWhere: Record<string, unknown> = {
      createdAt: { gte: prevStartDate, lte: prevEndDate },
      status: { notIn: ["cancelled"] },
    };

    // Category filter (requires join through orderItems → products)
    let categoryFilter: string | null = null;
    if (category && category !== "all") {
      categoryFilter = category;
    }

    // -----------------------------------------------------------------------
    // 1. Fetch orders for the period
    // -----------------------------------------------------------------------
    const [orders, prevOrders] = await Promise.all([
      db.order.findMany({
        where: orderWhere,
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
      }),
      db.order.findMany({
        where: prevOrderWhere,
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
      }),
    ]);

    // Apply category filter to orders if specified
    const filteredOrders = categoryFilter
      ? orders.filter((order) =>
          order.items.some(
            (item) => item.product?.category?.name === categoryFilter
          )
        )
      : orders;

    const filteredPrevOrders = categoryFilter
      ? prevOrders.filter((order) =>
          order.items.some(
            (item) => item.product?.category?.name === categoryFilter
          )
        )
      : prevOrders;

    // -----------------------------------------------------------------------
    // 2. Calculate summary metrics
    // -----------------------------------------------------------------------
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const prevTotalRevenue = filteredPrevOrders.reduce((sum, o) => sum + o.total, 0);
    const prevTotalOrders = filteredPrevOrders.length;
    const prevAvgOrderValue = prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;

    // -----------------------------------------------------------------------
    // 3. Revenue & Orders by period breakdown
    // -----------------------------------------------------------------------
    const revenueByPeriod: { date: string; revenue: number; orders: number }[] = [];

    if (period === "daily") {
      // Group by hour for daily view
      for (let h = 0; h < 24; h++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(startDate);
        hourEnd.setHours(h, 59, 59, 999);

        const hourOrders = filteredOrders.filter(
          (o) =>
            new Date(o.createdAt) >= hourStart &&
            new Date(o.createdAt) <= hourEnd
        );

        revenueByPeriod.push({
          date: `${h.toString().padStart(2, "0")}:00`,
          revenue: hourOrders.reduce((sum, o) => sum + o.total, 0),
          orders: hourOrders.length,
        });
      }
    } else if (period === "weekly") {
      // Group by day for weekly view
      for (let d = 0; d < 7; d++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(startDate.getDate() + d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = filteredOrders.filter(
          (o) =>
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) <= dayEnd
        );

        revenueByPeriod.push({
          date: dayStart.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length,
        });
      }
    } else if (period === "monthly") {
      // Group by day for monthly view
      const daysInMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          d
        );
        const dayEnd = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          d,
          23,
          59,
          59,
          999
        );

        const dayOrders = filteredOrders.filter(
          (o) =>
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) <= dayEnd
        );

        revenueByPeriod.push({
          date: d.toString(),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length,
        });
      }
    } else {
      // Custom date range - group by day
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const numDays = Math.min(daysDiff + 1, 90); // Cap at 90 days

      for (let d = 0; d < numDays; d++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(startDate.getDate() + d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = filteredOrders.filter(
          (o) =>
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) <= dayEnd
        );

        revenueByPeriod.push({
          date: dayStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length,
        });
      }
    }

    // -----------------------------------------------------------------------
    // 4. Top products by revenue
    // -----------------------------------------------------------------------
    const productRevenueMap = new Map<
      string,
      { name: string; revenue: number; quantity: number; orders: number }
    >();

    for (const order of filteredOrders) {
      for (const item of order.items) {
        if (categoryFilter && item.product?.category?.name !== categoryFilter)
          continue;

        const existing = productRevenueMap.get(item.productId) || {
          name: item.name,
          revenue: 0,
          quantity: 0,
          orders: 0,
        };
        existing.revenue += item.price * item.quantity;
        existing.quantity += item.quantity;
        existing.orders += 1;
        productRevenueMap.set(item.productId, existing);
      }
    }

    const topProducts = Array.from(productRevenueMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // -----------------------------------------------------------------------
    // 5. Category distribution
    // -----------------------------------------------------------------------
    const categoryRevenueMap = new Map<
      string,
      { revenue: number; quantity: number }
    >();

    for (const order of filteredOrders) {
      for (const item of order.items) {
        const catName = item.product?.category?.name || "Uncategorized";
        const existing = categoryRevenueMap.get(catName) || {
          revenue: 0,
          quantity: 0,
        };
        existing.revenue += item.price * item.quantity;
        existing.quantity += item.quantity;
        categoryRevenueMap.set(catName, existing);
      }
    }

    const categoryDistribution = Array.from(categoryRevenueMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Find top category
    const topCategory =
      categoryDistribution.length > 0 ? categoryDistribution[0].name : "N/A";

    // -----------------------------------------------------------------------
    // 6. Payment method distribution
    // -----------------------------------------------------------------------
    const paymentMethodMap = new Map<string, { count: number; revenue: number }>();

    for (const order of filteredOrders) {
      const method = order.paymentMethod || "cod";
      const existing = paymentMethodMap.get(method) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += order.total;
      paymentMethodMap.set(method, existing);
    }

    const paymentMethodDistribution = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        method,
        ...data,
      })
    );

    // -----------------------------------------------------------------------
    // 7. Order status breakdown
    // -----------------------------------------------------------------------
    const statusMap = new Map<string, number>();
    for (const order of filteredOrders) {
      const count = statusMap.get(order.status) || 0;
      statusMap.set(order.status, count + 1);
    }

    const orderStatusBreakdown = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count })
    );

    // -----------------------------------------------------------------------
    // 8. Comparison with previous period
    // -----------------------------------------------------------------------
    const revenueChange =
      prevTotalRevenue > 0
        ? Math.round(
            ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
          )
        : totalRevenue > 0
        ? 100
        : 0;

    const orderChange =
      prevTotalOrders > 0
        ? Math.round(
            ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
          )
        : totalOrders > 0
        ? 100
        : 0;

    const avgOrderChange =
      prevAvgOrderValue > 0
        ? Math.round(
            ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
          )
        : avgOrderValue > 0
        ? 100
        : 0;

    // -----------------------------------------------------------------------
    // 9. Get all categories for filter dropdown
    // -----------------------------------------------------------------------
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // -----------------------------------------------------------------------
    // Return aggregated data
    // -----------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        // Summary
        totalRevenue,
        totalOrders,
        avgOrderValue,
        topCategory,

        // Comparison
        prevTotalRevenue,
        prevTotalOrders,
        prevAvgOrderValue,
        revenueChange,
        orderChange,
        avgOrderChange,

        // Charts
        revenueByPeriod,
        topProducts,
        categoryDistribution,
        paymentMethodDistribution,
        orderStatusBreakdown,

        // Filter options
        categories: categories.map((c) => c.name),

        // Period info
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
