// =============================================================================
// Coupon Stats Widget - Active coupons and usage
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CouponStatsWidgetProps {
  data: { id: string; code: string; name: string; type: string; value: number; usedCount: number; usageLimit: number | null; isActive: boolean }[];
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

export function CouponStatsWidget({ data, loading, isEditing, onRemove }: CouponStatsWidgetProps) {
  return (
    <WidgetWrapper
      title="Coupon Stats"
      description="Active coupons and their usage"
      icon={<Ticket className="size-4 text-purple-600" />}
      size="small"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      {!data.length ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Ticket className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No active coupons</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.slice(0, 5).map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
              <Ticket className="size-3.5 text-purple-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{coupon.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{coupon.code}</p>
              </div>
              <Badge variant="outline" className="text-[9px] h-5">
                {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""} used
              </Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}
