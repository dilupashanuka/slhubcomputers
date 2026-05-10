// =============================================================================
// SL HUB COMPUTER - Widget Wrapper Component
// =============================================================================
// Purpose: Reusable wrapper for dashboard widgets with drag handle, settings,
//          remove button, and consistent styling
// =============================================================================

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, GripVertical, Settings } from "lucide-react";
import type { WidgetSize } from "@/lib/dashboard-widgets";

interface WidgetWrapperProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  size: WidgetSize;
  isEditing?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function WidgetWrapper({
  title,
  description,
  icon,
  size,
  isEditing,
  onRemove,
  children,
  className = "",
  loading = false,
}: WidgetWrapperProps) {
  return (
    <Card className={`relative group/widget overflow-hidden transition-all ${isEditing ? "ring-2 ring-primary/30 ring-offset-2" : ""} ${className}`}>
      {/* Drag Handle (visible in edit mode) */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-10 opacity-100">
          <div className="flex items-center gap-1">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded bg-muted hover:bg-muted/80">
              <GripVertical className="size-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Remove Button (visible in edit mode) */}
      {isEditing && onRemove && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={onRemove}
            className="h-6 w-6 opacity-80 hover:opacity-100"
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{title}</CardTitle>
            {description && (
              <CardDescription className="text-[11px] truncate">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className={`bg-muted/20 rounded-lg animate-pulse ${
            size === "small" ? "h-24" : size === "medium" ? "h-40" : "h-56"
          }`} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
