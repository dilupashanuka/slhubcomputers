// =============================================================================
// SL HUB COMPUTER - Customizable Admin Dashboard Page
// =============================================================================
// Purpose: Widget-based dashboard with customizable layout, drag & drop, and
//          add/remove widgets from a palette
// Features:
//   - Stat cards with comparison indicators
//   - Customizable widget grid with edit mode
//   - Widget palette for adding/removing widgets
//   - Save/load layout from localStorage
//   - Reset to default layout
//   - Auto-refresh every 60 seconds
// =============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Star,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  LayoutDashboard,
  Globe,
  MousePointerClick,
  Target,
  Users,
  Settings2,
  RotateCcw,
  Plus,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RevenueChartWidget,
} from "@/components/admin/dashboard-widgets/revenue-chart-widget";
import {
  OrderStatusWidget,
} from "@/components/admin/dashboard-widgets/order-status-widget";
import {
  TopProductsWidget,
} from "@/components/admin/dashboard-widgets/top-products-widget";
import {
  RecentOrdersWidget,
} from "@/components/admin/dashboard-widgets/recent-orders-widget";
import {
  CustomerStatsWidget,
} from "@/components/admin/dashboard-widgets/customer-stats-widget";
import {
  StockAlertsWidget,
} from "@/components/admin/dashboard-widgets/stock-alerts-widget";
import {
  ChatSummaryWidget,
} from "@/components/admin/dashboard-widgets/chat-summary-widget";
import {
  QuickActionsWidget,
} from "@/components/admin/dashboard-widgets/quick-actions-widget";
import {
  AnalyticsFunnelWidget,
} from "@/components/admin/dashboard-widgets/analytics-funnel-widget";
import {
  CouponStatsWidget,
} from "@/components/admin/dashboard-widgets/coupon-stats-widget";
import {
  DEFAULT_LAYOUT,
  WIDGET_DEFINITIONS,
  saveLayout,
  loadLayout,
  getActiveWidgets,
  type LayoutWidget,
  type WidgetType,
} from "@/lib/dashboard-widgets";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface AnalyticsData {
  pageViewsToday: number;
  uniqueVisitorsToday: number;
  totalPageViews: number;
  conversionFunnel: { views: number; addToCart: number; checkout: number; orders: number };
  conversionRate: number;
  topViewedProducts: { productId: string; name: string; price: number; views: number }[];
}

interface StatsData {
  products: number;
  categories: number;
  brands: number;
  orders: number;
  pendingOrders: number;
  totalRevenue: number;
  reviews: number;
  unreadMessages: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  revenueChange: number;
  orderChange: number;
  currentMonthRevenue: number;
  topProducts: { productId: string; name: string; quantitySold: number; revenue: number; orderCount: number }[];
  orderStatusDistribution: { status: string; count: number }[];
  recentActivity: { id: string; type: string; title: string; description: string; timestamp: string }[];
  totalCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

function formatCompactLKR(amount: number): string {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
  return `Rs. ${amount}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Stat Card Configuration
// ---------------------------------------------------------------------------
const statCardConfig = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400", isCurrency: true, changeKey: "revenueChange" },
  { key: "orders", label: "Total Orders", icon: ShoppingCart, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", changeKey: "orderChange" },
  { key: "products", label: "Products", icon: Package, iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400" },
  { key: "categories", label: "Categories", icon: FolderTree, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { key: "brands", label: "Brands", icon: Tag, iconBg: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400" },
  { key: "pendingOrders", label: "Pending Orders", icon: Clock, iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600 dark:text-yellow-400" },
  { key: "unreadMessages", label: "Unread Messages", icon: MessageSquare, iconBg: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600 dark:text-rose-400" },
  { key: "avgOrderValue", label: "Avg. Order Value", icon: BarChart3, iconBg: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600 dark:text-cyan-400", isCurrency: true },
];

// ---------------------------------------------------------------------------
// Dashboard Page Component
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Widget layout state
  const [widgetLayout, setWidgetLayout] = useState<LayoutWidget[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);

  // Stock alerts & coupon data for widgets
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [couponData, setCouponData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Load saved layout on mount
  useEffect(() => {
    const saved = loadLayout();
    if (saved) {
      setWidgetLayout(saved);
    }
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/analytics"),
      ]);
      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();
      if (statsData.success) setStats(statsData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);

      // Fetch extra data for widgets
      try {
        const productsRes = await fetch("/api/products?limit=5&sortBy=stock&sortOrder=asc");
        const productsData = await productsRes.json();
        if (productsData.success) {
          const rawProducts = Array.isArray(productsData.data) ? productsData.data : [];
          const processedProducts = rawProducts.map((p: any) => ({
            ...p,
            images: typeof p.images === "string" ? JSON.parse(p.images || "[]") : (p.images || [])
          }));
          const lowStock = processedProducts.filter((p: any) => p.stock <= 5);
          setStockAlerts(lowStock.slice(0, 5));
        }
      } catch {}

      try {
        const couponsRes = await fetch("/api/coupons?isActive=true&limit=5");
        const couponsData = await couponsRes.json();
        if (couponsData.success) setCouponData(couponsData.data || []);
      } catch {}

      try {
        const ordersRes = await fetch("/api/admin/orders?limit=5");
        const ordersData = await ordersRes.json();
        if (ordersData.success) setRecentOrders(ordersData.data || []);
      } catch {}

      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    setWidgetLayout((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      );
      saveLayout(updated);
      return updated;
    });
  };

  // Remove widget
  const removeWidget = (widgetId: string) => {
    setWidgetLayout((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, enabled: false } : w
      );
      saveLayout(updated);
      return updated;
    });
  };

  // Reset layout
  const resetLayout = () => {
    setWidgetLayout(DEFAULT_LAYOUT);
    saveLayout(DEFAULT_LAYOUT);
  };

  // Save layout when toggling edit mode off
  const handleToggleEdit = () => {
    if (isEditing) {
      saveLayout(widgetLayout);
    }
    setIsEditing(!isEditing);
  };

  // Prepare pie chart data
  const pieData = (stats?.orderStatusDistribution || []).map((item) => {
    const total = stats.orderStatusDistribution.reduce((s, i) => s + i.count, 0);
    return { ...item, percentage: total > 0 ? Math.round((item.count / total) * 100) : 0 };
  }) || [];

  // Get active widgets
  const activeWidgets = getActiveWidgets(widgetLayout);

  // Render a widget by type
  const renderWidget = (widget: LayoutWidget) => {
    const commonProps = {
      key: widget.id,
      loading: loading,
      isEditing: isEditing,
      onRemove: () => removeWidget(widget.id),
    };

    switch (widget.type) {
      case "RevenueChart":
        return <RevenueChartWidget {...commonProps} data={stats?.monthlyRevenue || []} currentMonthRevenue={stats?.currentMonthRevenue ?? 0} />;
      case "OrderStatus":
        return <OrderStatusWidget {...commonProps} data={pieData} />;
      case "TopProducts":
        return <TopProductsWidget {...commonProps} data={stats?.topProducts || []} />;
      case "RecentOrders":
        return <RecentOrdersWidget {...commonProps} data={recentOrders} />;
      case "CustomerStats":
        return <CustomerStatsWidget {...commonProps} totalCustomers={stats?.totalCustomers ?? 0} returningCustomers={stats?.returningCustomers ?? 0} />;
      case "StockAlerts":
        return <StockAlertsWidget {...commonProps} data={stockAlerts} />;
      case "ChatSummary":
        return <ChatSummaryWidget {...commonProps} unreadCount={stats?.unreadMessages ?? 0} activeSessions={0} />;
      case "QuickActions":
        return <QuickActionsWidget {...commonProps} />;
      case "AnalyticsFunnel":
        return <AnalyticsFunnelWidget {...commonProps} data={analytics?.conversionFunnel ?? null} />;
      case "CouponStats":
        return <CouponStatsWidget {...commonProps} data={couponData} />;
      default:
        return null;
    }
  };

  // Real-time analytics stats
  const rtStats = [
    { label: "Page Views Today", value: analytics?.pageViewsToday ?? 0, icon: MousePointerClick, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Visitors Today", value: analytics?.uniqueVisitorsToday ?? 0, icon: Users, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Conversion Rate", value: `${analytics?.conversionRate ?? 0}%`, icon: Target, iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400" },
    { label: "Total Page Views", value: analytics?.totalPageViews ?? 0, icon: Globe, iconBg: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Page Header                                                        */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="size-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back to SL HUB COMPUTER admin panel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
            <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {lastRefreshed && !isRefreshing && (
            <span className="text-[10px] text-muted-foreground">
              Updated {timeAgo(lastRefreshed.toISOString())}
            </span>
          )}
          {isRefreshing && (
            <span className="text-[10px] text-primary animate-pulse">Updating...</span>
          )}

          {/* Customize Button */}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={handleToggleEdit}
          >
            <Settings2 className="size-3.5 mr-1.5" />
            {isEditing ? "Done" : "Customize"}
          </Button>

          {/* Widget Palette Popover */}
          {isEditing && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="size-3.5 mr-1.5" />
                  Add Widgets
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Available Widgets</h4>
                  <div className="space-y-2">
                    {WIDGET_DEFINITIONS.map((def) => {
                      const existing = widgetLayout.find((w) => w.id === def.id);
                      const isEnabled = existing?.enabled ?? false;
                      return (
                        <div key={def.id} className="flex items-center gap-2">
                          <Checkbox
                            id={def.id}
                            checked={isEnabled}
                            onCheckedChange={() => toggleWidget(def.id)}
                          />
                          <label htmlFor={def.id} className="text-xs font-medium cursor-pointer flex-1">
                            {def.title}
                          </label>
                          <span className="text-[10px] text-muted-foreground capitalize">{def.size}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={resetLayout}>
                      <RotateCcw className="size-3 mr-1.5" />
                      Reset to Default Layout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isEditing && (
            <Button variant="ghost" size="sm" onClick={resetLayout} className="text-xs text-muted-foreground">
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Stat Cards Grid                                                    */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardConfig.map((card) => {
          const Icon = card.icon;
          const rawValue = stats ? (stats as Record<string, unknown>)[card.key] ?? 0 : 0;
          const value = stats
            ? card.isCurrency
              ? formatCompactLKR(rawValue as number)
              : (rawValue as number).toLocaleString("en-LK")
            : "...";
          const changeValue = card.changeKey && stats
            ? (stats as Record<string, unknown>)[card.changeKey] as number
            : null;

          return (
            <Card key={card.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium truncate">{card.label}</p>
                    <p className="text-xl font-bold mt-1 truncate">
                      {loading ? <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" /> : value}
                    </p>
                    {changeValue !== null && !loading && (
                      <div className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${
                        changeValue >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {changeValue >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        <span>{Math.abs(changeValue)}% vs last month</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className={`size-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* Real-Time Analytics Mini Bar                                       */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {rtStats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-dashed">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                  <Icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* Customizable Widget Grid                                           */}
      {/* ================================================================= */}
      {isEditing && activeWidgets.length === 0 && (
        <div className="text-center p-8 bg-muted/20 rounded-xl border-2 border-dashed">
          <p className="text-sm text-muted-foreground mb-2">No widgets enabled</p>
          <p className="text-xs text-muted-foreground">Click "Add Widgets" to add widgets to your dashboard</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWidgets.map((widget) => {
          const definition = WIDGET_DEFINITIONS.find((d) => d.id === widget.id);
          const colSpan = definition?.colSpan ?? 1;
          return (
            <div key={widget.id} className={colSpan === 2 ? "lg:col-span-2" : ""}>
              {renderWidget(widget)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
