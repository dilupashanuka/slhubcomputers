// =============================================================================
// SL HUB COMPUTER - Enhanced Admin Dashboard Page
// =============================================================================
// Purpose: Professional admin dashboard with rich analytics, charts, activity
//          feed, and quick actions powered by recharts.
// Features:
//   - 8 stat cards with comparison indicators vs previous month
//   - Revenue Trend Area Chart (12 months) using recharts
//   - Order Status Donut Chart using recharts
//   - Category Distribution Bar Chart using recharts
//   - Top 5 Products by Revenue table
//   - Real-time Activity Feed with type icons
//   - Quick Actions grid for common tasks
//   - Auto-refresh on mount and every 60 seconds
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import {
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Star,
  Wrench,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  BarChart3,
  Users,
  Zap,
  Activity,
  MoreHorizontal,
  LayoutDashboard,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface StatsData {
  products: number;
  categories: number;
  brands: number;
  orders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  reviews: number;
  unreadMessages: number;
  prebuiltPCs: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  revenueChange: number;
  orderChange: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  currentMonthOrderCount: number;
  previousMonthOrderCount: number;
  topProducts: {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
    orderCount: number;
  }[];
  categoryDistribution: { name: string; count: number }[];
  orderStatusDistribution: { status: string; count: number }[];
  recentActivity: {
    id: string;
    type: "order" | "message" | "review";
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }[];
  totalCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
}

// ---------------------------------------------------------------------------
// Color Palette for Charts
// ---------------------------------------------------------------------------
const CHART_COLORS = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
  "#c026d3", // fuchsia-600
];

const PIE_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#8b5cf6",
  "#059669",
  "#dc2626",
];

// ---------------------------------------------------------------------------
// Order Status Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof ShoppingCart }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
  },
};

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
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    isCurrency: true,
    changeKey: "revenueChange" as const,
  },
  {
    key: "orders",
    label: "Total Orders",
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    changeKey: "orderChange" as const,
  },
  {
    key: "products",
    label: "Products",
    icon: Package,
    color: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "categories",
    label: "Categories",
    icon: FolderTree,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "brands",
    label: "Brands",
    icon: Tag,
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    icon: Clock,
    color: "from-yellow-500 to-amber-600",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    key: "unreadMessages",
    label: "Unread Messages",
    icon: MessageSquare,
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "avgOrderValue",
    label: "Avg. Order Value",
    icon: BarChart3,
    color: "from-cyan-500 to-teal-600",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    isCurrency: true,
  },
];

// ---------------------------------------------------------------------------
// Custom Tooltip for Area Chart
// ---------------------------------------------------------------------------
function RevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-green-600 dark:text-green-400">
          Revenue: {formatLKR(payload[0].value)}
        </p>
        {payload[1] && (
          <p className="text-blue-600 dark:text-blue-400">
            Orders: {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Custom Tooltip for Pie Chart
// ---------------------------------------------------------------------------
function StatusTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium capitalize">{data.status}</p>
        <p className="text-muted-foreground">
          Count: {data.count} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dashboard Page Component
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Prepare pie chart data with percentages
  const pieData =
    stats?.orderStatusDistribution.map((item) => {
      const total = stats.orderStatusDistribution.reduce((s, i) => s + i.count, 0);
      return {
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      };
    }) || [];

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Page Header                                                        */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
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
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Stat Cards Grid - 2 cols on mobile, 4 on desktop                  */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardConfig.map((card) => {
          const Icon = card.icon;
          const rawValue = stats
            ? (stats as unknown as Record<string, unknown>)[card.key] ?? 0
            : 0;
          const value = stats
            ? card.isCurrency
              ? formatCompactLKR(rawValue as number)
              : (rawValue as number).toLocaleString("en-LK")
            : "...";

          const changeValue = card.changeKey && stats
            ? (stats as unknown as Record<string, unknown>)[card.changeKey] as number
            : null;

          return (
            <Card key={card.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {card.label}
                    </p>
                    <p className="text-xl font-bold mt-1 truncate">
                      {loading ? (
                        <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" />
                      ) : (
                        value
                      )}
                    </p>
                    {changeValue !== null && !loading && (
                      <div className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${
                        changeValue >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {changeValue >= 0 ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
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
      {/* Charts Row: Revenue Trend + Order Status Donut                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Area Chart (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-green-600" />
                  Revenue Trend
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Monthly revenue over the last 12 months
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {formatCompactLKR(stats?.currentMonthRevenue ?? 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">This month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats?.monthlyRevenue || []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ fill: "#2563eb", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Status Donut Chart (1/3 width) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="size-4 text-blue-600" />
              Order Status
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of order statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
            ) : pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<StatusTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {pieData.map((item, index) => (
                    <div
                      key={item.status}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="capitalize truncate">{item.status}</span>
                      <span className="text-muted-foreground ml-auto">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* Charts Row: Category Distribution + Top Products                   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="size-4 text-emerald-600" />
              Products by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Number of products in each category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={stats?.categoryDistribution.slice(0, 8) || []}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} products`, "Count"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {(stats?.categoryDistribution.slice(0, 8) || []).map((_, index) => (
                      <Cell
                        key={`cat-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products by Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-amber-600" />
              Top Products by Revenue
            </CardTitle>
            <CardDescription className="text-xs">
              Best selling products of all time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/20 rounded animate-pulse" />
                ))}
              </div>
            ) : !stats?.topProducts.length ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, idx) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : idx === 1
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          : idx === 2
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {product.quantitySold} sold in {product.orderCount} orders
                      </p>
                    </div>

                    {/* Revenue */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">
                        {formatCompactLKR(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* Insights Cards: Customer Stats + Quick Actions                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Count */}
        <Card className="border-blue-200 dark:border-blue-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-xl font-bold">{stats?.totalCustomers ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Returning Customers */}
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Returning</p>
              <p className="text-xl font-bold">{stats?.returningCustomers ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivered Orders */}
        <Card className="border-green-200 dark:border-green-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold">{stats?.deliveredOrders ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="border-amber-200 dark:border-amber-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reviews</p>
              <p className="text-xl font-bold">{stats?.reviews ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* Activity Feed + Quick Actions                                      */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Latest orders, messages, and reviews
                </CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                  <ArrowUpRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted/20 rounded w-1/3 animate-pulse" />
                      <div className="h-2 bg-muted/20 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recentActivity.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentActivity.slice(0, 8).map((item) => {
                  const isOrder = item.type === "order";
                  const isMessage = item.type === "message";
                  const isReview = item.type === "review";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Type Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isOrder
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : isMessage
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {isOrder ? (
                          <ShoppingCart className="size-3.5" />
                        ) : isMessage ? (
                          <MessageSquare className="size-3.5" />
                        ) : (
                          <Star className="size-3.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (1/3 width) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-amber-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Common admin tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/products">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <Plus className="size-4 text-primary" />
                  <span className="text-[11px] font-medium">Add Product</span>
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <Eye className="size-4 text-blue-600" />
                  <span className="text-[11px] font-medium">View Orders</span>
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <FolderTree className="size-4 text-emerald-600" />
                  <span className="text-[11px] font-medium">Categories</span>
                </Button>
              </Link>
              <Link href="/admin/messages">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <MessageSquare className="size-4 text-rose-600" />
                  <span className="text-[11px] font-medium">Messages</span>
                </Button>
              </Link>
              <Link href="/admin/banners">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <ImageIcon className="size-4 text-violet-600" />
                  <span className="text-[11px] font-medium">Banners</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <Settings className="size-4 text-gray-600" />
                  <span className="text-[11px] font-medium">Settings</span>
                </Button>
              </Link>
            </div>

            {/* Pending Alerts */}
            {(stats?.pendingOrders ?? 0) > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                      {stats?.pendingOrders} pending order(s)
                    </p>
                    <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
                      Requires your attention
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(stats?.unreadMessages ?? 0) > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      {stats?.unreadMessages} unread message(s)
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                      New customer inquiries
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

