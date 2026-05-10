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
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { BackToTop } from "@/components/layout/back-to-top";
import { Sparkles, TrendingUp, Star, Zap } from "lucide-react";

// ---------------------------------------------------------------------------
// Home Page Component - The main landing page view
// Merged: SL HUB sections + TechZone-style section icons
// ---------------------------------------------------------------------------
function HomePage() {
  return (
    <div className="space-y-8">
      <HeroBanner />
      <div className="container mx-auto px-4 space-y-12">
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
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
    </div>
  );
}
