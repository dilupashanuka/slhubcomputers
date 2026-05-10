// =============================================================================
// Revenue Chart Widget - Area chart of monthly revenue
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface RevenueChartWidgetProps {
  data: { month: string; revenue: number; orders: number }[];
  currentMonthRevenue: number;
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

function formatCompactLKR(amount: number): string {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
  return `Rs. ${amount}`;
}

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

function RevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-green-600 dark:text-green-400">Revenue: {formatLKR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function RevenueChartWidget({ data, currentMonthRevenue, loading, isEditing, onRemove }: RevenueChartWidgetProps) {
  return (
    <WidgetWrapper
      title="Revenue Trend"
      description="Monthly revenue over the last 12 months"
      icon={<TrendingUp className="size-4 text-green-600" />}
      size="large"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-right ml-auto">
          <p className="text-lg font-bold text-green-600">{formatCompactLKR(currentMonthRevenue)}</p>
          <p className="text-[10px] text-muted-foreground">This month</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data || []}>
          <defs>
            <linearGradient id="widgetRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<RevenueTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#widgetRevenueGradient)" dot={{ fill: "#2563eb", strokeWidth: 0, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
}
