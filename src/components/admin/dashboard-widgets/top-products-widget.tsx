// =============================================================================
// Top Products Widget - Top 5 products by revenue
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Zap, Package } from "lucide-react";

interface TopProductsWidgetProps {
  data: { productId: string; name: string; quantitySold: number; revenue: number; orderCount: number }[];
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

function formatCompactLKR(amount: number): string {
  if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
  return `Rs. ${amount}`;
}

export function TopProductsWidget({ data, loading, isEditing, onRemove }: TopProductsWidgetProps) {
  return (
    <WidgetWrapper
      title="Top Products"
      description="Best selling products by revenue"
      icon={<Zap className="size-4 text-amber-600" />}
      size="medium"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      {!data.length ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Package className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No sales data yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {data.slice(0, 5).map((p, idx) => (
            <div key={p.productId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : idx === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                : idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-muted text-muted-foreground"
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.quantitySold} sold</p>
              </div>
              <p className="text-xs font-bold shrink-0">{formatCompactLKR(p.revenue)}</p>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}
