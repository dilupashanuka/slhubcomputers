// =============================================================================
// Analytics Funnel Widget - Conversion funnel visualization
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Funnel } from "lucide-react";

interface AnalyticsFunnelWidgetProps {
  data: { views: number; addToCart: number; checkout: number; orders: number } | null;
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

export function AnalyticsFunnelWidget({ data, loading, isEditing, onRemove }: AnalyticsFunnelWidgetProps) {
  const steps = [
    { label: "Product Views", value: data?.views ?? 0, color: "bg-blue-500" },
    { label: "Added to Cart", value: data?.addToCart ?? 0, color: "bg-emerald-500" },
    { label: "Checkout", value: data?.checkout ?? 0, color: "bg-amber-500" },
    { label: "Order Placed", value: data?.orders ?? 0, color: "bg-green-500" },
  ];
  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <WidgetWrapper
      title="Conversion Funnel"
      description="Views → Cart → Checkout → Order"
      icon={<Funnel className="size-4 text-amber-600" />}
      size="medium"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const widthPct = maxVal > 0 ? Math.max((step.value / maxVal) * 100, 5) : 5;
          const dropoff = idx > 0 && steps[idx - 1].value > 0
            ? Math.round(((steps[idx - 1].value - step.value) / steps[idx - 1].value) * 100) : null;
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{step.value.toLocaleString()}</span>
                  {dropoff !== null && <span className="text-[10px] text-red-500">-{dropoff}%</span>}
                </div>
              </div>
              <div className="h-5 bg-muted/30 rounded-full overflow-hidden">
                <div className={`h-full ${step.color} rounded-full transition-all duration-500`} style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}
