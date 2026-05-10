// =============================================================================
// SL HUB COMPUTER - TechZone-Style Custom PC Builder
// =============================================================================
// Purpose: Professional custom PC builder with TechZone.lk-inspired UI design
// Features: Step progress indicator, breadcrumb navigation, sidebar filters,
//           product grid with sale badges, spec tables, compatibility engine,
//           wattage calculator, build save/share, dark header + green CTAs
// Design: TechZone Electro theme - dark header, green accents, pro e-commerce
// Extras: Features TechZone DOESN'T have - interactive builder, compatibility
//         warnings, wattage estimation, saved builds, visual progress
// =============================================================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Trash2,
  MessageCircle,
  RotateCcw,
  ShoppingCart,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  X,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  List,
  Heart,
  Star,
  Save,
  Share2,
  Copy,
  Download,
  Info,
  ThermometerSun,
  Bolt,
  Shield,
  Package,
  ChevronLeft,
  Home,
  Wrench,
  Filter,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductType, CartItemType, PCBuilderComponent } from "@/types";

// ---------------------------------------------------------------------------
// Component Category Definitions - TechZone Style
// Matches TechZone's PC Components section: Processors, Memory, Motherboard,
// Graphic Card, Storage, Cooler, Power Supply, Casing
// ---------------------------------------------------------------------------
const BUILDER_CATEGORIES: {
  key: string;
  label: string;
  shortLabel: string;
  required: boolean;
  description: string;
  estimatedWattage: number;
  order: number;
}[] = [
  {
    key: "cpu",
    label: "Processor (CPU)",
    shortLabel: "CPU",
    required: true,
    description: "Choose your processor - Intel Core or AMD Ryzen",
    estimatedWattage: 65,
    order: 1,
  },
  {
    key: "motherboard",
    label: "Motherboard",
    shortLabel: "MOBO",
    required: true,
    description: "Compatible motherboard for your CPU choice",
    estimatedWattage: 30,
    order: 2,
  },
  {
    key: "ram",
    label: "Memory (RAM)",
    shortLabel: "RAM",
    required: true,
    description: "DDR4 or DDR5 memory modules",
    estimatedWattage: 10,
    order: 3,
  },
  {
    key: "gpu",
    label: "Graphics Card (GPU)",
    shortLabel: "GPU",
    required: false,
    description: "Dedicated GPU for gaming or content creation",
    estimatedWattage: 200,
    order: 4,
  },
  {
    key: "storage",
    label: "Storage (SSD/HDD)",
    shortLabel: "Storage",
    required: true,
    description: "NVMe SSD, SATA SSD, or HDD storage",
    estimatedWattage: 10,
    order: 5,
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    shortLabel: "PSU",
    required: true,
    description: "Power supply based on total wattage needs",
    estimatedWattage: 0,
    order: 6,
  },
  {
    key: "case",
    label: "PC Case / Casing",
    shortLabel: "Case",
    required: true,
    description: "Choose a case that fits your components",
    estimatedWattage: 0,
    order: 7,
  },
  {
    key: "cooler",
    label: "CPU Cooler",
    shortLabel: "Cooler",
    required: false,
    description: "Air or liquid cooler for your CPU",
    estimatedWattage: 10,
    order: 8,
  },
];

// ---------------------------------------------------------------------------
// Category Icons Map - replaces problematic activeCat.icon.type pattern
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-5 h-5 text-[#333e48]" />,
  motherboard: <CircuitBoard className="w-5 h-5 text-[#333e48]" />,
  ram: <MemoryStick className="w-5 h-5 text-[#333e48]" />,
  gpu: <Monitor className="w-5 h-5 text-[#333e48]" />,
  storage: <HardDrive className="w-5 h-5 text-[#333e48]" />,
  psu: <Zap className="w-5 h-5 text-[#333e48]" />,
  case: <Box className="w-5 h-5 text-[#333e48]" />,
  cooler: <Fan className="w-5 h-5 text-[#333e48]" />,
};

const CATEGORY_ICONS_SMALL: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-4 h-4" />,
  motherboard: <CircuitBoard className="w-4 h-4" />,
  ram: <MemoryStick className="w-4 h-4" />,
  gpu: <Monitor className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
  psu: <Zap className="w-4 h-4" />,
  case: <Box className="w-4 h-4" />,
  cooler: <Fan className="w-4 h-4" />,
};

// ---------------------------------------------------------------------------
// Category-Specific Spec Filters
// ---------------------------------------------------------------------------
interface SpecFilterOption {
  label: string;
  value: string;
}

interface SpecFilterGroup {
  title: string;
  options: SpecFilterOption[];
}

const CATEGORY_SPEC_FILTERS: Record<string, SpecFilterGroup[]> = {
  cpu: [
    {
      title: "Socket Type",
      options: [
        { label: "LGA 1700", value: "lga1700" },
        { label: "AM5", value: "am5" },
        { label: "AM4", value: "am4" },
      ],
    },
    {
      title: "Cores",
      options: [
        { label: "4-Core", value: "4core" },
        { label: "6-Core", value: "6core" },
        { label: "8-Core", value: "8core" },
        { label: "12+ Core", value: "12core" },
      ],
    },
  ],
  gpu: [
    {
      title: "VRAM",
      options: [
        { label: "6GB", value: "6gb" },
        { label: "8GB", value: "8gb" },
        { label: "12GB", value: "12gb" },
        { label: "16GB+", value: "16gb" },
      ],
    },
    {
      title: "Brand Series",
      options: [
        { label: "RTX 40 Series", value: "rtx40" },
        { label: "RTX 30 Series", value: "rtx30" },
        { label: "Radeon RX 7000", value: "rx7000" },
      ],
    },
  ],
  ram: [
    {
      title: "Type",
      options: [
        { label: "DDR4", value: "ddr4" },
        { label: "DDR5", value: "ddr5" },
      ],
    },
    {
      title: "Capacity",
      options: [
        { label: "8GB", value: "8gb" },
        { label: "16GB", value: "16gb" },
        { label: "32GB", value: "32gb" },
        { label: "64GB", value: "64gb" },
      ],
    },
  ],
  motherboard: [
    {
      title: "Socket",
      options: [
        { label: "LGA 1700", value: "lga1700" },
        { label: "AM5", value: "am5" },
        { label: "AM4", value: "am4" },
      ],
    },
    {
      title: "Form Factor",
      options: [
        { label: "ATX", value: "atx" },
        { label: "Micro-ATX", value: "matx" },
        { label: "Mini-ITX", value: "itx" },
      ],
    },
  ],
  storage: [
    {
      title: "Type",
      options: [
        { label: "NVMe SSD", value: "nvme" },
        { label: "SATA SSD", value: "sata" },
        { label: "HDD", value: "hdd" },
      ],
    },
    {
      title: "Capacity",
      options: [
        { label: "250GB", value: "250gb" },
        { label: "500GB", value: "500gb" },
        { label: "1TB", value: "1tb" },
        { label: "2TB+", value: "2tb" },
      ],
    },
  ],
  psu: [
    {
      title: "Wattage",
      options: [
        { label: "500W", value: "500w" },
        { label: "650W", value: "650w" },
        { label: "750W", value: "750w" },
        { label: "850W", value: "850w" },
        { label: "1000W+", value: "1000w" },
      ],
    },
    {
      title: "Rating",
      options: [
        { label: "80+ Bronze", value: "bronze" },
        { label: "80+ Gold", value: "gold" },
        { label: "80+ Platinum", value: "platinum" },
      ],
    },
  ],
  case: [
    {
      title: "Form Factor",
      options: [
        { label: "ATX Mid Tower", value: "midtower" },
        { label: "ATX Full Tower", value: "fulltower" },
        { label: "Micro-ATX", value: "matx" },
        { label: "Mini-ITX", value: "itx" },
      ],
    },
  ],
  cooler: [
    {
      title: "Type",
      options: [
        { label: "Air Cooler", value: "air" },
        { label: "AIO 240mm", value: "aio240" },
        { label: "AIO 360mm", value: "aio360" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Wattage estimates for common CPU/GPU combos
// ---------------------------------------------------------------------------
function estimateComponentWattage(category: string, name: string): number {
  const lower = name.toLowerCase();
  if (category === "cpu") {
    if (lower.includes("i9") || lower.includes("ryzen 9") || lower.includes("7950")) return 125;
    if (lower.includes("i7") || lower.includes("ryzen 7") || lower.includes("7700")) return 105;
    if (lower.includes("i5") || lower.includes("ryzen 5") || lower.includes("7600")) return 65;
    if (lower.includes("i3") || lower.includes("ryzen 3")) return 55;
    return 65;
  }
  if (category === "gpu") {
    if (lower.includes("4090")) return 450;
    if (lower.includes("4080")) return 320;
    if (lower.includes("4070")) return 250;
    if (lower.includes("4060")) return 170;
    if (lower.includes("3090")) return 350;
    if (lower.includes("3080")) return 320;
    if (lower.includes("3070")) return 220;
    if (lower.includes("3060")) return 170;
    if (lower.includes("rx 7900")) return 315;
    if (lower.includes("rx 7800")) return 263;
    if (lower.includes("rx 7700")) return 245;
    if (lower.includes("a770")) return 225;
    if (lower.includes("a750")) return 225;
    return 200;
  }
  if (category === "motherboard") return 30;
  if (category === "ram") {
    if (lower.includes("64")) return 15;
    if (lower.includes("32")) return 10;
    return 5;
  }
  if (category === "storage") return 10;
  if (category === "cooler") return 10;
  return 0;
}

// ---------------------------------------------------------------------------
// Compatibility Engine - Advanced
// ---------------------------------------------------------------------------
interface CompatibilityResult {
  type: "error" | "warning" | "success";
  message: string;
  category1: string;
  category2?: string;
}

function getCompatibilityResults(
  components: PCBuilderComponent[]
): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];
  const byCategory = Object.fromEntries(
    components.map((c) => [c.category, c.name.toLowerCase()])
  );

  // CPU + Motherboard socket compatibility
  if (byCategory["cpu"] && byCategory["motherboard"]) {
    const cpu = byCategory["cpu"];
    const mobo = byCategory["motherboard"];
    const isIntelCPU = cpu.includes("intel") || cpu.includes("core i");
    const isAMDCPU = cpu.includes("amd") || cpu.includes("ryzen");

    // Intel chipsets
    const isIntelBoard =
      mobo.includes("intel") ||
      mobo.includes("z790") || mobo.includes("z690") ||
      mobo.includes("b760") || mobo.includes("b660") ||
      mobo.includes("h770") || mobo.includes("h610") ||
      mobo.includes("h710");
    // AMD chipsets
    const isAMDBoard =
      mobo.includes("amd") ||
      mobo.includes("x670") || mobo.includes("x570") ||
      mobo.includes("b650") || mobo.includes("b550") ||
      mobo.includes("a620") || mobo.includes("a520");

    // 12th/13th/14th gen Intel
    const isLGA1700CPU = cpu.includes("12") || cpu.includes("13") || cpu.includes("14") ||
      cpu.includes("i3-1") || cpu.includes("i5-1") || cpu.includes("i7-1") || cpu.includes("i9-1");

    // AM5/AM4
    const isAM5CPU = cpu.includes("ryzen 7") || cpu.includes("ryzen 9") ||
      cpu.includes("7700") || cpu.includes("7900") || cpu.includes("7950") ||
      cpu.includes("7600") || cpu.includes("7500");
    const isAM5Board = mobo.includes("x670") || mobo.includes("b650") || mobo.includes("a620");
    const isAM4Board = mobo.includes("x570") || mobo.includes("b550") || mobo.includes("a520");

    if (isIntelCPU && isAMDBoard) {
      results.push({
        type: "error",
        message: "Intel CPU is NOT compatible with AMD motherboard. Socket mismatch!",
        category1: "cpu",
        category2: "motherboard",
      });
    } else if (isAMDCPU && isIntelBoard) {
      results.push({
        type: "error",
        message: "AMD CPU is NOT compatible with Intel motherboard. Socket mismatch!",
        category1: "cpu",
        category2: "motherboard",
      });
    } else if (isLGA1700CPU && isAM5Board) {
      results.push({
        type: "error",
        message: "Intel 12th/13th/14th Gen uses LGA 1700 socket, not AM5!",
        category1: "cpu",
        category2: "motherboard",
      });
    } else if (isAM5CPU && isAM4Board) {
      results.push({
        type: "error",
        message: "AM5 CPU requires AM5 motherboard (X670/B650/A620), not AM4!",
        category1: "cpu",
        category2: "motherboard",
      });
    } else if (isIntelCPU && isIntelBoard) {
      results.push({
        type: "success",
        message: "Intel CPU + Intel motherboard - Socket compatible!",
        category1: "cpu",
        category2: "motherboard",
      });
    } else if (isAMDCPU && (isAMDBoard || isAM5Board || isAM4Board)) {
      results.push({
        type: "success",
        message: "AMD CPU + AMD motherboard - Socket compatible!",
        category1: "cpu",
        category2: "motherboard",
      });
    }
  }

  // RAM + Motherboard DDR compatibility
  if (byCategory["ram"] && byCategory["motherboard"]) {
    const ram = byCategory["ram"];
    const mobo = byCategory["motherboard"];
    const isDDR5 = ram.includes("ddr5");
    const isDDR4 = ram.includes("ddr4");
    const boardDDR5 = mobo.includes("ddr5");
    const boardDDR4 = mobo.includes("ddr4");

    if (isDDR5 && boardDDR4 && !boardDDR5) {
      results.push({
        type: "error",
        message: "DDR5 RAM selected but motherboard only supports DDR4!",
        category1: "ram",
        category2: "motherboard",
      });
    } else if (isDDR4 && boardDDR5 && !boardDDR4) {
      results.push({
        type: "error",
        message: "DDR4 RAM selected but motherboard only supports DDR5!",
        category1: "ram",
        category2: "motherboard",
      });
    } else if ((isDDR5 && boardDDR5) || (isDDR4 && boardDDR4)) {
      results.push({
        type: "success",
        message: `${isDDR5 ? "DDR5" : "DDR4"} RAM + Motherboard - Memory compatible!`,
        category1: "ram",
        category2: "motherboard",
      });
    }
  }

  // PSU wattage check
  if (byCategory["psu"]) {
    const psu = byCategory["psu"];
    const wattMatch = psu.match(/(\d+)\s*w/i);
    const psuWattage = wattMatch ? parseInt(wattMatch[1]) : 0;
    if (psuWattage > 0) {
      const totalWatt = components
        .filter((c) => c.category !== "psu")
        .reduce((sum, c) => sum + estimateComponentWattage(c.category, c.name), 0);
      const recommended = Math.round(totalWatt * 1.3); // 30% headroom

      if (psuWattage < totalWatt) {
        results.push({
          type: "error",
          message: `PSU (${psuWattage}W) is below estimated draw (${totalWatt}W). Upgrade recommended!`,
          category1: "psu",
        });
      } else if (psuWattage < recommended) {
        results.push({
          type: "warning",
          message: `PSU (${psuWattage}W) is close to estimated draw. ${recommended}W recommended for headroom.`,
          category1: "psu",
        });
      } else {
        results.push({
          type: "success",
          message: `PSU (${psuWattage}W) provides adequate power with good headroom.`,
          category1: "psu",
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Check if a product is compatible with current build components
// ---------------------------------------------------------------------------
function isProductCompatibleWithBuild(
  product: ProductType,
  category: string,
  components: PCBuilderComponent[]
): boolean {
  if (components.length === 0) return true;

  const productName = product.name.toLowerCase();
  const byCategory = Object.fromEntries(
    components.map((c) => [c.category, c.name.toLowerCase()])
  );

  // If selecting a motherboard, check against CPU
  if (category === "motherboard" && byCategory["cpu"]) {
    const cpu = byCategory["cpu"];
    const isIntelCPU = cpu.includes("intel") || cpu.includes("core i");
    const isAMDCPU = cpu.includes("amd") || cpu.includes("ryzen");

    const isIntelBoard =
      productName.includes("intel") ||
      productName.includes("z790") || productName.includes("z690") ||
      productName.includes("b760") || productName.includes("b660") ||
      productName.includes("h770") || productName.includes("h610") ||
      productName.includes("h710");
    const isAMDBoard =
      productName.includes("amd") ||
      productName.includes("x670") || productName.includes("x570") ||
      productName.includes("b650") || productName.includes("b550") ||
      productName.includes("a620") || productName.includes("a520");

    if (isIntelCPU && isAMDBoard) return false;
    if (isAMDCPU && isIntelBoard) return false;
  }

  // If selecting RAM, check against motherboard
  if (category === "ram" && byCategory["motherboard"]) {
    const mobo = byCategory["motherboard"];
    const isDDR5RAM = productName.includes("ddr5");
    const isDDR4RAM = productName.includes("ddr4");
    const boardDDR5 = mobo.includes("ddr5");
    const boardDDR4 = mobo.includes("ddr4");

    if (isDDR5RAM && boardDDR4 && !boardDDR5) return false;
    if (isDDR4RAM && boardDDR5 && !boardDDR4) return false;
  }

  // If selecting a CPU, check against motherboard
  if (category === "cpu" && byCategory["motherboard"]) {
    const mobo = byCategory["motherboard"];
    const isIntelCPU = productName.includes("intel") || productName.includes("core i");
    const isAMDCPU = productName.includes("amd") || productName.includes("ryzen");

    const isIntelBoard =
      mobo.includes("intel") ||
      mobo.includes("z790") || mobo.includes("z690") ||
      mobo.includes("b760") || mobo.includes("b660") ||
      mobo.includes("h770") || mobo.includes("h610") ||
      mobo.includes("h710");
    const isAMDBoard =
      mobo.includes("amd") ||
      mobo.includes("x670") || mobo.includes("x570") ||
      mobo.includes("b650") || mobo.includes("b550") ||
      mobo.includes("a620") || mobo.includes("a520");

    if (isIntelCPU && isAMDBoard) return false;
    if (isAMDCPU && isIntelBoard) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Match spec filter value against product specs
// ---------------------------------------------------------------------------
function productMatchesSpecFilter(
  product: ProductType,
  category: string,
  selectedSpecs: Record<string, string[]>
): boolean {
  const specFilters = CATEGORY_SPEC_FILTERS[category];
  if (!specFilters) return true;

  const activeGroups = Object.keys(selectedSpecs).filter(
    (k) => selectedSpecs[k].length > 0
  );
  if (activeGroups.length === 0) return true;

  const specs: Record<string, string> = JSON.parse(product.specs || "{}");
  const productName = product.name.toLowerCase();
  const allSpecValues = Object.values(specs).join(" ").toLowerCase();

  for (const groupTitle of activeGroups) {
    const selectedValues = selectedSpecs[groupTitle];
    if (selectedValues.length === 0) continue;

    const matchesAnyInGroup = selectedValues.some((val) => {
      // Check product name and specs for the filter value
      return (
        productName.includes(val.replace(/gb|w|core|tower/gi, "")) ||
        allSpecValues.includes(val.replace(/gb|w|core|tower/gi, ""))
      );
    });

    if (!matchesAnyInGroup) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Sort options - TechZone style
// ---------------------------------------------------------------------------
type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "newest";
type ViewMode = "grid" | "list";

// ---------------------------------------------------------------------------
// PC Builder Main Component - TechZone Style
// ---------------------------------------------------------------------------
export function Builder() {
  const {
    pcBuilderComponents,
    setPCBuilderComponent,
    removePCBuilderComponent,
    clearPCBuilder,
    getPCBuilderTotal,
    addToCart,
    setCurrentView,
  } = useStore();

  // ---- Local State ----
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("cpu");
  const [categoryProducts, setCategoryProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<{ name: string; components: PCBuilderComponent[]; date: string }[]>([]);

  // ---- Sidebar Filter State ----
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [isNewOnly, setIsNewOnly] = useState(false);

  // ---- New Filter State ----
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [compatibleOnly, setCompatibleOnly] = useState(false);

  // ---- Extract unique brands from current category products ----
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    categoryProducts.forEach((p) => {
      if (p.brand?.name) {
        brandMap.set(p.brand.name, (brandMap.get(p.brand.name) || 0) + 1);
      }
    });
    return Array.from(brandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [categoryProducts]);

  // ---- Price range from products ----
  const productPriceRange = useMemo(() => {
    if (categoryProducts.length === 0) return { min: 0, max: 1000000 };
    const prices = categoryProducts.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 1000) * 1000,
      max: Math.ceil(Math.max(...prices) / 1000) * 1000,
    };
  }, [categoryProducts]);

  // ---- Price Tier Breakdown ----
  const priceTierBreakdown = useMemo(() => {
    const tiers = [
      { label: "Budget", min: 0, max: 30000, color: "bg-green-400" },
      { label: "Mid-Range", min: 30000, max: 80000, color: "bg-blue-400" },
      { label: "High-End", min: 80000, max: 200000, color: "bg-orange-400" },
      { label: "Premium", min: 200000, max: Infinity, color: "bg-purple-400" },
    ];
    const maxCount = Math.max(
      ...tiers.map((t) => categoryProducts.filter((p) => p.price >= t.min && p.price < t.max).length),
      1
    );
    return tiers.map((t) => ({
      ...t,
      count: categoryProducts.filter((p) => p.price >= t.min && p.price < t.max).length,
      width: Math.round(
        (categoryProducts.filter((p) => p.price >= t.min && p.price < t.max).length / maxCount) * 100
      ),
    }));
  }, [categoryProducts]);

  // Reset filters when category changes
  useEffect(() => {
    setSelectedBrands([]);
    setPriceRange([0, 1000000]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setIsNewOnly(false);
    setSearchQuery("");
    setSortOption("default");
    setSelectedSpecs({});
    setWarrantyOnly(false);
    setMinRating(0);
    setCompatibleOnly(false);
  }, [activeCategory]);

  // Reset price range when products load
  useEffect(() => {
    if (categoryProducts.length > 0) {
      setPriceRange([productPriceRange.min, productPriceRange.max]);
    }
  }, [productPriceRange.min, productPriceRange.max, categoryProducts.length]);

  // Load saved builds from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("slhub-saved-builds");
      if (saved) setSavedBuilds(JSON.parse(saved));
    } catch {}
  }, []);

  // ---- Fetch categories on mount ----
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ---- Find category ID by slug/keyword ----
  const findCategoryId = useCallback(
    (key: string): string | null => {
      const slugMap: Record<string, string[]> = {
        cpu: ["cpu", "processor"],
        motherboard: ["motherboard", "mainboard"],
        ram: ["ram", "memory"],
        gpu: ["gpu", "graphics", "vga"],
        storage: ["storage", "ssd", "hdd", "hard-drive"],
        psu: ["psu", "power-supply", "power"],
        case: ["case", "casing", "chassis"],
        cooler: ["cooler", "cooling", "fan"],
      };
      const keywords = slugMap[key] || [key];
      const found = categories.find((cat) =>
        keywords.some(
          (kw) =>
            cat.slug.toLowerCase().includes(kw) ||
            cat.name.toLowerCase().includes(kw)
        )
      );
      return found?.id || null;
    },
    [categories]
  );

  // ---- Fetch products when active category changes ----
  useEffect(() => {
    if (!activeCategory || categoriesLoading) return;
    const categoryId = findCategoryId(activeCategory);
    if (!categoryId) {
      setCategoryProducts([]);
      return;
    }

    setProductsLoading(true);
    fetch(`/api/products?categoryId=${categoryId}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategoryProducts(data.data);
        }
      })
      .catch(() => toast.error("Failed to load components"))
      .finally(() => setProductsLoading(false));
  }, [activeCategory, categoriesLoading, findCategoryId]);

  // ---- Active filter count ----
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBrands.length > 0) count++;
    if (priceRange[0] > productPriceRange.min || priceRange[1] < productPriceRange.max) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (isNewOnly) count++;
    if (Object.values(selectedSpecs).some((v) => v.length > 0)) count++;
    if (warrantyOnly) count++;
    if (minRating > 0) count++;
    if (compatibleOnly) count++;
    return count;
  }, [selectedBrands, priceRange, productPriceRange, inStockOnly, onSaleOnly, isNewOnly, selectedSpecs, warrantyOnly, minRating, compatibleOnly]);

  // ---- Reset all filters ----
  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange([productPriceRange.min, productPriceRange.max]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setIsNewOnly(false);
    setSelectedSpecs({});
    setWarrantyOnly(false);
    setMinRating(0);
    setCompatibleOnly(false);
  };

  // ---- Toggle brand selection ----
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  // ---- Toggle spec filter ----
  const toggleSpecFilter = (groupTitle: string, value: string) => {
    setSelectedSpecs((prev) => {
      const current = prev[groupTitle] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupTitle]: updated };
    });
  };

  // ---- Filtered & sorted products ----
  const filteredProducts = useMemo(() => {
    let products = [...categoryProducts];

    // Brand filter
    if (selectedBrands.length > 0) {
      products = products.filter((p) =>
        p.brand?.name && selectedBrands.includes(p.brand.name)
      );
    }

    // Price range filter
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // In-stock filter
    if (inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

    // On-sale filter
    if (onSaleOnly) {
      products = products.filter(
        (p) => p.isOnSale || (p.originalPrice && p.originalPrice > p.price)
      );
    }

    // New arrivals filter
    if (isNewOnly) {
      products = products.filter((p) => p.isNew);
    }

    // Spec filter
    if (Object.values(selectedSpecs).some((v) => v.length > 0)) {
      products = products.filter((p) =>
        productMatchesSpecFilter(p, activeCategory, selectedSpecs)
      );
    }

    // Warranty filter
    if (warrantyOnly) {
      products = products.filter((p) => {
        const specs: Record<string, string> = JSON.parse(p.specs || "{}");
        const hasWarranty = Object.keys(specs).some(
          (k) => k.toLowerCase().includes("warranty") || k.toLowerCase().includes("guarantee")
        );
        const nameHasWarranty = p.name.toLowerCase().includes("warranty");
        return hasWarranty || nameHasWarranty;
      });
    }

    // Rating filter
    if (minRating > 0) {
      products = products.filter((p) => {
        const rating = (p as ProductType & { rating?: number }).rating || 0;
        return rating >= minRating;
      });
    }

    // Compatible with build filter
    if (compatibleOnly) {
      products = products.filter((p) =>
        isProductCompatibleWithBuild(p, activeCategory, pcBuilderComponents)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.name?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortOption) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return products;
  }, [categoryProducts, searchQuery, sortOption, selectedBrands, priceRange, inStockOnly, onSaleOnly, isNewOnly, selectedSpecs, warrantyOnly, minRating, compatibleOnly, activeCategory, pcBuilderComponents]);

  // ---- Handle selecting a product ----
  const handleSelectComponent = (key: string, product: ProductType) => {
    const images: string[] = JSON.parse(product.images || "[]");
    const component: PCBuilderComponent = {
      category: key,
      categoryId: findCategoryId(key) || "",
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || "",
    };
    setPCBuilderComponent(component);
    toast.success(`${product.name} selected as ${key.toUpperCase()}`, {
      description: "Component added to your build",
    });
  };

  // ---- Compatibility results ----
  const compatibilityResults = useMemo(
    () => getCompatibilityResults(pcBuilderComponents),
    [pcBuilderComponents]
  );
  const errors = compatibilityResults.filter((r) => r.type === "error");
  const warnings = compatibilityResults.filter((r) => r.type === "warning");
  const successes = compatibilityResults.filter((r) => r.type === "success");

  // ---- Wattage calculation ----
  const totalEstimatedWattage = useMemo(() => {
    return pcBuilderComponents.reduce(
      (sum, c) => sum + estimateComponentWattage(c.category, c.name),
      0
    );
  }, [pcBuilderComponents]);
  const recommendedPSU = Math.round(totalEstimatedWattage * 1.3);

  // ---- Build progress ----
  const selectedCount = pcBuilderComponents.length;
  const requiredKeys = BUILDER_CATEGORIES.filter((c) => c.required).map(
    (c) => c.key
  );
  const allRequiredSelected = requiredKeys.every((key) =>
    pcBuilderComponents.some((c) => c.category === key)
  );
  const progressPercent = Math.round(
    (selectedCount / BUILDER_CATEGORIES.length) * 100
  );

  const totalPrice = getPCBuilderTotal();

  // ---- Share build via WhatsApp ----
  const handleShareWhatsApp = () => {
    const lines = pcBuilderComponents.map(
      (c) =>
        `*${c.category.toUpperCase()}:* ${c.name} - Rs. ${c.price.toLocaleString()}`
    );
    const totalLine = `\n*Total: Rs. ${totalPrice.toLocaleString()}*`;
    const wattLine = `\n*Estimated Wattage: ~${totalEstimatedWattage}W (Recommended PSU: ${recommendedPSU}W)*`;
    const message = `Hi SL HUB COMPUTER! I'd like to order a custom PC build:\n\n${lines.join(
      "\n"
    )}${totalLine}${wattLine}\n\nCan you help me with this build?`;
    window.open(
      `https://wa.me/94710678944?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ---- Add all to cart ----
  const handleAddAllToCart = () => {
    pcBuilderComponents.forEach((comp) => {
      const cartItem: CartItemType = {
        productId: comp.productId,
        name: comp.name,
        price: comp.price,
        originalPrice: null,
        image: comp.image,
        quantity: 1,
        slug: "",
        stock: 99,
      };
      addToCart(cartItem);
    });
    toast.success("All components added to cart!", {
      description: `${selectedCount} items added`,
    });
    setCurrentView("cart");
  };

  // ---- Save build ----
  const handleSaveBuild = () => {
    const name = `Build ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const newBuild = {
      name,
      components: [...pcBuilderComponents],
      date: new Date().toISOString(),
    };
    const updated = [newBuild, ...savedBuilds].slice(0, 5); // Max 5 saved builds
    setSavedBuilds(updated);
    localStorage.setItem("slhub-saved-builds", JSON.stringify(updated));
    toast.success("Build saved!", {
      description: "You can load it later from saved builds",
    });
  };

  // ---- Copy build to clipboard ----
  const handleCopyBuild = () => {
    const text = pcBuilderComponents
      .map((c) => `${c.category.toUpperCase()}: ${c.name} - Rs. ${c.price.toLocaleString()}`)
      .join("\n");
    const fullText = `${text}\n\nTotal: Rs. ${totalPrice.toLocaleString()}\nEst. Wattage: ~${totalEstimatedWattage}W`;
    navigator.clipboard.writeText(fullText);
    toast.success("Build copied to clipboard!");
  };

  // ---- Load saved build ----
  const handleLoadBuild = (components: PCBuilderComponent[]) => {
    clearPCBuilder();
    components.forEach((c) => setPCBuilderComponent(c));
    toast.success("Build loaded!", {
      description: `${components.length} components restored`,
    });
  };

  // ---- Get selected component for a category ----
  const getSelected = (key: string) =>
    pcBuilderComponents.find((c) => c.category === key);

  // ---- Get active category info ----
  const activeCat = BUILDER_CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="min-h-screen">
      {/* =================================================================== */}
      {/* Hero Section - Dark Emerald/Green Gradient */}
      {/* =================================================================== */}
      <section className="bg-gradient-to-br from-[#1a3a2a] via-[#0f2b1e] to-[#0a1f15] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Custom PC Builder</h1>
          <p className="text-xl md:text-2xl text-green-200 mb-2">Build Your Dream PC, Your Way</p>
          <p className="text-green-300/80 max-w-2xl mx-auto mb-8">
            Select each component yourself — from CPU to case — and we&apos;ll assemble, test, and deliver your perfect custom build. Compatible parts guaranteed with our smart builder.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-3 py-1">
              ✓ Compatibility Check
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-3 py-1">
              ⚡ Wattage Calculator
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-3 py-1">
              🛡️ Expert Assembly
            </Badge>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TechZone-Style Page Header with Breadcrumb */}
      {/* =================================================================== */}
      <div className="bg-[#333e48] text-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <button
              onClick={() => setCurrentView("home")}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">PC Components</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#38d853] font-medium">Custom PC Builder</span>
          </div>
        </div>

        {/* Page Title Banner */}
        <div className="container mx-auto px-4 pb-5 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#38d853] rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-[#333e48]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Custom PC Builder
                </h1>
                <p className="text-sm text-gray-300">
                  Build your dream PC - Select components step by step
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedBuilds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-300 hover:text-white hover:border-white"
                  onClick={() => {
                    if (savedBuilds.length > 0) {
                      handleLoadBuild(savedBuilds[0].components);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" /> Load Saved
                </Button>
              )}
              <Button
                size="sm"
                className="bg-[#38d853] hover:bg-[#2bbf44] text-[#333e48] font-bold"
                onClick={handleSaveBuild}
                disabled={pcBuilderComponents.length === 0}
              >
                <Save className="w-4 h-4 mr-1" /> Save Build
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* Progress Bar - Step Indicator */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {BUILDER_CATEGORIES.map((cat, index) => {
              const selected = getSelected(cat.key);
              const isActive = activeCategory === cat.key;
              const hasError = errors.some(
                (e) => e.category1 === cat.key || e.category2 === cat.key
              );
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#333e48] text-white shadow-md"
                      : selected
                      ? hasError
                        ? "bg-red-50 dark:bg-red-950 text-red-600 border border-red-200"
                        : "bg-green-50 dark:bg-green-950 text-green-600 border border-green-200"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {/* Step number */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selected
                        ? hasError
                          ? "bg-red-500 text-white"
                          : "bg-[#38d853] text-[#333e48]"
                        : isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {selected ? (
                      hasError ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{cat.shortLabel}</span>
                  {cat.required && !selected && (
                    <span className="text-red-400 text-xs">*</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38d853] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {selectedCount}/{BUILDER_CATEGORIES.length} ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* Main Content Area */}
      {/* =================================================================== */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================================= */}
          {/* Left: Filter Sidebar + Component Selection Panel */}
          {/* ============================================================= */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-[#38d853] text-[#333e48] text-[10px] h-5 w-5 p-0 flex items-center justify-center border-0">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showMobileFilter ? "rotate-180" : ""}`} />
              </Button>
            </div>

            <div className="flex gap-4">
              {/* ---- Filter Sidebar (Desktop) ---- */}
              <aside className={`
                lg:block
                ${showMobileFilter ? "block" : "hidden"}
                w-full lg:w-60 shrink-0
              `}>
                <div className="sticky top-24 space-y-3">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#333e48] dark:text-gray-300" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="bg-[#38d853] text-[#333e48] text-[9px] h-5 border-0">
                          {activeFilterCount} active
                        </Badge>
                      )}
                    </h3>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Brand Filter */}
                  {availableBrands.length > 0 && (
                    <Card className="border shadow-sm">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-gray-500">
                          Brands
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                          {availableBrands.map(({ name, count }) => (
                            <label
                              key={name}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(name)}
                                onChange={() => toggleBrand(name)}
                                className="rounded border-gray-300 text-[#38d853] focus:ring-[#38d853] w-3.5 h-3.5"
                              />
                              <span className="text-xs group-hover:text-[#333e48] dark:group-hover:text-white transition-colors flex-1">
                                {name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({count})
                              </span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Price Range Filter */}
                  <Card className="border shadow-sm">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-gray-500">
                        Price Range
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-gray-400">Min (Rs.)</label>
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([
                                Math.max(0, parseInt(e.target.value) || 0),
                                priceRange[1],
                              ])
                            }
                            className="h-7 text-xs"
                            min={0}
                          />
                        </div>
                        <span className="text-gray-400 mt-3">—</span>
                        <div className="flex-1">
                          <label className="text-[9px] text-gray-400">Max (Rs.)</label>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                parseInt(e.target.value) || 1000000,
                              ])
                            }
                            className="h-7 text-xs"
                            min={0}
                          />
                        </div>
                      </div>
                      {/* Price range slider */}
                      <input
                        type="range"
                        min={productPriceRange.min}
                        max={productPriceRange.max}
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], parseInt(e.target.value)])
                        }
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#38d853]"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Rs. {productPriceRange.min.toLocaleString()}</span>
                        <span>Rs. {productPriceRange.max.toLocaleString()}</span>
                      </div>

                      {/* Price Tier Breakdown */}
                      {categoryProducts.length > 0 && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase">Price Tiers</p>
                          {priceTierBreakdown.map((tier) => (
                            <div key={tier.label} className="flex items-center gap-2">
                              <span className="text-[9px] text-gray-500 w-16 shrink-0">{tier.label}</span>
                              <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${tier.color} rounded-full transition-all duration-300`}
                                  style={{ width: `${Math.max(tier.width, tier.count > 0 ? 8 : 0)}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-gray-400 w-6 text-right">{tier.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Category-Specific Spec Filter */}
                  {CATEGORY_SPEC_FILTERS[activeCategory] && (
                    <Card className="border shadow-sm">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1.5">
                          {CATEGORY_ICONS[activeCategory] && (
                            <span className="scale-75 inline-flex">{CATEGORY_ICONS[activeCategory]}</span>
                          )}
                          {activeCat?.shortLabel || activeCategory} Specs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-3">
                        {CATEGORY_SPEC_FILTERS[activeCategory].map((group) => (
                          <div key={group.title}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.options.map((opt) => (
                                <label
                                  key={opt.value}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(selectedSpecs[group.title] || []).includes(opt.value)}
                                    onChange={() => toggleSpecFilter(group.title, opt.value)}
                                    className="rounded border-gray-300 text-[#38d853] focus:ring-[#38d853] w-3.5 h-3.5"
                                  />
                                  <span className="text-xs group-hover:text-[#333e48] dark:group-hover:text-white transition-colors">
                                    {opt.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Toggle Filters */}
                  <Card className="border shadow-sm">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-gray-500">
                        Quick Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {/* In Stock */}
                      <button
                        onClick={() => setInStockOnly(!inStockOnly)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-xs font-medium">In Stock Only</span>
                        {inStockOnly ? (
                          <ToggleRight className="w-5 h-5 text-[#38d853]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      {/* On Sale */}
                      <button
                        onClick={() => setOnSaleOnly(!onSaleOnly)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-xs font-medium">On Sale</span>
                        {onSaleOnly ? (
                          <ToggleRight className="w-5 h-5 text-[#38d853]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      {/* New Arrivals */}
                      <button
                        onClick={() => setIsNewOnly(!isNewOnly)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-xs font-medium">New Arrivals</span>
                        {isNewOnly ? (
                          <ToggleRight className="w-5 h-5 text-[#38d853]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      {/* Warranty Only */}
                      <button
                        onClick={() => setWarrantyOnly(!warrantyOnly)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          With Warranty Only
                        </span>
                        {warrantyOnly ? (
                          <ToggleRight className="w-5 h-5 text-[#38d853]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      {/* Compatible With Build */}
                      {pcBuilderComponents.length > 0 && (
                        <button
                          onClick={() => setCompatibleOnly(!compatibleOnly)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Only Compatible Parts
                          </span>
                          {compatibleOnly ? (
                            <ToggleRight className="w-5 h-5 text-[#38d853]" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Rating Filter */}
                  <Card className="border shadow-sm">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-gray-500">
                        Minimum Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                            className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                              minRating === rating
                                ? "bg-[#38d853]/10 border border-[#38d853]/30"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500">& up</span>
                            {minRating === rating && (
                              <X className="w-3 h-3 text-gray-400 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Filters Summary */}
                  {activeFilterCount > 0 && (
                    <div className="bg-[#38d853]/10 border border-[#38d853]/20 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-[#333e48] dark:text-[#38d853] mb-2">
                        Active Filters ({activeFilterCount})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBrands.map((brand) => (
                          <span
                            key={brand}
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border"
                          >
                            {brand}
                            <X
                              className="w-2.5 h-2.5 cursor-pointer hover:text-red-500"
                              onClick={() => toggleBrand(brand)}
                            />
                          </span>
                        ))}
                        {(priceRange[0] > productPriceRange.min ||
                          priceRange[1] < productPriceRange.max) && (
                          <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border">
                            Rs. {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                            <X
                              className="w-2.5 h-2.5 cursor-pointer hover:text-red-500"
                              onClick={() =>
                                setPriceRange([
                                  productPriceRange.min,
                                  productPriceRange.max,
                                ])
                              }
                            />
                          </span>
                        )}
                        {inStockOnly && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setInStockOnly(false)}
                          >
                            In Stock <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {onSaleOnly && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setOnSaleOnly(false)}
                          >
                            On Sale <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {isNewOnly && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setIsNewOnly(false)}
                          >
                            New <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {Object.entries(selectedSpecs).map(([group, values]) =>
                          values.map((val) => (
                            <span
                              key={`${group}-${val}`}
                              className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                              onClick={() => toggleSpecFilter(group, val)}
                            >
                              {val} <X className="w-2.5 h-2.5" />
                            </span>
                          ))
                        )}
                        {warrantyOnly && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setWarrantyOnly(false)}
                          >
                            Warranty <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {minRating > 0 && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setMinRating(0)}
                          >
                            {minRating}★+ <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {compatibleOnly && (
                          <span
                            className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer"
                            onClick={() => setCompatibleOnly(false)}
                          >
                            Compatible <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* ---- Products Area ---- */}
              <div className="flex-1 min-w-0">
            {/* Active Category Header */}
            {activeCat && (() => {
              const selected = getSelected(activeCat.key);

              return (
                <Card className="overflow-hidden border-0 shadow-md">
                  {/* Category Header - TechZone dark header style */}
                  <div className="bg-[#333e48] text-white px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38d853] rounded-lg flex items-center justify-center">
                          {CATEGORY_ICONS[activeCategory]}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">
                            {activeCat.label}
                          </h2>
                          <p className="text-sm text-gray-300">
                            {activeCat.description}
                          </p>
                        </div>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#38d853] text-[#333e48] font-bold border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected component display */}
                  {selected && (
                    <div className="bg-green-50 dark:bg-green-950/50 border-b border-green-200 dark:border-green-800 px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selected.image ? (
                            <img
                              src={selected.image}
                              alt={selected.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                              Currently Selected
                            </p>
                            <p className="text-sm font-bold">{selected.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#38d853]">
                            Rs. {selected.price.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removePCBuilderComponent(activeCat.key)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search & Sort Bar - TechZone shop controls style */}
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b flex flex-wrap items-center gap-3">
                    {/* Desktop filter toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden lg:flex items-center gap-1 h-9"
                      onClick={() => {}}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      {activeFilterCount > 0 && (
                        <Badge className="bg-[#38d853] text-[#333e48] text-[9px] h-4 w-4 p-0 flex items-center justify-center border-0">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeCat.shortLabel}...`}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortOption}
                        onChange={(e) =>
                          setSortOption(e.target.value as SortOption)
                        }
                        className="h-9 px-3 text-sm border rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="newest">Newest First</option>
                      </select>
                      <div className="flex border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 ${
                            viewMode === "grid"
                              ? "bg-[#333e48] text-white"
                              : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 ${
                            viewMode === "list"
                              ? "bg-[#333e48] text-white"
                              : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {filteredProducts.length} products
                    </span>
                  </div>

                  {/* Products Grid/List */}
                  <CardContent className="p-4">
                    {productsLoading ? (
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
                            : "space-y-2"
                        }
                      >
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className={
                              viewMode === "grid"
                                ? "h-44 rounded-xl"
                                : "h-16 rounded-lg"
                            }
                          />
                        ))}
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No products found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchQuery
                            ? "Try a different search term"
                            : "Please add products in the admin panel for this category"}
                        </p>
                      </div>
                    ) : viewMode === "grid" ? (
                      /* ---- Grid View - TechZone product card style ---- */
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredProducts.map((product) => {
                          const images: string[] = JSON.parse(
                            product.images || "[]"
                          );
                          const isSelected =
                            getSelected(activeCategory)?.productId ===
                            product.id;
                          const discount =
                            product.originalPrice &&
                            product.originalPrice > product.price
                              ? Math.round(
                                  ((product.originalPrice - product.price) /
                                    product.originalPrice) *
                                    100
                                )
                              : 0;
                          const specs: Record<string, string> = JSON.parse(
                            product.specs || "{}"
                          );

                          return (
                            <button
                              key={product.id}
                              onClick={() =>
                                handleSelectComponent(activeCategory, product)
                              }
                              className={`group text-left rounded-xl border-2 transition-all overflow-hidden ${
                                isSelected
                                  ? "border-[#38d853] bg-green-50 dark:bg-green-950/30 shadow-md ring-1 ring-[#38d853]/30"
                                  : "border-gray-200 dark:border-gray-700 hover:border-[#38d853]/50 hover:shadow-md"
                              }`}
                            >
                              {/* Image */}
                              <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-10 h-10 text-gray-300" />
                                  </div>
                                )}
                                {/* Badges */}
                                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                                  {isSelected && (
                                    <span className="bg-[#38d853] text-[#333e48] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      SELECTED
                                    </span>
                                  )}
                                  {discount > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      -{discount}%
                                    </span>
                                  )}
                                  {product.isNew && (
                                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      NEW
                                    </span>
                                  )}
                                  {product.stock === 0 && (
                                    <span className="bg-gray-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      SOLD OUT
                                    </span>
                                  )}
                                  {compatibleOnly && pcBuilderComponents.length > 0 && (
                                    <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      ✓ FIT
                                    </span>
                                  )}
                                </div>
                                {/* Quick select overlay */}
                                {!isSelected && product.stock > 0 && (
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-[#38d853] text-[#333e48] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                      + SELECT
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="p-2.5">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">
                                  {product.brand?.name || ""}
                                </p>
                                <h3 className="text-xs font-semibold line-clamp-2 mb-1.5 leading-tight">
                                  {product.name}
                                </h3>
                                {/* Mini specs */}
                                {Object.keys(specs).length > 0 && (
                                  <div className="text-[9px] text-gray-400 mb-1.5 line-clamp-1">
                                    {Object.entries(specs)
                                      .slice(0, 2)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(" | ")}
                                  </div>
                                )}
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm font-bold text-[#38d853]">
                                    Rs. {product.price.toLocaleString()}
                                  </span>
                                  {product.originalPrice &&
                                    product.originalPrice > product.price && (
                                      <span className="text-[10px] text-gray-400 line-through">
                                        Rs.{" "}
                                        {product.originalPrice.toLocaleString()}
                                      </span>
                                    )}
                                </div>
                                {product.stock <= 3 && product.stock > 0 && (
                                  <p className="text-[9px] text-orange-500 font-medium mt-1">
                                    Only {product.stock} left in stock!
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* ---- List View - TechZone product list style ---- */
                      <div className="space-y-2">
                        {filteredProducts.map((product) => {
                          const images: string[] = JSON.parse(
                            product.images || "[]"
                          );
                          const isSelected =
                            getSelected(activeCategory)?.productId ===
                            product.id;
                          const discount =
                            product.originalPrice &&
                            product.originalPrice > product.price
                              ? Math.round(
                                  ((product.originalPrice - product.price) /
                                    product.originalPrice) *
                                    100
                                )
                              : 0;
                          const specs: Record<string, string> = JSON.parse(
                            product.specs || "{}"
                          );

                          return (
                            <button
                              key={product.id}
                              onClick={() =>
                                handleSelectComponent(activeCategory, product)
                              }
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? "border-[#38d853] bg-green-50 dark:bg-green-950/30"
                                  : "border-gray-200 dark:border-gray-700 hover:border-[#38d853]/50"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                                {discount > 0 && (
                                  <span className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-br">
                                    -{discount}%
                                  </span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] text-gray-400 font-medium uppercase">
                                    {product.brand?.name || ""}
                                  </span>
                                  {isSelected && (
                                    <Badge className="bg-[#38d853] text-[#333e48] text-[9px] h-4 px-1.5 border-0">
                                      SELECTED
                                    </Badge>
                                  )}
                                  {product.isNew && (
                                    <Badge className="bg-blue-600 text-[9px] h-4 px-1.5">
                                      NEW
                                    </Badge>
                                  )}
                                  {compatibleOnly && pcBuilderComponents.length > 0 && (
                                    <Badge className="bg-green-600 text-white text-[9px] h-4 px-1.5 border-0">
                                      ✓ FIT
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-sm font-semibold truncate">
                                  {product.name}
                                </h3>
                                {Object.keys(specs).length > 0 && (
                                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                    {Object.entries(specs)
                                      .slice(0, 3)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(" | ")}
                                  </div>
                                )}
                              </div>

                              {/* Price & Action */}
                              <div className="shrink-0 text-right">
                                <div className="flex items-baseline gap-1.5 justify-end">
                                  <span className="text-base font-bold text-[#38d853]">
                                    Rs. {product.price.toLocaleString()}
                                  </span>
                                  {product.originalPrice &&
                                    product.originalPrice > product.price && (
                                      <span className="text-xs text-gray-400 line-through">
                                        Rs.{" "}
                                        {product.originalPrice.toLocaleString()}
                                      </span>
                                    )}
                                </div>
                                {!isSelected && product.stock > 0 && (
                                  <span className="text-[10px] text-[#38d853] font-medium mt-1 inline-block">
                                    + Click to Select
                                  </span>
                                )}
                                {product.stock <= 3 && product.stock > 0 && (
                                  <p className="text-[10px] text-orange-500 font-medium">
                                    Only {product.stock} left!
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* ============================================================= */}
            {/* Compatibility & Wattage Section - TechZone doesn't have this! */}
            {/* ============================================================= */}
            {pcBuilderComponents.length > 0 && (
              <Card className="border-0 shadow-md overflow-hidden">
                <div
                  className="bg-[#333e48] text-white px-5 py-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowCompatibility(!showCompatibility)}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#38d853]" />
                    <span className="font-semibold text-sm">
                      Compatibility & Wattage Check
                    </span>
                    {errors.length > 0 && (
                      <Badge className="bg-red-500 text-white text-[9px] h-5 border-0">
                        {errors.length} Issue{errors.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {errors.length === 0 && warnings.length > 0 && (
                      <Badge className="bg-yellow-500 text-[#333e48] text-[9px] h-5 border-0">
                        {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {errors.length === 0 && warnings.length === 0 && successes.length > 0 && (
                      <Badge className="bg-[#38d853] text-[#333e48] text-[9px] h-5 border-0">
                        All Good
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showCompatibility ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {showCompatibility && (
                  <CardContent className="p-4 space-y-3">
                    {/* Wattage Display */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bolt className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold">
                          Power Consumption Estimate
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#333e48] dark:text-white">
                            {totalEstimatedWattage}W
                          </p>
                          <p className="text-xs text-gray-500">Estimated Draw</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#38d853]">
                            {recommendedPSU}W
                          </p>
                          <p className="text-xs text-gray-500">Recommended PSU</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {recommendedPSU > 0 ? Math.round((totalEstimatedWattage / recommendedPSU) * 100) : 0}%
                          </p>
                          <p className="text-xs text-gray-500">Load %</p>
                        </div>
                      </div>
                      {/* Wattage bar */}
                      <div className="mt-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            totalEstimatedWattage > recommendedPSU
                              ? "bg-red-500"
                              : totalEstimatedWattage > recommendedPSU * 0.8
                              ? "bg-yellow-500"
                              : "bg-[#38d853]"
                          }`}
                          style={{
                            width: `${Math.min(
                              recommendedPSU > 0 ? (totalEstimatedWattage / recommendedPSU) * 100 : 0,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Compatibility Results */}
                    {compatibilityResults.length > 0 && (
                      <div className="space-y-2">
                        {compatibilityResults.map((result, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-3 rounded-lg border ${
                              result.type === "error"
                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                                : result.type === "warning"
                                ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                                : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                            }`}
                          >
                            {result.type === "error" ? (
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            ) : result.type === "warning" ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            )}
                            <p
                              className={`text-xs ${
                                result.type === "error"
                                  ? "text-red-700 dark:text-red-400"
                                  : result.type === "warning"
                                  ? "text-yellow-700 dark:text-yellow-400"
                                  : "text-green-700 dark:text-green-400"
                              }`}
                            >
                              {result.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Missing Required */}
                    {!allRequiredSelected && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Please select all required components (*) before ordering.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Saved Builds Section - TechZone doesn't have this! */}
            {savedBuilds.length > 0 && (
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="bg-[#333e48] text-white px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-[#38d853]" />
                    <span className="font-semibold text-sm">
                      Saved Builds ({savedBuilds.length})
                    </span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {savedBuilds.map((build, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{build.name}</p>
                          <p className="text-xs text-gray-500">
                            {build.components.length} components | Rs.{" "}
                            {build.components
                              .reduce((s, c) => s + c.price, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => handleLoadBuild(build.components)}
                          >
                            <Download className="w-3 h-3 mr-1" /> Load
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 text-red-500"
                            onClick={() => {
                              const updated = savedBuilds.filter(
                                (_, i) => i !== idx
                              );
                              setSavedBuilds(updated);
                              localStorage.setItem(
                                "slhub-saved-builds",
                                JSON.stringify(updated)
                              );
                              toast.success("Build deleted");
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
              </div>{/* end flex-1 products area */}
            </div>{/* end flex container (sidebar + products) */}
          </div>

          {/* ============================================================= */}
          {/* Right: Build Summary Sidebar - Sticky */}
          {/* ============================================================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Build Summary Card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                {/* Summary Header */}
                <div className="bg-[#333e48] text-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base">Build Summary</h3>
                    <Badge className="bg-[#38d853] text-[#333e48] font-bold border-0">
                      {selectedCount} Item{selectedCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Component List */}
                  {pcBuilderComponents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Wrench className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        No components selected yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Start building your dream PC!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {BUILDER_CATEGORIES.map((cat) => {
                        const comp = getSelected(cat.key);
                        return (
                          <div
                            key={cat.key}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                              comp
                                ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                                : activeCategory === cat.key
                                ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20"
                                : "border-dashed border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                                comp
                                  ? "bg-[#38d853]/20 text-[#38d853]"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                              }`}
                            >
                              {comp ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                CATEGORY_ICONS_SMALL[cat.key] || (
                                  <Package className="w-4 h-4" />
                                )
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-400 uppercase">
                                {cat.shortLabel}
                                {cat.required && (
                                  <span className="text-red-400 ml-0.5">*</span>
                                )}
                              </p>
                              {comp ? (
                                <p className="text-xs font-medium truncate">
                                  {comp.name}
                                </p>
                              ) : (
                                <button
                                  onClick={() => setActiveCategory(cat.key)}
                                  className="text-[10px] text-blue-500 hover:underline"
                                >
                                  + Select {cat.shortLabel}
                                </button>
                              )}
                            </div>
                            {comp && (
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs font-bold text-[#38d853]">
                                  Rs. {comp.price.toLocaleString()}
                                </span>
                                <button
                                  onClick={() =>
                                    removePCBuilderComponent(comp.category)
                                  }
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Separator />

                  {/* Total Price */}
                  <div className="bg-[#333e48] text-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Total</span>
                      <span className="text-2xl font-bold text-[#38d853]">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    {/* Wattage mini */}
                    {totalEstimatedWattage > 0 && (
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Bolt className="w-3 h-3" />
                          Est. Wattage
                        </span>
                        <span>
                          ~{totalEstimatedWattage}W (Rec: {recommendedPSU}W)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Warnings */}
                  {errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.length} Compatibility Issue
                        {errors.length > 1 ? "s" : ""} Found
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-[#38d853] hover:bg-[#2bbf44] text-[#333e48] font-bold h-11"
                      disabled={
                        pcBuilderComponents.length === 0 || !allRequiredSelected
                      }
                      onClick={handleShareWhatsApp}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> Order via
                      WhatsApp
                    </Button>

                    <Button
                      className="w-full bg-[#333e48] hover:bg-[#2a343d] text-white font-semibold h-10"
                      disabled={
                        pcBuilderComponents.length === 0 || !allRequiredSelected
                      }
                      onClick={handleAddAllToCart}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add All to Cart
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9"
                        onClick={handleCopyBuild}
                        disabled={pcBuilderComponents.length === 0}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9"
                        onClick={handleSaveBuild}
                        disabled={pcBuilderComponents.length === 0}
                      >
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={pcBuilderComponents.length === 0}
                      onClick={() => {
                        clearPCBuilder();
                        toast.success("Build cleared!");
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Clear Build
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mb-1">
                      <Info className="w-3 h-3" /> Need Help?
                    </p>
                    <p className="text-[10px] text-blue-500/80 dark:text-blue-400/80">
                      Call us at{" "}
                      <a
                        href="tel:0710678944"
                        className="font-semibold hover:underline"
                      >
                        071 067 8944
                      </a>{" "}
                      or visit our store. Our experts will help you choose the
                      right components for your build.
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center">
                      <Shield className="w-5 h-5 text-[#38d853] mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">Genuine Parts</p>
                    </div>
                    <div className="text-center">
                      <Wrench className="w-5 h-5 text-[#38d853] mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">Expert Build</p>
                    </div>
                    <div className="text-center">
                      <ThermometerSun className="w-5 h-5 text-[#38d853] mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500">Wattage Check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
