// =============================================================================
// SL HUB COMPUTER - Brand Carousel Component
// =============================================================================
// Purpose: Infinite scroll brand marquee on the homepage
// Features: Auto-scrolling horizontal marquee, brand logos/names,
//           pauses on hover, responsive layout
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BrandType } from "@/types";

export function BrandCarousel() {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBrands(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Top Brands</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-32 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  // Duplicate brands for seamless infinite scroll
  const allBrands = [...brands, ...brands];

  return (
    <section className="py-12 bg-gray-50/50 dark:bg-gray-900/50 border-y border-border/50">
      <div className="w-full px-6 mb-8">
        <h2 className="text-2xl font-bold text-center tracking-tight">Top Brands We Carry</h2>
        <p className="text-center text-muted-foreground mt-2 text-sm">
          Authentic products from world-leading manufacturers
        </p>
      </div>

      {/* Infinite scroll marquee */}
      <div className="relative overflow-hidden w-full">
        {/* Fading edges for premium look */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 hidden sm:block"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 hidden sm:block"></div>

        <div className="flex gap-6 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused] w-max py-4">
          {allBrands.map((brand, i) => (
            <Card
              key={`${brand.id}-${i}`}
              className={`shrink-0 transition-all duration-300 border-none overflow-hidden ${
                brand.logo 
                  ? "bg-transparent shadow-none hover:shadow-none hover:-translate-y-1" 
                  : "bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-xl"
              }`}
            >
              <CardContent className="p-0 flex items-center justify-center min-w-[140px] h-24">
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-full w-full object-contain transition-all duration-300 p-2"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full p-4">
                    <span className="font-bold text-base text-center bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent opacity-80">
                      {brand.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CSS Animation for infinite scroll */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
