// =============================================================================
// SL HUB COMPUTER - Category Grid Component
// =============================================================================
// Purpose: Displays product categories in a responsive grid on the homepage
// Features: Fetches categories from API, shows icon + name + product count,
//           navigates to category view on click
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive,
  Zap, Box, Fan, Camera, Mouse, Shield
} from "lucide-react";
import type { CategoryType } from "@/types";

// Map category slugs to Lucide icons
const categoryIcons: Record<string, React.ReactNode> = {
  "processors": <Cpu className="w-8 h-8" />,
  "graphics-cards": <Monitor className="w-8 h-8" />,
  "motherboards": <CircuitBoard className="w-8 h-8" />,
  "memory": <MemoryStick className="w-8 h-8" />,
  "storage": <HardDrive className="w-8 h-8" />,
  "power-supplies": <Zap className="w-8 h-8" />,
  "pc-cases": <Box className="w-8 h-8" />,
  "cooling": <Fan className="w-8 h-8" />,
  "monitors": <Monitor className="w-8 h-8" />,
  "peripherals": <Mouse className="w-8 h-8" />,
  "cctv-security": <Shield className="w-8 h-8" />,
};

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateToCategory } = useStore();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
        <p className="text-muted-foreground mt-2">
          Browse our wide range of computer components and accessories
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
              onClick={() => navigateToCategory(cat.id, cat.name)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {categoryIcons[cat.slug] || <Cpu className="w-8 h-8" />}
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{cat.name}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {cat._count?.products || 0} Products
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
