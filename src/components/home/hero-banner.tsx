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
import { ChevronLeft, ChevronRight, Cpu, Camera, Wrench } from "lucide-react";
import type { ViewType } from "@/types";

// Banner data for SL HUB COMPUTER
const banners = [
  {
    title: "Custom PC Building",
    subtitle: "Build Your Dream PC",
    description: "Configure your perfect custom PC with premium components. Expert assembly, testing, and warranty included at SL HUB COMPUTER.",
    buttonText: "Start Building",
    view: "pc-builder" as ViewType,
    gradient: "from-blue-600 via-blue-700 to-blue-900",
    icon: <Cpu className="w-16 h-16 text-blue-200" />,
    accent: "text-blue-100",
  },
  {
    title: "CCTV Security Solutions",
    subtitle: "Protect What Matters",
    description: "Professional CCTV installation with Tiandy, Hikvision, and Dahua. Complete security solutions for homes and businesses.",
    buttonText: "View CCTV",
    view: "category" as ViewType,
    gradient: "from-emerald-600 via-emerald-700 to-teal-900",
    icon: <Camera className="w-16 h-16 text-emerald-200" />,
    accent: "text-emerald-100",
  },
  {
    title: "Expert Repair Services",
    subtitle: "Laptop & PC Repair",
    description: "Professional repair by certified technicians. Hardware repairs, software fixes, data recovery, and upgrades at SL HUB COMPUTER.",
    buttonText: "Contact Us",
    view: "contact" as ViewType,
    gradient: "from-orange-600 via-red-700 to-red-900",
    icon: <Wrench className="w-16 h-16 text-orange-200" />,
    accent: "text-orange-100",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const { setCurrentView } = useStore();

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden">
      <div
        className={`bg-gradient-to-r ${banner.gradient} transition-all duration-700 ease-in-out`}
      >
        <div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Text Content */}
            <div className="flex-1 text-white">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
                {banner.subtitle}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {banner.title}
              </h2>
              <p className={`text-lg mb-6 max-w-lg ${banner.accent} opacity-90`}>
                {banner.description}
              </p>
              <Button
                onClick={() => setCurrentView(banner.view)}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                {banner.buttonText}
              </Button>
            </div>

            {/* Icon Illustration */}
            <div className="flex-shrink-0 opacity-30 md:opacity-40">
              {banner.icon}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots & Arrows */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
