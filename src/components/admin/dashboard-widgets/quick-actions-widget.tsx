// =============================================================================
// Quick Actions Widget - Common admin action buttons
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { Zap, Plus, Package, ShoppingCart, MessageSquare, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickActionsWidgetProps {
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

const actions = [
  { label: "Add Product", href: "/admin/products", icon: Plus, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
  { label: "Gift Cards", href: "/admin/gift-cards", icon: CreditCard, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
  { label: "Reviews", href: "/admin/reviews", icon: Star, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "Products", href: "/admin/products", icon: Package, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
];

export function QuickActionsWidget({ loading, isEditing, onRemove }: QuickActionsWidgetProps) {
  return (
    <WidgetWrapper
      title="Quick Actions"
      description="Common admin shortcuts"
      icon={<Zap className="size-4 text-amber-600" />}
      size="medium"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-3 px-2 hover:bg-muted/50">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">{action.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}
