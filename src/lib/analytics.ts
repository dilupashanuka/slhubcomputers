// =============================================================================
// SL HUB COMPUTER - Analytics Library
// =============================================================================
// Purpose: Client-side analytics tracking functions and server-side helpers
// Features: Track page views, events, conversion funnel data
// Uses: In-memory caching + database persistence
// =============================================================================

// ---------------------------------------------------------------------------
// In-memory analytics store (fast reads, synced to DB)
// ---------------------------------------------------------------------------
interface InMemoryStats {
  pageViewsToday: number;
  uniqueVisitorsToday: Set<string>;
  topViewedProducts: Map<string, number>;
  eventsToday: Map<string, number>; // eventType -> count
  lastResetDate: string;
}

const memoryStats: InMemoryStats = {
  pageViewsToday: 0,
  uniqueVisitorsToday: new Set(),
  topViewedProducts: new Map(),
  eventsToday: new Map(),
  lastResetDate: new Date().toISOString().split("T")[0],
};

// Reset daily counters if date changed
function checkDailyReset() {
  const today = new Date().toISOString().split("T")[0];
  if (memoryStats.lastResetDate !== today) {
    memoryStats.pageViewsToday = 0;
    memoryStats.uniqueVisitorsToday.clear();
    memoryStats.eventsToday.clear();
    memoryStats.lastResetDate = today;
  }
}

// ---------------------------------------------------------------------------
// Server-side: Track a page view or event in the database
// ---------------------------------------------------------------------------
export async function trackEventInDB(params: {
  type: string;
  page?: string;
  productId?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const { db } = await import("@/lib/db");
    await db.analyticsEvent.create({
      data: {
        type: params.type,
        page: params.page || null,
        productId: params.productId || null,
        sessionId: params.sessionId || null,
        meta: params.meta ? JSON.stringify(params.meta) : null,
      },
    });

    // Update in-memory stats
    checkDailyReset();
    if (params.type === "page_view") {
      memoryStats.pageViewsToday++;
      if (params.sessionId) {
        memoryStats.uniqueVisitorsToday.add(params.sessionId);
      }
    }
    if (params.type === "product_view" && params.productId) {
      const current = memoryStats.topViewedProducts.get(params.productId) || 0;
      memoryStats.topViewedProducts.set(params.productId, current + 1);
    }
    const eventCount = memoryStats.eventsToday.get(params.type) || 0;
    memoryStats.eventsToday.set(params.type, eventCount + 1);
  } catch (error) {
    console.error("Analytics track error:", error);
  }
}

// ---------------------------------------------------------------------------
// Server-side: Get comprehensive analytics data
// ---------------------------------------------------------------------------
export async function getAnalyticsData() {
  const { db } = await import("@/lib/db");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Page views today
  const pageViewsToday = await db.analyticsEvent.count({
    where: {
      type: "page_view",
      createdAt: { gte: today },
    },
  });

  // Page views last 7 days - Optimized Single Query
  const sevenDaysAgoStart = new Date(today);
  sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6);

  const allPageViewsLastWeek = await db.analyticsEvent.findMany({
    where: {
      type: "page_view",
      createdAt: { gte: sevenDaysAgoStart },
    },
    select: { createdAt: true },
  });

  const dailyPageViews: { date: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(today);
    dayDate.setDate(dayDate.getDate() - i);
    
    const count = allPageViewsLastWeek.filter(v => 
      v.createdAt.getDate() === dayDate.getDate() &&
      v.createdAt.getMonth() === dayDate.getMonth() &&
      v.createdAt.getFullYear() === dayDate.getFullYear()
    ).length;

    dailyPageViews.push({
      date: dayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      views: count,
    });
  }

  // Unique visitors today (by session)
  const uniqueVisitorsToday = await db.analyticsEvent.groupBy({
    by: ["sessionId"],
    where: {
      type: "page_view",
      createdAt: { gte: today },
      sessionId: { not: null },
    },
  });

  // Top viewed products (last 30 days)
  const topViewedProductsRaw = await db.analyticsEvent.groupBy({
    by: ["productId"],
    where: {
      type: "product_view",
      productId: { not: null },
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });

  // Batch get product names for top viewed
  const productIds = topViewedProductsRaw.map(p => p.productId).filter(Boolean) as string[];
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, images: true },
  });

  const topViewedProducts = topViewedProductsRaw.map(p => {
    const product = products.find(prod => prod.id === p.productId);
    const parsed = typeof product?.images === "string" ? JSON.parse(product.images || "[]") : (product?.images || []);
    return {
      productId: p.productId!,
      name: product?.name || "Unknown Product",
      price: product?.price || 0,
      image: product ? parsed[0] : null,
      views: p._count.productId,
    };
  });

  // Conversion funnel (last 30 days)
  const [viewCount, cartCount, checkoutCount, orderCount] = await Promise.all([
    db.analyticsEvent.count({
      where: { type: "product_view", createdAt: { gte: thirtyDaysAgo } },
    }),
    db.analyticsEvent.count({
      where: { type: "add_to_cart", createdAt: { gte: thirtyDaysAgo } },
    }),
    db.analyticsEvent.count({
      where: { type: "checkout", createdAt: { gte: thirtyDaysAgo } },
    }),
    db.analyticsEvent.count({
      where: { type: "order_placed", createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const conversionRate = viewCount > 0
    ? ((orderCount / viewCount) * 100).toFixed(2)
    : "0.00";

  // Customer demographics
  const totalCustomers = await db.customer.count();
  const activeCustomers = await db.customer.count({
    where: { isActive: true },
  });

  // Customers with orders
  const customersWithOrders = await db.customer.findMany({
    where: { orders: { some: {} } },
    select: { id: true },
  });

  // Return customer rate (customers with 2+ orders)
  const returningCustomersRaw = await db.customer.findMany({
    where: { orders: { some: {} } },
    select: { id: true, _count: { select: { orders: true } } },
  });
  const returningCustomerCount = returningCustomersRaw.filter(
    (c) => c._count.orders >= 2
  ).length;

  // Events breakdown today
  const eventsTodayRaw = await db.analyticsEvent.groupBy({
    by: ["type"],
    where: { createdAt: { gte: today } },
    _count: { type: true },
  });

  const eventsToday = eventsTodayRaw.map((e) => ({
    type: e.type,
    count: e._count.type,
  }));

  // Total page views (all time)
  const totalPageViews = await db.analyticsEvent.count({
    where: { type: "page_view" },
  });

  return {
    // Real-time stats
    pageViewsToday,
    uniqueVisitorsToday: uniqueVisitorsToday.length,
    totalPageViews,

    // Trends
    dailyPageViews,

    // Top products
    topViewedProducts,

    // Conversion funnel
    conversionFunnel: {
      views: viewCount,
      addToCart: cartCount,
      checkout: checkoutCount,
      orders: orderCount,
    },
    conversionRate: parseFloat(conversionRate),

    // Customer demographics
    totalCustomers,
    activeCustomers,
    customersWithOrders: customersWithOrders.length,
    returningCustomerRate:
      totalCustomers > 0
        ? parseFloat(((returningCustomerCount / totalCustomers) * 100).toFixed(1))
        : 0,

    // Events breakdown
    eventsToday,
  };
}
