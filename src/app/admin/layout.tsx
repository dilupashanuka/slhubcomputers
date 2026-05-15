// =============================================================================
// SL HUB COMPUTER - Enhanced Admin Layout with Professional Sidebar
// =============================================================================
// Purpose: Premium admin panel layout with responsive sidebar, topbar with
//          notifications, search, breadcrumbs, user profile, and theme toggle.
// Features:
//   - Desktop: Professional sidebar with logo, nav groups, notification badges
//   - Mobile: Collapsible sheet sidebar with hamburger toggle
//   - Topbar: Search, notification bell with unread count, theme toggle, profile
//   - Active link highlighting with animated indicator
//   - Smooth transitions and professional color scheme
//   - Notification badges on Messages and Orders nav items
//   - Real Notification model data with mark-all-as-read & click-to-navigate
//   - Browser push notification support via NotificationProvider
// Client: SL HUB COMPUTER, Deiyandara | Hotline: 071 067 8944
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Star,
  BarChart3,
  Image,
  Wrench,
  MessageSquare,
  MessageCircle,
  Monitor,
  Settings,
  Menu,
  ChevronRight,
  Store,
  Bell,
  BellOff,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
  FileText,
  Quote,
  PackageCheck,
  AlertTriangle,
  Ticket,
  Info,
  CheckCheck,
  Trash2,
  TrendingUp,
  Shield,
  Palette,
  Users,
  CreditCard,
  Truck,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import NotificationProvider from "@/components/admin/notification-provider";

// ---------------------------------------------------------------------------
// Navigation Configuration with Groups
// ---------------------------------------------------------------------------
const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Brands", href: "/admin/brands", icon: Tag },
      { label: "Pre-Built PCs", href: "/admin/prebuilt-pcs", icon: Monitor },
      { label: "Price History", href: "/admin/price-history", icon: TrendingUp },
      { label: "Flash Deals", href: "/admin/flash-deals", icon: ShoppingCart },
      { label: "Gift Cards", href: "/admin/gift-cards", icon: CreditCard },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: "pending" },
      { label: "Affiliates", href: "/admin/affiliates", icon: Users },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Stock Alerts", href: "/admin/stock-alerts", icon: Bell },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "Page Content", href: "/admin/page-contents", icon: FileText },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare, badge: "unread" },
      { label: "Live Chat", href: "/admin/chat", icon: MessageCircle, badge: "chat" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
      { label: "Theme", href: "/admin/theme", icon: Palette },
      { label: "Security", href: "/admin/settings/2fa", icon: Shield },
    ],
  },
];

// All nav items flattened for quick lookup
const allNavItems = navGroups.flatMap((g) => g.items);

// ---------------------------------------------------------------------------
// Helper: Format relative time
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Notification type icon & color map
// ---------------------------------------------------------------------------
function getNotificationIcon(type: string) {
  switch (type) {
    case "order":
      return ShoppingCart;
    case "message":
      return MessageSquare;
    case "review":
      return Star;
    case "stock":
      return AlertTriangle;
    case "coupon":
      return Ticket;
    case "system":
      return Info;
    default:
      return Bell;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "order":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "message":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "review":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    case "stock":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "coupon":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    case "system":
      return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

// ---------------------------------------------------------------------------
// Notification type for the real Notification model
// ---------------------------------------------------------------------------
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// SidebarContent - Professional sidebar body
// ---------------------------------------------------------------------------
function SidebarContent({
  onClose,
  pendingOrders,
  unreadMessages,
  unreadChat,
  navGroups,
}: {
  onClose?: () => void;
  pendingOrders: number;
  unreadMessages: number;
  unreadChat: number;
  navGroups: { label: string; items: any[] }[];
}) {
  const pathname = usePathname();

  // Badge count map
  const badgeCounts: Record<string, number> = {
    pending: pendingOrders,
    unread: unreadMessages,
    chat: unreadChat,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo Section - Fixed at top */}
      <div className="p-4 flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/25">
          SL
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">SL HUB</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">Admin Panel</p>
        </div>
      </div>

      <Separator className="shrink-0" />

      {/* Navigation Groups - Scrollable area */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-2">
        <nav className="flex flex-col gap-4 pb-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                        transition-all duration-150 group
                        ${
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                      )}
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {/* Badge for notifications */}
                      {item.badge && badgeCounts[item.badge] > 0 && (
                        <Badge
                          variant="destructive"
                          className="text-[9px] h-4 min-w-[16px] px-1 flex items-center justify-center"
                        >
                          {badgeCounts[item.badge]}
                        </Badge>
                      )}
                      {isActive && (
                        <ChevronRight className="size-3.5 opacity-60" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="shrink-0" />

      {/* Footer with client info - Fixed at bottom */}
      <div className="p-3 bg-muted/30 border-t shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-xs text-foreground/80 uppercase tracking-wider">
            SL HUB COMPUTER
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Deiyandara | Hotline: 071 067 8944
        </p>

        {/* Developer Support Card - High Visibility */}
        <div className="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10">
              <Code className="size-3 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Developer Support
            </span>
          </div>
          <p className="text-xs font-extrabold text-foreground tracking-tight leading-none">
            Shanuka Digital Solutions
          </p>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5">
            <span>Tech Partner</span>
            <span className="opacity-60">v2.5.0</span>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-primary hover:underline mt-3 text-[11px] font-medium"
        >
          <Store className="size-3" />
          View Live Store
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Notification Bell - Shows real Notification model data
// ---------------------------------------------------------------------------
function NotificationBell({
  pendingOrders,
  unreadMessages,
  recentActivity,
  notifications,
  unreadNotificationCount,
  onMarkAllRead,
  onMarkRead,
}: {
  pendingOrders: number;
  unreadMessages: number;
  recentActivity: { type: string; title: string; description: string; timestamp: string; status?: string }[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}) {
  const router = useRouter();
  const totalUnread = unreadNotificationCount;

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      // Mark as read
      onMarkRead(notification.id);
      // Navigate if link exists
      if (notification.link) {
        router.push(notification.link);
      } else {
        // Default navigation based on type
        const linkMap: Record<string, string> = {
          order: "/admin/orders",
          message: "/admin/messages",
          review: "/admin/reviews",
          stock: "/admin/products",
          coupon: "/admin/settings",
          system: "/admin",
        };
        const link = linkMap[notification.type];
        if (link) router.push(link);
      }
    },
    [router, onMarkRead]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-[11px] text-muted-foreground">
              {totalUnread > 0 ? `${totalUnread} unread` : "All caught up!"}
            </p>
          </div>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1 text-primary hover:text-primary"
              onClick={onMarkAllRead}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px] w-full">
          {notifications.length === 0 && recentActivity.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <BellOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No notifications</p>
              <p className="text-[11px] mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y flex flex-col">
              {/* Real notifications from Notification model */}
              {notifications.length > 0 && (
                <>
                  {notifications.slice(0, 15).map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-2.5 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${colorClass}`}>
                          <Icon className="size-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            <p className="text-xs font-medium truncate">{notification.title}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Fallback: show recent activity if no real notifications */}
              {notifications.length === 0 && recentActivity.length > 0 && (
                <>
                  <div className="px-3 py-1.5 bg-muted/30">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</p>
                  </div>
                  {recentActivity.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        item.type === "order"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : item.type === "message"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {item.type === "order" ? (
                          <ShoppingCart className="size-3" />
                        ) : item.type === "message" ? (
                          <MessageSquare className="size-3" />
                        ) : (
                          <Star className="size-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t flex items-center justify-between">
          {totalUnread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
          <Link
            href={pendingOrders > 0 ? "/admin/orders" : "/admin/messages"}
            className="text-[11px] text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 ml-auto"
          >
            View all
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// ThemeToggle - Compact version for topbar
// ---------------------------------------------------------------------------
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb - Current page indicator
// ---------------------------------------------------------------------------
function Breadcrumb() {
  const pathname = usePathname();

  // Find the matching nav item for current path
  const currentNav = allNavItems.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)
  );

  const pageName = currentNav?.label || "Admin";

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">Admin</span>
      {pageName !== "Admin" && (
        <>
          <ChevronRight className="size-3 text-muted-foreground" />
          <span className="font-medium">{pageName}</span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminLayout - Main layout component wrapping all admin pages
// ---------------------------------------------------------------------------
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [recentActivity, setRecentActivity] = useState<
    { type: string; title: string; description: string; timestamp: string; status?: string }[]
  >([]);

  // State for notifications and site settings
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin/login");
    }
  }, [router]);

  // Mark all notifications as read
  const handleMarkAllRead = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  }, []);

  // Mark a single notification as read
  const handleMarkRead = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  }, []);

  // Fetch all data (stats, notifications, settings)
  const fetchData = useCallback(async () => {
    try {
      // Fetch stats (pending orders, unread messages, recent activity)
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setPendingOrders(statsData.data.pendingOrders || 0);
        setUnreadMessages(statsData.data.unreadMessages || 0);
        setRecentActivity(statsData.data.recentActivity || []);
      }

      // Fetch unread chat messages count
      try {
        const chatRes = await fetch("/api/admin/chat");
        const chatData = await chatRes.json();
        if (chatData.success) {
          const totalUnread = (chatData.data as { unreadCount: number }[]).reduce(
            (sum, s) => sum + s.unreadCount,
            0
          );
          setUnreadChat(totalUnread);
        }
      } catch {
        // Chat fetch is non-critical
      }

      // Fetch real notifications from Notification model
      const notifRes = await fetch("/api/admin/notifications?includeCount=true&limit=20");
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.data.notifications || []);
        setUnreadNotificationCount(notifData.data.unreadCount || 0);
      }

      // Fetch site settings for dynamic navigation
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setSiteSettings(settingsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter navigation groups based on site settings
  const filteredNavGroups = useMemo(() => {
    if (!siteSettings) return navGroups;

    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.label === "Pre-Built PCs" && siteSettings.enablePrebuiltPC === false) return false;
        if (item.label === "Affiliates" && siteSettings.enableAffiliate === false) return false;
        if (item.label === "Gift Cards" && siteSettings.enableGiftCards === false) return false;
        if (item.label === "Services" && siteSettings.enableRepairServices === false) return false;
        if (item.label === "Testimonials" && siteSettings.enableTestimonials === false) return false;
        if (item.label === "Reviews" && siteSettings.enableReviews === false) return false;
        if (item.label === "Flash Deals" && siteSettings.enableFlashDeals === false) return false;
        return true;
      })
    })).filter(group => group.items.length > 0);
  }, [siteSettings]);

  // Get pathname for conditional rendering
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page renders without sidebar/topbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen flex bg-background">
        {/* ----------------------------------------------------------------- */}
        {/* Desktop Sidebar - Fixed position, hidden on mobile               */}
        {/* ----------------------------------------------------------------- */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card shadow-sm overflow-hidden">
          <SidebarContent
            pendingOrders={pendingOrders}
            unreadMessages={unreadMessages}
            unreadChat={unreadChat}
            navGroups={filteredNavGroups}
          />
        </aside>

        {/* ----------------------------------------------------------------- */}
        {/* Main Content Area - Offset by sidebar width on desktop            */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 flex items-center h-14 px-4 border-b bg-card/80 backdrop-blur-md gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden">
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  onClose={() => setMobileOpen(false)}
                  pendingOrders={pendingOrders}
                  unreadMessages={unreadMessages}
                  unreadChat={unreadChat}
                  navGroups={filteredNavGroups}
                />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side: Notifications, Theme, Profile, Logout */}
            <div className="flex items-center gap-1">
              {/* Notification Bell - Enhanced with real Notification data */}
              <NotificationBell
                pendingOrders={pendingOrders}
                unreadMessages={unreadMessages}
                recentActivity={recentActivity}
                notifications={notifications}
                unreadNotificationCount={unreadNotificationCount}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
              />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* User Profile */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="size-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">Admin</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="px-2 py-1.5 border-b mb-1">
                    <p className="text-sm font-medium">SL HUB Admin</p>
                    <p className="text-[11px] text-muted-foreground">slhubcomputer@gmail.com</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <Settings className="size-3.5" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <Store className="size-3.5" />
                    View Store
                  </Link>
                  <div className="border-t mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                    >
                      <LogOut className="size-3.5" />
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                title="Sign Out"
              >
                <LogOut className="size-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
