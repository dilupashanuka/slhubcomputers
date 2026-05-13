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
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Cpu, Camera, Wrench, Check, Zap, ShieldCheck } from "lucide-react";
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
    badges: [
      { icon: "check", text: "Compatibility Check" },
      { icon: "zap", text: "Wattage Calculator" },
      { icon: "shield", text: "Expert Assembly" }
    ],
  },
  {
    id: "default-2",
    title: "Next-Gen Gaming GPUs",
    subtitle: "Ultimate Performance",
    description: "Experience gaming like never before with the latest NVIDIA RTX and AMD Radeon graphics cards. Unbeatable prices on all high-end GPUs.",
    buttonText: "Shop GPUs",
    image: "/images/gpu-hero.png",
    view: "category" as ViewType,
    gradient: "from-emerald-600 via-emerald-700 to-teal-900",
    icon: <Camera className="w-24 h-24 text-emerald-200" />,
    badges: [
      { icon: "check", text: "Tested & Verified" },
      { icon: "zap", text: "High Performance" },
      { icon: "shield", text: "1-3 Year Warranty" }
    ],
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
    badges: [
      { icon: "check", text: "Certified Technicians" },
      { icon: "zap", text: "Quick Turnaround" },
      { icon: "shield", text: "Repair Warranty" }
    ],
  },
];

export function HeroBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setCurrentView, isModuleEnabled } = useStore();

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        let activeBanners = data.success && data.data?.length > 0 ? data.data : defaultBanners;
        
        // Filter banners based on site settings using helper
        const filtered = activeBanners.filter((b: any) => {
          if (b.view === "pc-builder") return isModuleEnabled("enablePCBuilder");
          if (b.view === "prebuilt") return isModuleEnabled("enablePrebuiltPC");
          if (b.view === "gift-card") return isModuleEnabled("enableGiftCards");
          if (b.view === "affiliate") return isModuleEnabled("enableAffiliate");
          if (b.view === "contact") return isModuleEnabled("enableRepairServices");
          return true;
        });

        setBanners(filtered.length > 0 ? filtered : defaultBanners.slice(0, 1));
      })
      .catch(() => setBanners(defaultBanners.slice(0, 1)))
      .finally(() => setLoading(false));
  }, [isModuleEnabled]);

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
              className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            
            {/* Premium Glow Effect */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
          </div>
        )}

        {!banner.image && (
          <div className="absolute inset-0 z-0 overflow-hidden">
             <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 blur-[120px] rounded-full"></div>
             <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/5 blur-[120px] rounded-full"></div>
          </div>
        )}

        <div className="w-full px-6 md:px-12 lg:px-20 py-16 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col md:flex-row items-center justify-between gap-12"
            >
              {/* Text Content */}
              <div className="flex-1 text-white text-center md:text-left">
                {banner.subtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge variant="secondary" className="mb-6 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-400/30 px-4 py-1 text-sm uppercase tracking-wider">
                      {banner.subtitle}
                    </Badge>
                  </motion.div>
                )}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm"
                >
                  {banner.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl mb-10 max-w-xl text-blue-50/90 leading-relaxed"
                >
                  {banner.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 justify-center md:justify-start"
                >
                  <Button
                    onClick={() => {
                      if (banner.link && banner.link.startsWith("/")) {
                        setCurrentView(banner.view || "home");
                      } else if (banner.link) {
                        window.open(banner.link, "_blank");
                      } else {
                        setCurrentView(banner.view || "home");
                      }
                    }}
                    size="lg"
                    className="bg-white hover:bg-white/90 text-blue-950 font-bold px-10 py-7 rounded-2xl shadow-xl transition-all hover:scale-105 text-lg"
                  >
                    {banner.buttonText || "Learn More"}
                  </Button>
                </motion.div>
                
                {/* Feature Badges */}
                {((banner.badges) || (defaultBanners.find(b => b.view === banner.view)?.badges)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-3 justify-center md:justify-start mt-8"
                  >
                    {(banner.badges || defaultBanners.find(b => b.view === banner.view)?.badges)?.map((b: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-sm font-medium text-white/90 shadow-sm transition-colors hover:bg-black/50 hover:border-white/40">
                        {b.icon === "check" && <Check className="w-4 h-4 text-blue-400" />}
                        {b.icon === "zap" && <Zap className="w-4 h-4 text-amber-400" />}
                        {b.icon === "shield" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        <span>{b.text}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Visual Element (Icon fallback or just spacer) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative hidden md:flex items-center justify-center flex-1"
              >
                {/* Floating Animation for Image/Icon */}
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  {banner.image ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full scale-75"></div>
                      <img 
                        src={banner.image} 
                        alt="" 
                        className="w-[300px] lg:w-[450px] h-auto rounded-3xl shadow-2xl relative z-10 border border-white/10"
                      />
                    </div>
                  ) : (
                    <div className="p-12 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
                      {banner.icon}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
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
