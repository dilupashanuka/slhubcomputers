// =============================================================================
// SL HUB COMPUTER - Dashboard Widget Configuration Library
// =============================================================================
// Purpose: Define available widget types, configurations, default layouts,
//          and save/load layout from localStorage
// Features: 10 widget types, grid positioning, customizable layout
// =============================================================================

// ---------------------------------------------------------------------------
// Widget Size Types
// ---------------------------------------------------------------------------
export type WidgetSize = "small" | "medium" | "large";

// ---------------------------------------------------------------------------
// Widget Type Identifiers
// ---------------------------------------------------------------------------
export type WidgetType =
  | "RevenueChart"
  | "OrderStatus"
  | "TopProducts"
  | "RecentOrders"
  | "CustomerStats"
  | "StockAlerts"
  | "ChatSummary"
  | "QuickActions"
  | "AnalyticsFunnel"
  | "CouponStats";

// ---------------------------------------------------------------------------
// Widget Configuration
// ---------------------------------------------------------------------------
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  size: WidgetSize;
  // Grid positioning (CSS grid column/row spans)
  colSpan: number; // 1 = half width, 2 = full width on 2-col grid
  rowSpan: number; // 1 = compact, 2 = tall
  // Widget category for palette grouping
  category: "charts" | "lists" | "stats" | "actions";
  // Icon name (Lucide)
  icon: string;
  // Whether the widget can be removed
  removable?: boolean;
  // Default enabled
  defaultEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Layout Configuration (stored in localStorage/API)
// ---------------------------------------------------------------------------
export interface DashboardLayout {
  widgets: LayoutWidget[];
  lastUpdated: string;
}

export interface LayoutWidget {
  id: string;
  type: WidgetType;
  enabled: boolean;
  position: number; // Order position
  colSpan: number;
  rowSpan: number;
}

// ---------------------------------------------------------------------------
// All Available Widget Definitions
// ---------------------------------------------------------------------------
export const WIDGET_DEFINITIONS: WidgetConfig[] = [
  {
    id: "revenue-chart",
    type: "RevenueChart",
    title: "Revenue Trend",
    description: "Monthly revenue area chart over last 12 months",
    size: "large",
    colSpan: 2,
    rowSpan: 1,
    category: "charts",
    icon: "TrendingUp",
    defaultEnabled: true,
  },
  {
    id: "order-status",
    type: "OrderStatus",
    title: "Order Status",
    description: "Order status distribution donut chart",
    size: "small",
    colSpan: 1,
    rowSpan: 1,
    category: "charts",
    icon: "ShoppingCart",
    defaultEnabled: true,
  },
  {
    id: "top-products",
    type: "TopProducts",
    title: "Top Products",
    description: "Top 5 products by revenue",
    size: "medium",
    colSpan: 1,
    rowSpan: 1,
    category: "lists",
    icon: "Zap",
    defaultEnabled: true,
  },
  {
    id: "recent-orders",
    type: "RecentOrders",
    title: "Recent Orders",
    description: "Last 5 orders placed",
    size: "medium",
    colSpan: 1,
    rowSpan: 1,
    category: "lists",
    icon: "Clock",
    defaultEnabled: true,
  },
  {
    id: "customer-stats",
    type: "CustomerStats",
    title: "Customer Stats",
    description: "Total customers and returning rate",
    size: "small",
    colSpan: 1,
    rowSpan: 1,
    category: "stats",
    icon: "Users",
    defaultEnabled: true,
  },
  {
    id: "stock-alerts",
    type: "StockAlerts",
    title: "Stock Alerts",
    description: "Low stock products that need attention",
    size: "small",
    colSpan: 1,
    rowSpan: 1,
    category: "stats",
    icon: "AlertTriangle",
    defaultEnabled: false,
  },
  {
    id: "chat-summary",
    type: "ChatSummary",
    title: "Chat Summary",
    description: "Unread chat messages and sessions",
    size: "small",
    colSpan: 1,
    rowSpan: 1,
    category: "stats",
    icon: "MessageCircle",
    defaultEnabled: false,
  },
  {
    id: "quick-actions",
    type: "QuickActions",
    title: "Quick Actions",
    description: "Common admin action buttons",
    size: "medium",
    colSpan: 2,
    rowSpan: 1,
    category: "actions",
    icon: "Zap",
    defaultEnabled: true,
  },
  {
    id: "analytics-funnel",
    type: "AnalyticsFunnel",
    title: "Conversion Funnel",
    description: "Views → Cart → Checkout → Order funnel",
    size: "medium",
    colSpan: 1,
    rowSpan: 1,
    category: "charts",
    icon: "Funnel",
    defaultEnabled: true,
  },
  {
    id: "coupon-stats",
    type: "CouponStats",
    title: "Coupon Stats",
    description: "Active coupons and their usage",
    size: "small",
    colSpan: 1,
    rowSpan: 1,
    category: "stats",
    icon: "Ticket",
    defaultEnabled: false,
  },
];

// ---------------------------------------------------------------------------
// Default Layout Configuration
// ---------------------------------------------------------------------------
export const DEFAULT_LAYOUT: LayoutWidget[] = [
  { id: "revenue-chart", type: "RevenueChart", enabled: true, position: 0, colSpan: 2, rowSpan: 1 },
  { id: "order-status", type: "OrderStatus", enabled: true, position: 1, colSpan: 1, rowSpan: 1 },
  { id: "top-products", type: "TopProducts", enabled: true, position: 2, colSpan: 1, rowSpan: 1 },
  { id: "recent-orders", type: "RecentOrders", enabled: true, position: 3, colSpan: 1, rowSpan: 1 },
  { id: "customer-stats", type: "CustomerStats", enabled: true, position: 4, colSpan: 1, rowSpan: 1 },
  { id: "analytics-funnel", type: "AnalyticsFunnel", enabled: true, position: 5, colSpan: 1, rowSpan: 1 },
  { id: "quick-actions", type: "QuickActions", enabled: true, position: 6, colSpan: 2, rowSpan: 1 },
  { id: "stock-alerts", type: "StockAlerts", enabled: false, position: 7, colSpan: 1, rowSpan: 1 },
  { id: "chat-summary", type: "ChatSummary", enabled: false, position: 8, colSpan: 1, rowSpan: 1 },
  { id: "coupon-stats", type: "CouponStats", enabled: false, position: 9, colSpan: 1, rowSpan: 1 },
];

// ---------------------------------------------------------------------------
// localStorage Key
// ---------------------------------------------------------------------------
const STORAGE_KEY = "slhub-dashboard-layout";

// ---------------------------------------------------------------------------
// Save Layout to localStorage
// ---------------------------------------------------------------------------
export function saveLayout(layout: LayoutWidget[]): void {
  try {
    const data: DashboardLayout = {
      widgets: layout,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save dashboard layout:", error);
  }
}

// ---------------------------------------------------------------------------
// Load Layout from localStorage
// ---------------------------------------------------------------------------
export function loadLayout(): LayoutWidget[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data: DashboardLayout = JSON.parse(stored);
    return data.widgets;
  } catch (error) {
    console.error("Failed to load dashboard layout:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Get Widget Definition by Type
// ---------------------------------------------------------------------------
export function getWidgetDefinition(type: WidgetType): WidgetConfig | undefined {
  return WIDGET_DEFINITIONS.find((w) => w.type === type);
}

// ---------------------------------------------------------------------------
// Get Active Widgets (enabled only, sorted by position)
// ---------------------------------------------------------------------------
export function getActiveWidgets(layout: LayoutWidget[]): LayoutWidget[] {
  return layout
    .filter((w) => w.enabled)
    .sort((a, b) => a.position - b.position);
}
