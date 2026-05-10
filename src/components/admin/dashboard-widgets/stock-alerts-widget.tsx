// =============================================================================
// Stock Alerts Widget - Low stock products
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StockAlertsWidgetProps {
  data: { id: string; name: string; stock: number; sku: string | null }[];
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

export function StockAlertsWidget({ data, loading, isEditing, onRemove }: StockAlertsWidgetProps) {
  return (
    <WidgetWrapper
      title="Stock Alerts"
      description="Low stock items needing attention"
      icon={<AlertTriangle className="size-4 text-amber-600" />}
      size="small"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      {!data.length ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">All items in stock</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{product.name}</p>
                {product.sku && <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>}
              </div>
              <Badge variant={product.stock <= 0 ? "destructive" : "outline"} className="text-[9px] h-5">
                {product.stock <= 0 ? "Out" : `${product.stock} left`}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}
