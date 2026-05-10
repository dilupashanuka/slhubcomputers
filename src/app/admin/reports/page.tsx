"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topCategory: string;
  prevTotalRevenue: number;
  prevTotalOrders: number;
  prevAvgOrderValue: number;
  revenueChange: number;
  orderChange: number;
  avgOrderChange: number;
  revenueByPeriod: { date: string; revenue: number; orders: number }[];
  topProducts: {
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    orders: number;
  }[];
  categoryDistribution: {
    name: string;
    revenue: number;
    quantity: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    revenue: number;
  }[];
  orderStatusBreakdown: { status: string; count: number }[];
  categories: string[];
  period: string;
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// Chart colors - Professional palette avoiding indigo/blue
// ---------------------------------------------------------------------------
const CHART_COLORS = [
  "hsl(142, 71%, 45%)", // emerald
  "hsl(38, 92%, 50%)",  // amber
  "hsl(0, 84%, 60%)",   // red
  "hsl(262, 83%, 58%)", // purple
  "hsl(173, 80%, 40%)", // teal
  "hsl(25, 95%, 53%)",  // orange
  "hsl(330, 81%, 60%)", // pink
  "hsl(199, 89%, 48%)", // cyan
  "hsl(65, 70%, 48%)",  // lime
  "hsl(280, 68%, 60%)", // violet
];

const PIE_COLORS = [
  "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#14b8a6",
  "#f97316", "#ec4899", "#06b6d4", "#84cc16", "#8b5cf6",
];

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------
const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue (Rs.)", color: "hsl(142, 71%, 45%)" },
  orders: { label: "Orders", color: "hsl(38, 92%, 50%)" },
};

const ordersChartConfig: ChartConfig = {
  orders: { label: "Orders", color: "hsl(38, 92%, 50%)" },
};

const categoryChartConfig: ChartConfig = {
  revenue: { label: "Revenue (Rs.)", color: "hsl(142, 71%, 45%)" },
  quantity: { label: "Quantity", color: "hsl(38, 92%, 50%)" },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------
function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

function formatCompact(amount: number): string {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
  return `Rs. ${amount}`;
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery";
    case "bank_transfer":
      return "Bank Transfer";
    default:
      return method;
  }
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

// ---------------------------------------------------------------------------
// Custom label renderer for pie chart
// ---------------------------------------------------------------------------
interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: PieLabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px]"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

// ---------------------------------------------------------------------------
// Main Reports Page Component
// ---------------------------------------------------------------------------
export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch report data
  // -------------------------------------------------------------------------
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period);
      if (useCustomDate && startDate && endDate) {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }
      if (category && category !== "all") {
        params.set("category", category);
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, [period, category, startDate, endDate, useCustomDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // -------------------------------------------------------------------------
  // Export handlers
  // -------------------------------------------------------------------------
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (useCustomDate && startDate && endDate) {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }
    if (category && category !== "all") {
      params.set("category", category);
    }
    window.open(`/api/admin/reports/export?${params.toString()}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  // -------------------------------------------------------------------------
  // Summary card data
  // -------------------------------------------------------------------------
  const summaryCards = data
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(data.totalRevenue),
          change: data.revenueChange,
          icon: DollarSign,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-500/10",
        },
        {
          title: "Total Orders",
          value: data.totalOrders.toString(),
          change: data.orderChange,
          icon: ShoppingCart,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-500/10",
        },
        {
          title: "Avg. Order Value",
          value: formatCurrency(data.avgOrderValue),
          change: data.avgOrderChange,
          icon: CreditCard,
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-500/10",
        },
        {
          title: "Top Category",
          value: data.topCategory,
          change: null,
          icon: Package,
          color: "text-teal-600 dark:text-teal-400",
          bgColor: "bg-teal-500/10",
        },
      ]
    : [];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analyze your sales performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-1 hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Print</span>
          </Button>
          <Button size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Filters */}
      {/* ------------------------------------------------------------------- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Period selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Period
              </label>
              <Select
                value={period}
                onValueChange={(val) => {
                  setPeriod(val);
                  setUseCustomDate(false);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom date range */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value) setUseCustomDate(true);
                }}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (e.target.value) setUseCustomDate(true);
                }}
                className="h-9 text-xs"
              />
            </div>

            {/* Category filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data?.categories?.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply button */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-transparent">
                Action
              </label>
              <Button
                size="sm"
                className="h-9 w-full"
                onClick={() => fetchReport()}
                disabled={loading}
              >
                {useCustomDate ? (
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                )}
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------- */}
      {/* Summary Cards */}
      {/* ------------------------------------------------------------------- */}
      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold tracking-tight">
                        {card.value}
                      </p>
                      {card.change !== null && (
                        <div className="flex items-center gap-1">
                          {card.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              card.change >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {Math.abs(card.change)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            vs prev
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* ------------------------------------------------------------------- */}
      {/* Charts Section */}
      {/* ------------------------------------------------------------------- */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Overview Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="overview" className="space-y-4">
          {/* Revenue & Orders Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.revenueByPeriod.length > 0 ? (
                  <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                    <AreaChart data={data.revenueByPeriod}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(142, 71%, 45%)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(142, 71%, 45%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                        tickFormatter={(v) => formatCompact(v)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(142, 71%, 45%)"
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                        name="revenue"
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Orders Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Order count over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.revenueByPeriod.length > 0 ? (
                  <ChartContainer config={ordersChartConfig} className="h-[280px] w-full">
                    <BarChart data={data.revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="orders"
                        fill="hsl(38, 92%, 50%)"
                        radius={[4, 4, 0, 0]}
                        name="orders"
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category & Top Products Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Category Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Revenue by product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.categoryDistribution.length > 0 ? (
                  <ChartContainer
                    config={categoryChartConfig}
                    className="h-[280px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={data.categoryDistribution.map((c, i) => ({
                          name: c.name,
                          value: c.revenue,
                          fill: PIE_COLORS[i % PIE_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {data.categoryDistribution.map((_, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No category data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Products by Revenue
                </CardTitle>
                <CardDescription className="text-xs">
                  Best performing products
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.topProducts.length > 0 ? (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                    {data.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {product.quantity} sold · {product.orders} orders
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No product data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods & Order Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Method Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Methods
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution by payment type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.paymentMethodDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {data.paymentMethodDistribution.map((pm, i) => {
                      const totalRevenue = data.totalRevenue || 1;
                      const percent = Math.round((pm.revenue / totalRevenue) * 100);
                      return (
                        <div key={pm.method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    PIE_COLORS[i % PIE_COLORS.length],
                                }}
                              />
                              <span className="text-sm font-medium">
                                {formatPaymentMethod(pm.method)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold">
                                {formatCurrency(pm.revenue)}
                              </span>
                              <span className="text-[11px] text-muted-foreground ml-2">
                                ({pm.count} orders)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percent}%`,
                                backgroundColor:
                                  PIE_COLORS[i % PIE_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
                    No payment data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Order Status
                </CardTitle>
                <CardDescription className="text-xs">
                  Current order status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.orderStatusBreakdown.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.orderStatusBreakdown.map((status, i) => {
                      const statusColors: Record<string, string> = {
                        pending:
                          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        confirmed:
                          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                        processing:
                          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                        shipped:
                          "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
                        delivered:
                          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                        cancelled:
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      };
                      return (
                        <Badge
                          key={status.status}
                          variant="outline"
                          className={`text-xs py-1.5 px-3 ${
                            statusColors[status.status] || ""
                          }`}
                        >
                          {formatStatus(status.status)}: {status.count}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
                    No status data
                  </div>
                )}

                {/* Comparison Summary */}
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Previous Period Revenue
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(data?.prevTotalRevenue ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Previous Period Orders
                    </p>
                    <p className="text-sm font-semibold">
                      {data?.prevTotalOrders ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Daily Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Revenue & Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Hourly breakdown for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.revenueByPeriod.length > 0 ? (
                <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
                  <LineChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                      tickFormatter={(v) => formatCompact(v)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="orders"
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                  No data for today
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Weekly Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                This Week&apos;s Revenue & Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Daily breakdown for the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.revenueByPeriod.length > 0 ? (
                <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
                  <BarChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                      tickFormatter={(v) => formatCompact(v)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="hsl(142, 71%, 45%)"
                      radius={[4, 4, 0, 0]}
                      name="revenue"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      fill="hsl(38, 92%, 50%)"
                      radius={[4, 4, 0, 0]}
                      name="orders"
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                  No data for this week
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Monthly Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                This Month&apos;s Revenue & Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Daily breakdown for the current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.revenueByPeriod.length > 0 ? (
                <ChartContainer config={revenueChartConfig} className="h-[350px] w-full">
                  <AreaChart data={data.revenueByPeriod}>
                    <defs>
                      <linearGradient id="monthlyRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(142, 71%, 45%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(142, 71%, 45%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="monthlyOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(38, 92%, 50%)"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(38, 92%, 50%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                      tickFormatter={(v) => formatCompact(v)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(142, 71%, 45%)"
                      fill="url(#monthlyRevenueGrad)"
                      strokeWidth={2}
                      name="revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(38, 92%, 50%)"
                      fill="url(#monthlyOrdersGrad)"
                      strokeWidth={2}
                      name="orders"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                  No data for this month
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly summary table */}
          {data && data.topProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">
                          #
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">
                          Product
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">
                          Qty Sold
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.slice(0, 10).map((product, i) => (
                        <tr
                          key={product.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="py-2 px-3 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="py-2 px-3 font-medium truncate max-w-[200px]">
                            {product.name}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {product.quantity}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
