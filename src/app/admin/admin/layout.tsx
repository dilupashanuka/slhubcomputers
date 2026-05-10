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
// Client: SL HUB COMPUTER, Deiyandara | Hotline: 071 067 8944
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Star,
  Image,
  Wrench,
  MessageSquare,
  Monitor,
  Settings,
  Menu,
  ChevronRight,
  Store,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  Keyboard,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: "pending" },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare, badge: "unread" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
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
// SidebarContent - Professional sidebar body
// ---------------------------------------------------------------------------
function SidebarContent({
  onClose,
  pendingOrders,
  unreadMessages,
}: {
  onClose?: () => void;
  pendingOrders: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();

  // Badge count map
  const badgeCounts: Record<string, number> = {
    pending: pendingOrders,
    unread: unreadMessages,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/25">
          SL
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">SL HUB</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">Admin Panel</p>
        </div>
      </div>

      <Separator />

      {/* Navigation Groups */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-4">
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

      <Separator />

      {/* Footer with client info */}
      <div className="p-3 text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-medium text-foreground/70">SL HUB COMPUTER</span>
        </div>
        <p>Deiyandara | Hotline: 071 067 8944</p>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-primary hover:underline mt-1.5"
        >
          <Store className="size-3" />
          View Store
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification Bell - Shows recent unread items
// ---------------------------------------------------------------------------
function NotificationBell({
  pendingOrders,
  unreadMessages,
  recentActivity,
}: {
  pendingOrders: number;
  unreadMessages: number;
  recentActivity: { type: string; title: string; description: string; timestamp: string; status?: string }[];
}) {
  const totalUnread = pendingOrders + unreadMessages;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <p className="text-[11px] text-muted-foreground">
            {totalUnread > 0 ? `${totalUnread} unread` : "All caught up!"}
          </p>
        </div>
        <ScrollArea className="h-72">
          {recentActivity.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              No recent activity
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.slice(0, 8).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${
                    item.type === "order"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : item.type === "message"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
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
            </div>
          )}
        </ScrollArea>
        {totalUnread > 0 && (
          <div className="p-2 border-t">
            <Link
              href={pendingOrders > 0 ? "/admin/orders" : "/admin/messages"}
              className="text-xs text-primary hover:underline block text-center py-1"
            >
              View all notifications
            </Link>
          </div>
        )}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [recentActivity, setRecentActivity] = useState<
    { type: string; title: string; description: string; timestamp: string; status?: string }[]
  >([]);

  // Fetch notification data
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setPendingOrders(data.data.pendingOrders || 0);
          setUnreadMessages(data.data.unreadMessages || 0);
          setRecentActivity(data.data.recentActivity || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* ----------------------------------------------------------------- */}
      {/* Desktop Sidebar - Fixed position, hidden on mobile               */}
      {/* ----------------------------------------------------------------- */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card shadow-sm">
        <SidebarContent
          pendingOrders={pendingOrders}
          unreadMessages={unreadMessages}
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
              />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side: Search, Notifications, Theme, Profile */}
          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <NotificationBell
              pendingOrders={pendingOrders}
              unreadMessages={unreadMessages}
              recentActivity={recentActivity}
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
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
