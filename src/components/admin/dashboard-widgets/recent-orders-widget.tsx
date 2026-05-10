// =============================================================================
// Recent Orders Widget - Last 5 orders
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentOrdersWidgetProps {
  data: { id: string; orderNumber: string; name: string; total: number; status: string; createdAt: string }[];
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function RecentOrdersWidget({ data, loading, isEditing, onRemove }: RecentOrdersWidgetProps) {
  return (
    <WidgetWrapper
      title="Recent Orders"
      description="Latest 5 orders placed"
      icon={<Clock className="size-4 text-blue-600" />}
      size="medium"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      {!data.length ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Clock className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No recent orders</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {data.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{order.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{order.orderNumber}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] h-5 ${statusColors[order.status] || "bg-muted"}`}>
                {order.status}
              </Badge>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold">{formatLKR(order.total)}</p>
                <p className="text-[9px] text-muted-foreground">{timeAgo(order.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}
