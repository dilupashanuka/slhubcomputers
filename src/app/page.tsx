// =============================================================================
// SL HUB COMPUTER - Main Page (Client-Side Router)
// =============================================================================
// Purpose: Single-page application entry point using Zustand for routing
// Features: Auto-seeds database on first load, renders components based on
//           currentView from Zustand store, includes header/footer on all views
// Merged: SL HUB features + TechZone UI enhancements (trust badges, animations)
// =============================================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/use-store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Dynamic imports for better initial load performance
const HomePage = dynamic(() => import("@/components/home/home-page").then(mod => mod.HomePage), { ssr: false });
const ProductGrid = dynamic(() => import("@/components/products/product-grid").then(mod => mod.ProductGrid), { ssr: false });
const ProductDetail = dynamic(() => import("@/components/products/product-detail").then(mod => mod.ProductDetail), { ssr: false });
const Builder = dynamic(() => import("@/components/pc-builder/builder").then(mod => mod.Builder), { ssr: false });
const CartPage = dynamic(() => import("@/components/cart/cart-page").then(mod => mod.CartPage), { ssr: false });
const CheckoutPage = dynamic(() => import("@/components/checkout/checkout-page").then(mod => mod.CheckoutPage), { ssr: false });
const WishlistPage = dynamic(() => import("@/components/wishlist/wishlist-page").then(mod => mod.WishlistPage), { ssr: false });
const ComparePage = dynamic(() => import("@/components/compare/compare-page").then(mod => mod.ComparePage), { ssr: false });
const SearchResults = dynamic(() => import("@/components/search/search-results").then(mod => mod.SearchResults), { ssr: false });
const AboutPage = dynamic(() => import("@/components/pages/about-page").then(mod => mod.AboutPage), { ssr: false });
const ContactPage = dynamic(() => import("@/components/pages/contact-page").then(mod => mod.ContactPage), { ssr: false });
const FaqPage = dynamic(() => import("@/components/pages/faq-page").then(mod => mod.FaqPage), { ssr: false });
const ShippingPage = dynamic(() => import("@/components/pages/shipping-page").then(mod => mod.ShippingPage), { ssr: false });
const ReturnsPage = dynamic(() => import("@/components/pages/returns-page").then(mod => mod.ReturnsPage), { ssr: false });
const TermsPage = dynamic(() => import("@/components/pages/terms-page").then(mod => mod.TermsPage), { ssr: false });
const PrebuiltPCPage = dynamic(() => import("@/components/pages/prebuilt-pc-page").then(mod => mod.PrebuiltPCPage), { ssr: false });
const OrderTrackingPage = dynamic(() => import("@/components/pages/order-tracking-page").then(mod => mod.OrderTrackingPage), { ssr: false });
const CustomerLoginPage = dynamic(() => import("@/components/pages/customer-login-page").then(mod => mod.CustomerLoginPage), { ssr: false });
const CustomerAccountPage = dynamic(() => import("@/components/pages/customer-account-page").then(mod => mod.CustomerAccountPage), { ssr: false });
const AffiliatePage = dynamic(() => import("@/components/pages/affiliate-page").then(mod => mod.AffiliatePage), { ssr: false });
const GiftCardPage = dynamic(() => import("@/components/pages/gift-card-page").then(mod => mod.GiftCardPage), { ssr: false });

import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { BackToTop } from "@/components/layout/back-to-top";
import { SEOManager } from "@/components/layout/seo-manager";
import ChatWidget from "@/components/chat/chat-widget";
import { Zap } from "lucide-react";

// ---------------------------------------------------------------------------
// Main Page Component - Routes between views based on Zustand state
// ---------------------------------------------------------------------------
export default function HomePageRouter() {
  const { currentView, selectedCategoryId, selectedProductId, siteSettings, isModuleEnabled } = useStore();


  // Analytics tracking effect


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
    trackPageView();
  }, [currentView, selectedProductId]);

  // Removed auto-seed logic for production stability

  // Track affiliate referral from URL
  useEffect(() => {
    const trackAffiliate = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get("ref");
        if (refCode) {
          // Track the click via API (also sets cookie)
          await fetch(`/api/affiliates/track?code=${encodeURIComponent(refCode)}`);
          // Clean up URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete("ref");
          window.history.replaceState({}, "", url.toString());
        }
      } catch {
        // Silent fail for affiliate tracking
      }
    };
    trackAffiliate();
  }, []);

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
        return isModuleEnabled("enablePCBuilder") ? <Builder /> : <HomePage />;
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
        return isModuleEnabled("enablePrebuiltPC") ? <PrebuiltPCPage /> : <HomePage />;
      case "order-tracking":
        return <OrderTrackingPage />;
      case "customer-login":
        return <CustomerLoginPage />;
      case "customer-account":
        return <CustomerAccountPage />;
      case "affiliate":
        return isModuleEnabled("enableAffiliate") ? <AffiliatePage /> : <HomePage />;
      case "gift-card":
        return isModuleEnabled("enableGiftCards") ? <GiftCardPage /> : <HomePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOManager />
      <Header />
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <ChatWidget />
    </div>
  );
}
