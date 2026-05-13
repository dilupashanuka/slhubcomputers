// =============================================================================
// SL HUB COMPUTER - SEO Manager
// =============================================================================
// Purpose: Dynamically updates document title and meta tags for the SPA router
// =============================================================================

"use client";

import { useEffect } from "react";
import { useStore } from "@/store/use-store";

const SITE_NAME = "SL HUB COMPUTER";
const DEFAULT_DESC = "Your trusted partner for high-end computer components, prebuilt PCs, and tech services in Sri Lanka.";

export function SEOManager() {
  const { currentView, selectedCategoryId, selectedProductId } = useStore();

  useEffect(() => {
    let title = SITE_NAME;
    let description = DEFAULT_DESC;

    switch (currentView) {
      case "home":
        title = `${SITE_NAME} | Premium Computer Store Sri Lanka`;
        break;
      case "category":
        title = `Shop Categories | ${SITE_NAME}`;
        description = "Browse our wide range of computer hardware, peripherals, and accessories.";
        break;
      case "product":
        title = `View Product | ${SITE_NAME}`;
        break;
      case "pc-builder":
        title = `Custom PC Builder | ${SITE_NAME}`;
        description = "Build your dream PC with our interactive step-by-step configurator.";
        break;
      case "cart":
        title = `Shopping Cart | ${SITE_NAME}`;
        break;
      case "checkout":
        title = `Secure Checkout | ${SITE_NAME}`;
        break;
      case "wishlist":
        title = `My Wishlist | ${SITE_NAME}`;
        break;
      case "compare":
        title = `Compare Products | ${SITE_NAME}`;
        break;
      case "prebuilt":
        title = `Prebuilt Gaming PCs | ${SITE_NAME}`;
        description = "Powerful, ready-to-use gaming and workstation PCs for every budget.";
        break;
      case "contact":
        title = `Contact Us | ${SITE_NAME}`;
        description = "Get in touch with SL HUB COMPUTER for inquiries and support.";
        break;
      case "about":
        title = `About Us | ${SITE_NAME}`;
        description = "Learn more about SL HUB COMPUTER and our mission.";
        break;
      case "affiliate":
        title = `Affiliate Program | ${SITE_NAME}`;
        description = "Join our affiliate program and earn commissions on every sale.";
        break;
      case "gift-card":
        title = `Gift Cards | ${SITE_NAME}`;
        description = "The perfect gift for any tech enthusiast.";
        break;
      default:
        title = `${SITE_NAME} | Tech Store`;
    }

    document.title = title;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [currentView, selectedCategoryId, selectedProductId]);

  return null;
}
