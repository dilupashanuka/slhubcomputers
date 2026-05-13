// =============================================================================
// SL HUB COMPUTER - Pre-Built PCs Page Component ⭐ KEY FEATURE
// =============================================================================
// Purpose: Showcase page for pre-built PC packages with category filtering
// Features: Hero banner, category filter tabs (All/Budget/Gaming/Office/Workstation),
//           PC cards with specs/features, WhatsApp order button, expandable details,
//           "Build your own" CTA, responsive grid, loading skeletons
// API: Fetches from /api/prebuilt-pcs with optional category filter
// Brand: SL HUB COMPUTER - wa.me/94710678944 for WhatsApp ordering
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Check,
  Zap,
  Building2,
  Briefcase,
  Star,
  Shield,
} from "lucide-react";
import type { PrebuiltPCType, PrebuiltPCSpecs } from "@/types";

// ---------------------------------------------------------------------------
// Category Filter Tabs Configuration
// Color-coded badges: green=budget, red/orange=gaming, blue=office, purple=workstation
// ---------------------------------------------------------------------------
const CATEGORY_TABS: {
  key: string;
  label: string;
  badgeColor: string;
  icon: React.ReactNode;
}[] = [
  { key: "all", label: "All PCs", badgeColor: "bg-gray-600", icon: <Cpu className="w-4 h-4" /> },
  { key: "budget", label: "Budget PCs", badgeColor: "bg-green-600", icon: <Zap className="w-4 h-4" /> },
  { key: "gaming", label: "Gaming PCs", badgeColor: "bg-red-600", icon: <Star className="w-4 h-4" /> },
  { key: "office", label: "Office PCs", badgeColor: "bg-blue-600", icon: <Briefcase className="w-4 h-4" /> },
  { key: "workstation", label: "Workstations", badgeColor: "bg-purple-600", icon: <Building2 className="w-4 h-4" /> },
];

// ---------------------------------------------------------------------------
// Helper: Get badge color class by category
// ---------------------------------------------------------------------------
function getCategoryBadge(category: string): { color: string; label: string } {
  switch (category) {
    case "budget":
      return { color: "bg-green-600", label: "Budget" };
    case "gaming":
      return { color: "bg-red-600", label: "Gaming" };
    case "office":
      return { color: "bg-blue-600", label: "Office" };
    case "workstation":
      return { color: "bg-purple-600", label: "Workstation" };
    default:
      return { color: "bg-gray-600", label: category };
  }
}

// ---------------------------------------------------------------------------
// Spec Icon Mapping
// ---------------------------------------------------------------------------
function getSpecIcon(key: string): React.ReactNode {
  switch (key.toLowerCase()) {
    case "cpu":
      return <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    case "gpu":
      return <Monitor className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    case "ram":
      return <MemoryStick className="w-3.5 h-3.5 text-green-600 shrink-0" />;
    case "storage":
      return <HardDrive className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    default:
      return <Cpu className="w-3.5 h-3.5 text-gray-600 shrink-0" />;
  }
}

// ---------------------------------------------------------------------------
// PC Card Sub-Component
// ---------------------------------------------------------------------------
function PCCard({ pc }: { pc: PrebuiltPCType }) {
  const [expanded, setExpanded] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Parse JSON fields
  const specs: PrebuiltPCSpecs = pc.parsedSpecs ||
    (pc.specs ? JSON.parse(pc.specs) : {});
  const features: string[] = pc.parsedFeatures ||
    (pc.features ? JSON.parse(pc.features) : []);
  const badge = getCategoryBadge(pc.category);
  const discount =
    pc.originalPrice && pc.originalPrice > pc.price
      ? Math.round(
          ((pc.originalPrice - pc.price) / pc.originalPrice) * 100
        )
      : 0;

  // Extract all images
  let parsedAdditionalImages: string[] = [];
  try {
    parsedAdditionalImages = pc.additionalImages ? JSON.parse(pc.additionalImages) : [];
  } catch {}
  const allImages = pc.image ? [pc.image, ...parsedAdditionalImages] : [];

  // Key specs to show (CPU, GPU, RAM, Storage)
  const keySpecKeys = ["cpu", "gpu", "ram", "storage"];
  const keySpecs = keySpecKeys
    .filter((k) => specs[k])
    .map((k) => ({ key: k, value: specs[k]! }));

  // ---- WhatsApp Order Link ----
  const whatsappMessage = `Hi SL HUB COMPUTER! I'm interested in the *${pc.name}* (${badge.label}) for Rs. ${pc.price.toLocaleString()}. Is this available?`;
  const whatsappLink = `https://wa.me/94710678944?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Card className="group hover:shadow-xl transition-all overflow-hidden flex flex-col">
      {/* ---- Image + Badges ---- */}
      <div className="relative group/image">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIdx]}
                alt={`${pc.name} - image ${currentImageIdx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
              />
              {/* Image Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                    {allImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentImageIdx ? "bg-white scale-125" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Cpu className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Category Badge */}
        <Badge
          className={`absolute top-3 left-3 ${badge.color} text-xs font-bold`}
        >
          {badge.label}
        </Badge>

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-xs">
            -{discount}%
          </Badge>
        )}

        {/* Featured Badge */}
        {pc.isFeatured && (
          <Badge className="absolute bottom-3 left-3 bg-yellow-500 text-black text-xs">
            ⭐ Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* ---- Name & Price ---- */}
        <div>
          <h3 className="font-bold text-base mb-1 line-clamp-2">
            {pc.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">
              Rs. {pc.price.toLocaleString()}
            </span>
            {pc.originalPrice && pc.originalPrice > pc.price && (
              <span className="text-sm text-muted-foreground line-through">
                Rs. {pc.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* ---- Key Specs ---- */}
        {keySpecs.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {keySpecs.map(({ key, value }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1.5"
              >
                {getSpecIcon(key)}
                <span className="truncate">
                  <span className="font-medium capitalize">{key}:</span>{" "}
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ---- Features List (if available) ---- */}
        {features.length > 0 && (
          <div className="space-y-1">
            {features.slice(0, expanded ? undefined : 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
            {features.length > 3 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                +{features.length - 3} more features
              </button>
            )}
          </div>
        )}

        {/* ---- Expandable Details ---- */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-blue-600 transition-colors py-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> View Full Specs
            </>
          )}
        </button>

        {expanded && (
          <>
            <Separator />
            {/* Full Specs Table */}
            {Object.keys(specs).length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(specs)
                      .filter(([, val]) => val)
                      .map(([key, value], idx) => (
                        <tr
                          key={key}
                          className={
                            idx % 2 === 0
                              ? "bg-gray-50 dark:bg-gray-800"
                              : "bg-white dark:bg-gray-900"
                          }
                        >
                          <td className="px-3 py-2 font-medium capitalize border-r w-1/3">
                            {key === "cpu"
                              ? "Processor"
                              : key === "gpu"
                              ? "Graphics"
                              : key === "ram"
                              ? "Memory"
                              : key === "psu"
                              ? "Power Supply"
                              : key === "case"
                              ? "Case"
                              : key.charAt(0).toUpperCase() + key.slice(1)}
                          </td>
                          <td className="px-3 py-2">{value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Description */}
            {pc.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pc.description}
              </p>
            )}
          </>
        )}

        <Separator />

        {/* ---- Action Buttons ---- */}
        <div className="space-y-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> Order via WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

import { PageHero } from "@/components/layout/page-hero";

// ---------------------------------------------------------------------------
// Pre-Built PCs Page Main Component
// ---------------------------------------------------------------------------
export function PrebuiltPCPage() {
  const { setCurrentView } = useStore();

  // ---- State ----
  const [pcs, setPcs] = useState<PrebuiltPCType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // ---- Fetch Pre-Built PCs ----
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") {
      params.set("category", activeCategory);
    }

    fetch(`/api/prebuilt-pcs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Parse JSON fields for each PC
          const parsedPCs = data.data.map((pc: PrebuiltPCType) => ({
            ...pc,
            parsedSpecs: pc.specs ? JSON.parse(pc.specs) : undefined,
            parsedFeatures: pc.features ? JSON.parse(pc.features) : undefined,
          }));
          setPcs(parsedPCs);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen">
      <PageHero 
        title="PRE-BUILT PCS"
        subtitle="Ready to Use, Ready to Play"
        description="Choose from our carefully assembled PC packages — tested, optimized, and ready to go. No hassle, just plug in and start!"
        gradient="from-blue-600 to-blue-700"
        icon={<Cpu className="w-12 h-12 text-white" />}
      />

      <div className="container mx-auto px-4 py-8">
      {/* ---- Category Filter Tabs ---- */}
      <div className="sticky top-20 z-30 py-6 mb-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs px-4 py-2 flex items-center gap-2 rounded-full transition-colors">
              <Check className="w-3.5 h-3.5" /> Tested & Verified
            </Badge>
            <Badge className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs px-4 py-2 flex items-center gap-2 rounded-full transition-colors">
              <Zap className="w-3.5 h-3.5" /> High Performance
            </Badge>
            <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs px-4 py-2 flex items-center gap-2 rounded-full transition-colors">
              <Shield className="w-3.5 h-3.5" /> 1-3 Year Warranty
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORY_TABS.map((tab) => (
              <Button
                key={tab.key}
                variant={activeCategory === tab.key ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveCategory(tab.key)}
                className={`
                  rounded-full px-8 py-6 font-semibold transition-all duration-500 group
                  ${activeCategory === tab.key 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 scale-105 border-0" 
                    : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-500/50"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`transition-transform duration-500 ${activeCategory === tab.key ? "scale-110" : "group-hover:scale-110"}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

        {/* ---- Loading State ---- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pcs.length === 0 ? (
          /* ---- No PCs Found ---- */
          <div className="text-center py-16">
            <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              No Pre-Built PCs Available
            </h2>
            <p className="text-muted-foreground mb-2">
              {activeCategory !== "all"
                ? `No ${activeCategory} PCs are currently available. Check back soon or try another category!`
                : "No pre-built PCs are currently available. Check back soon!"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              In the meantime, you can build your own custom PC!
            </p>
            <Button
              onClick={() => setCurrentView("pc-builder")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Wrench className="w-4 h-4 mr-2" /> Build Your Own PC
            </Button>
          </div>
        ) : (
          /* ---- PCs Grid ---- */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {pcs.map((pc) => (
                <PCCard key={pc.id} pc={pc} />
              ))}
            </div>

            {/* PC Count */}
            <p className="text-center text-sm text-muted-foreground mb-8">
              Showing {pcs.length} pre-built PC{pcs.length !== 1 ? "s" : ""}
              {activeCategory !== "all" && (
                <span>
                  {" "}
                  in{" "}
                  <span className="font-medium">
                    {CATEGORY_TABS.find((t) => t.key === activeCategory)?.label}
                  </span>
                </span>
              )}
            </p>
          </>
        )}

        {/* ---- "Can't Find What You Need? Build Your Own!" CTA ---- */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
          <CardContent className="p-8 md:p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Can&apos;t Find What You Need?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-6">
              Build your own custom PC with our PC Builder! Choose every
              component to match your exact requirements and budget. Our experts
              will assemble and test it for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setCurrentView("pc-builder")}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold"
              >
                <Wrench className="w-5 h-5 mr-2" /> Build Your Own PC
              </Button>
              <a
                href="https://wa.me/94710678944"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Discuss with
                  Experts
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
