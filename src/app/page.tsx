// =============================================================================
// SL HUB COMPUTER - Main Page (Client-Side Router)
// =============================================================================
// Purpose: Single-page application entry point using Zustand for routing
// Features: Auto-seeds database on first load, renders components based on
//           currentView from Zustand store, includes header/footer on all views
// Merged: SL HUB features + TechZone UI enhancements (trust badges, animations)
// =============================================================================

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/store/use-store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryGrid } from "@/components/home/category-grid";
import { FlashDeals } from "@/components/home/flash-deals";
import { ProductSection } from "@/components/home/product-section";
import { BrandCarousel } from "@/components/home/brand-carousel";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { BackToTop } from "@/components/layout/back-to-top";
import ChatWidget from "@/components/chat/chat-widget";
import { Sparkles, TrendingUp, Star } from "lucide-react";

// ---------------------------------------------------------------------------
// Dynamic Imports for Code Splitting (Optimizes bundle size)
// ---------------------------------------------------------------------------
const ProductGrid = dynamic(() => import("@/components/products/product-grid").then(m => m.ProductGrid));
const ProductDetail = dynamic(() => import("@/components/products/product-detail").then(m => m.ProductDetail));
const Builder = dynamic(() => import("@/components/pc-builder/builder").then(m => m.Builder));
const CartPage = dynamic(() => import("@/components/cart/cart-page").then(m => m.CartPage));
const CheckoutPage = dynamic(() => import("@/components/checkout/checkout-page").then(m => m.CheckoutPage));
const WishlistPage = dynamic(() => import("@/components/wishlist/wishlist-page").then(m => m.WishlistPage));
const ComparePage = dynamic(() => import("@/components/compare/compare-page").then(m => m.ComparePage));
const SearchResults = dynamic(() => import("@/components/search/search-results").then(m => m.SearchResults));
const AboutPage = dynamic(() => import("@/components/pages/about-page").then(m => m.AboutPage));
const ContactPage = dynamic(() => import("@/components/pages/contact-page").then(m => m.ContactPage));
const FaqPage = dynamic(() => import("@/components/pages/faq-page").then(m => m.FaqPage));
const ShippingPage = dynamic(() => import("@/components/pages/shipping-page").then(m => m.ShippingPage));
const ReturnsPage = dynamic(() => import("@/components/pages/returns-page").then(m => m.ReturnsPage));
const TermsPage = dynamic(() => import("@/components/pages/terms-page").then(m => m.TermsPage));
const PrebuiltPCPage = dynamic(() => import("@/components/pages/prebuilt-pc-page").then(m => m.PrebuiltPCPage));
const OrderTrackingPage = dynamic(() => import("@/components/pages/order-tracking-page").then(m => m.OrderTrackingPage));
const CustomerLoginPage = dynamic(() => import("@/components/pages/customer-login-page").then(m => m.CustomerLoginPage));
const CustomerAccountPage = dynamic(() => import("@/components/pages/customer-account-page").then(m => m.CustomerAccountPage));

// ---------------------------------------------------------------------------
// Home Page Component - The main landing page view
// ---------------------------------------------------------------------------
function HomePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <HeroBanner />
      <CategoryGrid />
      <FlashDeals />
      <ProductSection
        title="Featured Products"
        subtitle="Hand-picked by our experts"
        endpoint="/api/products?isFeatured=true&limit=10"
        icon={<Star className="h-5 w-5 text-blue-600" />}
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Most popular items this month"
        endpoint="/api/products?isBestSeller=true&limit=10"
        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
      />
      <ProductSection
        title="New Arrivals"
        subtitle="The latest and greatest"
        endpoint="/api/products?isNew=true&limit=10"
        icon={<Sparkles className="h-5 w-5 text-blue-600" />}
      />
      <BrandCarousel />
      <NewsletterSection />
      <RecentlyViewed />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component - Routes between views based on Zustand state
// ---------------------------------------------------------------------------
export default function HomePageRouter() {
  const { currentView, selectedProductId } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Analytics tracking
    const trackPageView = async () => {
      try {
        const sessionId = localStorage.getItem("slhub_session_id") || (() => {
          const id = "sess_" + Math.random().toString(36).substring(2, 10);
          localStorage.setItem("slhub_session_id", id);
          return id;
        })();

        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: currentView === "product" ? "product_view" : "page_view",
            page: currentView,
            productId: currentView === "product" ? selectedProductId : undefined,
            sessionId,
          }),
        }).catch(() => {});
      } catch {}
    };
    if (!loading) trackPageView();
  }, [currentView, selectedProductId, loading]);

  useEffect(() => {
    // Initial mount hydration finish
    setLoading(false);
  }, []);

  // Render the appropriate view based on currentView
  const viewContent = useMemo(() => {
    switch (currentView) {
      case "home": return <HomePage />;
      case "category": return <ProductGrid />;
      case "product": return <ProductDetail />;
      case "pc-builder": return <Builder />;
      case "cart": return <CartPage />;
      case "checkout": return <CheckoutPage />;
      case "wishlist": return <WishlistPage />;
      case "compare": return <ComparePage />;
      case "search": return <SearchResults />;
      case "about": return <AboutPage />;
      case "contact": return <ContactPage />;
      case "faq": return <FaqPage />;
      case "shipping": return <ShippingPage />;
      case "returns": return <ReturnsPage />;
      case "terms": return <TermsPage />;
      case "prebuilt": return <PrebuiltPCPage />;
      case "order-tracking": return <OrderTrackingPage />;
      case "customer-login": return <CustomerLoginPage />;
      case "customer-account": return <CustomerAccountPage />;
      default: return <HomePage />;
    }
  }, [currentView]);

  // Show loading state while seeding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-blue-600">SL HUB COMPUTER</h2>
          <p className="text-muted-foreground mt-2">Loading your trusted tech partner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {viewContent}
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <ChatWidget />
    </div>
  );
}
