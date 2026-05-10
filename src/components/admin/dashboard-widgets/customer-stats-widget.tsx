// =============================================================================
// Customer Stats Widget - Total customers and returning rate
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Users, Activity } from "lucide-react";

interface CustomerStatsWidgetProps {
  totalCustomers: number;
  returningCustomers: number;
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

export function CustomerStatsWidget({ totalCustomers, returningCustomers, loading, isEditing, onRemove }: CustomerStatsWidgetProps) {
  const returnRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

  return (
    <WidgetWrapper
      title="Customer Stats"
      description="Total customers and returning rate"
      icon={<Users className="size-4 text-violet-600" />}
      size="small"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
            <p className="text-xl font-bold">{totalCustomers.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Returning</p>
            <p className="text-xl font-bold">{returningCustomers.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{returnRate}% return rate</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
