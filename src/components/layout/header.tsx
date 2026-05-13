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
  GitCompare,
  User,
  GitCompareArrows,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquareText,
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
    customer,
    isLoggedIn,
    logoutCustomer,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    siteSettings,
    isModuleEnabled,
  } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const compareCount = compareList.length;

  // Filter navigation links based on site settings
  const filteredNavLinks = navLinks.filter(link => {
    if (link.view === "pc-builder") return isModuleEnabled("enablePCBuilder");
    if (link.view === "prebuilt") return isModuleEnabled("enablePrebuiltPC");
    if (link.view === "gift-card") return isModuleEnabled("enableGiftCards");
    if (link.view === "affiliate") return isModuleEnabled("enableAffiliate");
    return true;
  });
  const { theme, setTheme } = useTheme();
  const [searchInput, setSearchInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Smart scroll effect: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the top
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold -> hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> show
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateToSearch(searchInput.trim());
      setSearchInput("");
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md transition-transform duration-300 ease-in-out ${
      isVisible ? "translate-y-0" : "-translate-y-full"
    }`}>
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
            <Button
              variant="ghost"
              size="icon"
              className="relative group transition-transform hover:scale-110 active:scale-95"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
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
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Compare */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
              onClick={() => setCurrentView("compare")}
            >
              <GitCompare className="w-5 h-5 text-emerald-500" />
              {compareCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-emerald-600 text-[10px]">
                  {compareCount}
                </Badge>
              )}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
              onClick={() => setCurrentView("wishlist")}
            >
              <Heart className="w-5 h-5 text-rose-500" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-rose-600 text-[10px]">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Chatbot Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setCurrentView("contact")}
            >
              <MessageSquareText className="w-5 h-5 text-blue-600" />
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
                  
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm text-blue-600 hover:underline text-left"
                  >
                    Admin Panel →
                  </Link>
                </nav>

                  <div className="mt-auto pt-6 border-t">
                  <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Developer</p>
                    <a 
                      href="https://wa.me/94710678944" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform shadow-md">S</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-100">SHANUKA DIGITAL</span>
                        <span className="text-[10px] text-blue-500 font-medium">Click to contact</span>
                      </div>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search (toggleable) */}
        {isMobileSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden mt-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex w-full">
              <Input
                autoFocus
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
        )}
      </div>

      {/* ---- Desktop/Mobile Category Navigation Bar ---- */}
      <nav className="border-t bg-gray-50 dark:bg-gray-800 overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 min-w-max">
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
