// =============================================================================
// SL HUB COMPUTER - Main Page (Client-Side Router)
// =============================================================================
// Purpose: Single-page application entry point using Zustand for routing
// Features: Auto-seeds database on first load, renders components based on
//           currentView from Zustand store, includes header/footer on all views
// Merged: SL HUB features + TechZone UI enhancements (trust badges, animations)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
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
import { ProductGrid } from "@/components/products/product-grid";
import { ProductDetail } from "@/components/products/product-detail";
import { Builder } from "@/components/pc-builder/builder";
import { CartPage } from "@/components/cart/cart-page";
import { CheckoutPage } from "@/components/checkout/checkout-page";
import { WishlistPage } from "@/components/wishlist/wishlist-page";
import { ComparePage } from "@/components/compare/compare-page";
import { SearchResults } from "@/components/search/search-results";
import { AboutPage } from "@/components/pages/about-page";
import { ContactPage } from "@/components/pages/contact-page";
import { FaqPage } from "@/components/pages/faq-page";
import { ShippingPage } from "@/components/pages/shipping-page";
import { ReturnsPage } from "@/components/pages/returns-page";
import { TermsPage } from "@/components/pages/terms-page";
import { PrebuiltPCPage } from "@/components/pages/prebuilt-pc-page";
import { OrderTrackingPage } from "@/components/pages/order-tracking-page";
import { CustomerLoginPage } from "@/components/pages/customer-login-page";
import { CustomerAccountPage } from "@/components/pages/customer-account-page";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { BackToTop } from "@/components/layout/back-to-top";
import ChatWidget from "@/components/chat/chat-widget";
import { Sparkles, TrendingUp, Star, Zap } from "lucide-react";

// ---------------------------------------------------------------------------
// Home Page Component - The main landing page view
// Merged: SL HUB sections + TechZone-style section icons
// ---------------------------------------------------------------------------
function HomePage() {
  return (
    <div className="space-y-8">
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
  const { currentView, selectedCategoryId, selectedProductId } = useStore();
  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track page views for analytics
  useEffect(() => {
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
        }).catch(() => {}); // Silent fail for analytics
      } catch {
        // Analytics tracking should never break the app
      }
    };
    if (!loading) trackPageView();
  }, [currentView, selectedProductId, loading]);

  // Auto-seed database on first load
  useEffect(() => {
    const seedDatabase = async () => {
      if (seeded) return;
      try {
        const res = await fetch("/api/seed", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          console.log("Database seeded successfully");
        }
      } catch (error) {
        console.error("Seed error:", error);
      } finally {
        setSeeded(true);
        setLoading(false);
      }
    };
    seedDatabase();
  }, [seeded]);

  // Render the appropriate view based on currentView
  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomePage />;
      case "category":
        return <ProductGrid />;
      case "product":
        return <ProductDetail />;
      case "pc-builder":
        return <Builder />;
      case "cart":
        return <CartPage />;
      case "checkout":
        return <CheckoutPage />;
      case "wishlist":
        return <WishlistPage />;
      case "compare":
        return <ComparePage />;
      case "search":
        return <SearchResults />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "faq":
        return <FaqPage />;
      case "shipping":
        return <ShippingPage />;
      case "returns":
        return <ReturnsPage />;
      case "terms":
        return <TermsPage />;
      case "prebuilt":
        return <PrebuiltPCPage />;
      case "order-tracking":
        return <OrderTrackingPage />;
      case "customer-login":
        return <CustomerLoginPage />;
      case "customer-account":
        return <CustomerAccountPage />;
      default:
        return <HomePage />;
    }
  };

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
        {renderView()}
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <ChatWidget />
    </div>
  );
}
