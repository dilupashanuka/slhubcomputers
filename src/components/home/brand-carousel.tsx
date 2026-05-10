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
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-center">Top Brands We Carry</h2>
        <p className="text-center text-muted-foreground mt-1">
          Authentic products from world-leading manufacturers
        </p>
      </div>

      {/* Infinite scroll marquee */}
      <div className="relative overflow-hidden">
        <div className="flex gap-4 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
          {allBrands.map((brand, i) => (
            <Card
              key={`${brand.id}-${i}`}
              className="shrink-0 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center justify-center min-w-[140px] h-20">
                <span className="font-semibold text-sm text-center text-muted-foreground hover:text-blue-600 transition-colors">
                  {brand.name}
                </span>
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
