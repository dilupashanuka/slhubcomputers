// =============================================================================
// SL HUB COMPUTER - Hero Banner Component
// =============================================================================
// Purpose: Homepage hero section with 3 rotating promotional banners
// Features: Auto-rotating carousel with manual controls, blue gradient backgrounds,
//           CTA buttons linking to relevant sections
// Banners: Custom PC Building, CCTV Security, Laptop Repair
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Cpu, Camera, Wrench } from "lucide-react";
import type { ViewType, BannerType } from "@/types";

// Default fallback banners if DB is empty
const defaultBanners = [
  {
    id: "default-1",
    title: "Custom PC Building",
    subtitle: "Build Your Dream PC",
    description: "Configure your perfect custom PC with premium components. Expert assembly, testing, and warranty included.",
    buttonText: "Start Building",
    image: null,
    view: "pc-builder" as ViewType,
    gradient: "from-blue-600 via-blue-700 to-blue-900",
    icon: <Cpu className="w-24 h-24 text-blue-200" />,
  },
  {
    id: "default-2",
    title: "CCTV Security Solutions",
    subtitle: "Protect What Matters",
    description: "Professional CCTV installation with Tiandy, Hikvision, and Dahua. Complete security solutions for homes and businesses.",
    buttonText: "View CCTV",
    image: null,
    view: "category" as ViewType,
    gradient: "from-emerald-600 via-emerald-700 to-teal-900",
    icon: <Camera className="w-24 h-24 text-emerald-200" />,
  },
  {
    id: "default-3",
    title: "Expert Repair Services",
    subtitle: "Laptop & PC Repair",
    description: "Professional repair by certified technicians. Hardware repairs, software fixes, and upgrades at SL HUB COMPUTER.",
    buttonText: "Contact Us",
    image: null,
    view: "contact" as ViewType,
    gradient: "from-orange-600 via-red-700 to-red-900",
    icon: <Wrench className="w-24 h-24 text-orange-200" />,
  },
];

export function HeroBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setCurrentView } = useStore();

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setBanners(data.data);
        } else {
          setBanners(defaultBanners);
        }
      })
      .catch(() => setBanners(defaultBanners))
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate banners every 8 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return <Skeleton className="w-full h-[400px] rounded-none" />;
  }

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden group">
      <div
        className={`relative transition-all duration-700 ease-in-out min-h-[400px] md:min-h-[500px] flex items-center ${
          !banner.image ? `bg-gradient-to-r ${banner.gradient || "from-blue-600 to-indigo-900"}` : "bg-gray-900"
        }`}
      >
        {/* Background Image if exists */}
        {banner.image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>
        )}

        <div className="w-full px-6 md:px-12 lg:px-20 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="flex-1 text-white text-center md:text-left">
              {banner.subtitle && (
                <Badge variant="secondary" className="mb-6 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-400/30 px-4 py-1 text-sm uppercase tracking-wider">
                  {banner.subtitle}
                </Badge>
              )}
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                {banner.title}
              </h1>
              <p className="text-lg md:text-xl mb-10 max-w-xl text-blue-50/90 leading-relaxed">
                {banner.description}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button
                  onClick={() => setCurrentView(banner.view || "home")}
                  size="xl"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                >
                  {banner.buttonText || "Learn More"}
                </Button>
              </div>
            </div>

            {/* Visual Element (Icon fallback or just spacer) */}
            {!banner.image && banner.icon && (
              <div className="hidden md:block opacity-40 animate-pulse">
                {banner.icon}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? "bg-blue-500 w-10 h-2" : "bg-white/30 w-2 h-2 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

  );
}
