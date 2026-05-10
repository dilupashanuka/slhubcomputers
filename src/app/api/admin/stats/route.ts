// =============================================================================
// SL HUB COMPUTER - Enhanced Admin Stats API
// =============================================================================
// Purpose: Comprehensive dashboard analytics with revenue trends, top products,
//          category breakdown, customer insights, and activity data.
// Features:
//   - Basic counts (products, categories, brands, orders, reviews, messages)
//   - Monthly revenue data (last 12 months) for area chart
//   - Top 5 products by revenue
//   - Category-wise product distribution for pie chart
//   - Order status distribution
//   - Recent activity feed (orders, messages, reviews)
//   - Customer acquisition data
//   - Comparison metrics (vs previous month)
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // -------------------------------------------------------------------------
    // 1. Basic Count Statistics
    // -------------------------------------------------------------------------
    const [
      productCount,
      categoryCount,
      brandCount,
      orderCount,
      reviewCount,
      unreadMessageCount,
      prebuiltPCCount,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
    ] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.brand.count(),
      db.order.count(),
      db.review.count(),
      db.contactMessage.count({ where: { isRead: false } }),
      db.prebuiltPC.count(),
      db.order.count({ where: { status: "pending" } }),
      db.order.count({ where: { status: "confirmed" } }),
      db.order.count({ where: { status: "delivered" } }),
    ]);

    // Total revenue
    const revenueAggregate = await db.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ["cancelled"] } },
    });
    const totalRevenue = revenueAggregate._sum.total || 0;

    // -------------------------------------------------------------------------
    // 2. Monthly Revenue Data (Last 12 Months)
    // -------------------------------------------------------------------------
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthOrders = await db.order.findMany({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { notIn: ["cancelled"] },
        },
        select: { total: true },
      });

      const monthLabel = startOfMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
      });
    }

    // -------------------------------------------------------------------------
    // 3. Revenue Comparison (Current vs Previous Month)
    // -------------------------------------------------------------------------
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonthOrders, previousMonthOrders] = await Promise.all([
      db.order.findMany({
        where: {
          createdAt: { gte: currentMonthStart },
          status: { notIn: ["cancelled"] },
        },
        select: { total: true },
      }),
      db.order.findMany({
        where: {
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
          status: { notIn: ["cancelled"] },
        },
        select: { total: true },
      }),
    ]);

    const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const previousMonthRevenue = previousMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange = previousMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : 0;

    // -------------------------------------------------------------------------
    // 4. Order Comparison (Current vs Previous Month)
    // -------------------------------------------------------------------------
    const currentMonthOrderCount = currentMonthOrders.length;
    const previousMonthOrderCount = previousMonthOrders.length;
    const orderChange = previousMonthOrderCount > 0
      ? Math.round(((currentMonthOrderCount - previousMonthOrderCount) / previousMonthOrderCount) * 100)
      : 0;

    // -------------------------------------------------------------------------
    // 5. Top 5 Products by Revenue (from order items)
    // -------------------------------------------------------------------------
    const topProducts = await db.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, price: true },
      _count: true,
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    });

    const topProductsWithRevenue = topProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      quantitySold: p._sum.quantity || 0,
      revenue: (p._sum.price || 0) * (p._sum.quantity || 0),
      orderCount: p._count,
    }));

    // -------------------------------------------------------------------------
    // 6. Category-wise Product Distribution
    // -------------------------------------------------------------------------
    const categoriesWithCounts = await db.category.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: { select: { products: true } },
      },
      orderBy: { products: { _count: "desc" } },
    });

    const categoryDistribution = categoriesWithCounts.map((c) => ({
      name: c.name,
      count: c._count.products,
    }));

    // -------------------------------------------------------------------------
    // 7. Order Status Distribution
    // -------------------------------------------------------------------------
    const orderStatusData = await db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const orderStatusDistribution = orderStatusData.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // -------------------------------------------------------------------------
    // 8. Recent Activity Feed (Last 10 events)
    // -------------------------------------------------------------------------
    const [recentOrders, recentMessages, recentReviews] = await Promise.all([
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          name: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      db.contactMessage.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subject: true,
          isRead: true,
          createdAt: true,
        },
      }),
      db.review.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          rating: true,
          productId: true,
          isApproved: true,
          createdAt: true,
        },
      }),
    ]);

    // Build unified activity feed
    type ActivityItem = {
      id: string;
      type: "order" | "message" | "review";
      title: string;
      description: string;
      timestamp: Date;
      status?: string;
      meta?: Record<string, unknown>;
    };

    const activityItems: ActivityItem[] = [
      ...recentOrders.map((o) => ({
        id: `order-${o.id}`,
        type: "order" as const,
        title: `New Order ${o.orderNumber}`,
        description: `${o.name} - Rs. ${o.total.toLocaleString("en-LK")}`,
        timestamp: o.createdAt,
        status: o.status,
      })),
      ...recentMessages.map((m) => ({
        id: `msg-${m.id}`,
        type: "message" as const,
        title: `Message from ${m.name}`,
        description: m.subject || "No subject",
        timestamp: m.createdAt,
        status: m.isRead ? "read" : "unread",
      })),
      ...recentReviews.map((r) => ({
        id: `review-${r.id}`,
        type: "review" as const,
        title: `Review by ${r.name}`,
        description: `${r.rating}/5 stars - ${r.isApproved ? "Approved" : "Pending"}`,
        timestamp: r.createdAt,
        status: r.isApproved ? "approved" : "pending",
      })),
    ];

    // Sort by timestamp descending and take top 10
    activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activityItems.slice(0, 10).map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }));

    // -------------------------------------------------------------------------
    // 9. Customer Stats
    // -------------------------------------------------------------------------
    const uniqueCustomers = await db.order.findMany({
      select: { phone: true },
      distinct: ["phone"],
    });

    const returningCustomers = await db.order.groupBy({
      by: ["phone"],
      having: { phone: { _count: { gt: 1 } } },
      _count: { phone: true },
    });

    // -------------------------------------------------------------------------
    // 10. Average Order Value
    // -------------------------------------------------------------------------
    const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    // -------------------------------------------------------------------------
    // Return Complete Dashboard Data
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        // Basic counts
        products: productCount,
        categories: categoryCount,
        brands: brandCount,
        orders: orderCount,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalRevenue,
        reviews: reviewCount,
        unreadMessages: unreadMessageCount,
        prebuiltPCs: prebuiltPCCount,

        // Enhanced analytics
        monthlyRevenue,
        revenueChange,
        orderChange,
        currentMonthRevenue,
        previousMonthRevenue,
        currentMonthOrderCount,
        previousMonthOrderCount,

        // Top products
        topProducts: topProductsWithRevenue,

        // Distribution data
        categoryDistribution,
        orderStatusDistribution,

        // Activity feed
        recentActivity,

        // Customer insights
        totalCustomers: uniqueCustomers.length,
        returningCustomers: returningCustomers.length,

        // Averages
        avgOrderValue,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
