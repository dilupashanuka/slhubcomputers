"use client";

import { HeroBanner } from "./hero-banner";
import { CategoryGrid } from "./category-grid";
import { FlashDeals } from "./flash-deals";
import { ProductSection } from "./product-section";
import { BrandCarousel } from "./brand-carousel";
import { NewsletterSection } from "./newsletter-section";
import { RecentlyViewed } from "./recently-viewed";
import { Sparkles, TrendingUp, Star } from "lucide-react";

export function HomePage() {
  return (
    <div className="space-y-8">
      <HeroBanner />
      <div className="container mx-auto px-4 space-y-12 py-8">
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
