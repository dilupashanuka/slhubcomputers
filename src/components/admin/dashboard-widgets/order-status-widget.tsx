// =============================================================================
// Order Status Widget - Donut chart of order statuses
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface OrderStatusWidgetProps {
  data: { status: string; count: number; percentage: number }[];
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

const PIE_COLORS = ["#2563eb", "#7c3aed", "#f59e0b", "#8b5cf6", "#059669", "#dc2626"];

function StatusTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium capitalize">{d.status}</p>
        <p className="text-muted-foreground">Count: {d.count} ({d.percentage}%)</p>
      </div>
    );
  }
  return null;
}

export function OrderStatusWidget({ data, loading, isEditing, onRemove }: OrderStatusWidgetProps) {
  return (
    <WidgetWrapper
      title="Order Status"
      description="Distribution of order statuses"
      icon={<ShoppingCart className="size-4 text-blue-600" />}
      size="small"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No orders yet</p>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="count" nameKey="status">
                {data.map((_, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {data.map((item, i) => (
              <div key={item.status} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="capitalize truncate">{item.status}</span>
                <span className="text-muted-foreground ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}
