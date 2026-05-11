// =============================================================================
// SL HUB COMPUTER - Header Component
// =============================================================================
// Purpose: Main site header with top bar, logo, search, navigation, and cart
// Features: Responsive design, mobile hamburger menu, search autocomplete,
//           cart/wishlist/compare indicators, dark mode toggle
// Brand: SL HUB COMPUTER with blue (#2563eb) primary color
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/store/use-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  Heart,
  GitCompareArrows,
  Menu,
  X,
  Sun,
  Moon,
  Phone,
  Mail,
  MapPin,
  Globe,
  Cpu,
  Monitor,
  Wrench,
  Camera,
  Laptop,
  Smartphone,
  ChevronDown,
  Building2,
  CreditCard,
  User,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import type { ViewType } from "@/types";

// Navigation links for main nav
const navLinks: { label: string; view: ViewType; icon?: React.ReactNode }[] = [
  { label: "Home", view: "home" },
  { label: "Pre-Built PCs", view: "prebuilt", icon: <Building2 className="w-4 h-4" /> },
  { label: "PC Builder", view: "pc-builder", icon: <Wrench className="w-4 h-4" /> },
  { label: "Gift Cards", view: "gift-card", icon: <CreditCard className="w-4 h-4" /> },
  { label: "About", view: "about" },
  { label: "Contact", view: "contact" },
  { label: "Track Order", view: "order-tracking", icon: <MapPin className="w-4 h-4" /> },
];

export function Header() {
  const {
    currentView,
    setCurrentView,
    cart,
    wishlist,
    compareList,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigateToSearch,
    customer,
    isLoggedIn,
    logoutCustomer,
    siteSettings,
  } = useStore();

  // Filter navigation links based on site settings
  const filteredNavLinks = navLinks.filter(link => {
    if (link.view === "pc-builder" && siteSettings?.enablePCBuilder === false) return false;
    if (link.view === "prebuilt" && siteSettings?.enablePrebuiltPC === false) return false;
    if (link.view === "gift-card" && siteSettings?.enableGiftCards === false) return false;
    if (link.view === "affiliate" && siteSettings?.enableAffiliate === false) return false;
    return true;
  });
  const { theme, setTheme } = useTheme();
  const [searchInput, setSearchInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      const checkAuth = async () => {
        try {
          const res = await fetch("/api/auth/me");
          const data = await res.json();
          if (data.success && data.data) {
            useStore.getState().setCustomer(data.data);
          }
        } catch {
          // Not logged in
        }
      };
      checkAuth();
    }
  }, [mounted]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue anyway
    }
    logoutCustomer();
    setAccountDropdownOpen(false);
  };

  useEffect(() => setMounted(true), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateToSearch(searchInput.trim());
      setSearchInput("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md">
      {/* ---- Top Bar - Contact info ---- */}
      <div className="bg-blue-600 text-white text-xs sm:text-sm">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> 071 067 8944
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> slhubcomputer@gmail.com
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Deiyandara
            </span>
          </div>
          <div className="sm:hidden text-center w-full font-medium">
            📞 071 067 8944 | SL HUB COMPUTER
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=100063543731370"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
            </a>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:text-blue-200 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Main Header ---- */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-2 shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="SL HUB COMPUTER" 
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full">
              <Input
                ref={searchRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="rounded-r-none border-r-0 focus-visible:ring-blue-600"
              />
              <Button type="submit" className="rounded-l-none bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => searchRef.current?.focus()}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Dark mode toggle (mobile) */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}

            {/* Compare */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCurrentView("compare")}
            >
              <GitCompareArrows className="w-5 h-5" />
              {compareList.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-blue-600 text-[10px]">
                  {compareList.length}
                </Badge>
              )}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCurrentView("wishlist")}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                  {wishlist.length}
                </Badge>
              )}
            </Button>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  if (isLoggedIn) {
                    setAccountDropdownOpen(!accountDropdownOpen);
                  } else {
                    setCurrentView("customer-login");
                  }
                }}
              >
                <User className="w-5 h-5" />
                {isLoggedIn && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </Button>
              {/* Account Dropdown */}
              {accountDropdownOpen && isLoggedIn && customer && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50 dark:bg-gray-900/50">
                    <p className="font-medium text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setCurrentView("customer-account"); setAccountDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      My Account
                    </button>
                    <button
                      onClick={() => { setCurrentView("customer-account"); setAccountDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Package className="w-4 h-4 text-blue-600" />
                      My Orders
                    </button>
                    <button
                      onClick={() => { setCurrentView("wishlist"); setAccountDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-600" />
                      Wishlist
                    </button>
                  </div>
                  <div className="border-t p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCurrentView("cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-blue-600 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="text-blue-600 font-bold text-xl mb-4">
                  SL HUB COMPUTER
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  {filteredNavLinks.map((link) => (
                    <button
                      key={link.view}
                      onClick={() => setCurrentView(link.view)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  ))}
                  <div className="border-t my-2" />
                  <button
                    onClick={() => { setCurrentView(isLoggedIn ? "customer-account" : "customer-login"); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{isLoggedIn ? "My Account" : "Sign In"}</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("order-tracking")}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Track Order</span>
                  </button>
                  <button
                    onClick={() => setCurrentView("faq")}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground text-left"
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => setCurrentView("shipping")}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground text-left"
                  >
                    Shipping Policy
                  </button>
                  <button
                    onClick={() => setCurrentView("returns")}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground text-left"
                  >
                    Returns & Refunds
                  </button>
                  <button
                    onClick={() => setCurrentView("terms")}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground text-left"
                  >
                    Terms & Conditions
                  </button>
                  <div className="border-t my-2" />
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm text-blue-600 hover:underline text-left"
                  >
                    Admin Panel →
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search (visible on small screens) */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="flex w-full">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="rounded-r-none border-r-0"
            />
            <Button type="submit" className="rounded-l-none bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* ---- Desktop Navigation Bar ---- */}
      <nav className="hidden lg:block border-t bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            {filteredNavLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => setCurrentView(link.view)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 border-b-2 ${
                  currentView === link.view
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-blue-300"
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setCurrentView("faq")}
                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </button>
              <span className="text-muted-foreground/30">|</span>
              <Link
                href="/admin"
                className="px-3 py-2 text-xs text-blue-600 hover:underline"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
