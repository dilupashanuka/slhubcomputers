// =============================================================================
// SL HUB COMPUTER - Product Filters Component
// =============================================================================
// Purpose: Sidebar filter panel for the product grid page
// Features: Price range slider, brand checkboxes, rating filter, stock filter,
//           category filter, clear all filters button
// Uses: shadcn/ui components for consistent styling, Slider for price range
// Props: categories, brands, selectedBrand, onBrandChange for parent control
// =============================================================================

"use client";

import { useState } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, X, SlidersHorizontal } from "lucide-react";
import type { CategoryType, BrandType } from "@/types";

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface ProductFiltersProps {
  categories: CategoryType[];
  brands: BrandType[];
  selectedBrand: string;
  onBrandChange: (brandId: string) => void;
}

// ---------------------------------------------------------------------------
// Price Range Constants (in LKR)
// ---------------------------------------------------------------------------
const MIN_PRICE = 0;
const MAX_PRICE = 500000; // Rs. 500,000 max for slider
const PRICE_STEP = 1000;

// ---------------------------------------------------------------------------
// Product Filters Component
// ---------------------------------------------------------------------------
export function ProductFilters({
  categories,
  brands,
  selectedBrand,
  onBrandChange,
}: ProductFiltersProps) {
  const { navigateToCategory, selectedCategoryId } = useStore();

  // ---- Local Filter State ----
  const [priceRange, setPriceRange] = useState<[number, number]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Count active filters for badge
  const activeFilterCount =
    (selectedBrand ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE ? 1 : 0);

  // Clear all local filters
  const clearAllFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setMinRating(0);
    setInStockOnly(false);
    onBrandChange("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge className="bg-blue-600 text-[10px] h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-700 h-6 px-2"
          >
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* ---- Category Filter ---- */}
      <div>
        <h4 className="font-medium text-sm mb-3">Categories</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigateToCategory(category.id, category.name)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                selectedCategoryId === category.id
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600 font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="truncate">{category.name}</span>
              {category._count && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({category._count.products})
                </span>
              )}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">No categories</p>
          )}
        </div>
      </div>

      <Separator />

      {/* ---- Price Range Filter ---- */}
      <div>
        <h4 className="font-medium text-sm mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={(val) => setPriceRange(val as [number, number])}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Rs. {priceRange[0].toLocaleString()}</span>
          <span>Rs. {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      {/* ---- Brand Filter ---- */}
      <div>
        <h4 className="font-medium text-sm mb-3">Brands</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md px-2 py-1.5 transition-colors"
            >
              <Checkbox
                checked={selectedBrand === brand.id}
                onCheckedChange={(checked) => {
                  onBrandChange(checked ? brand.id : "");
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="text-sm truncate">{brand.name}</span>
              {brand._count && (
                <span className="text-xs text-muted-foreground ml-auto">
                  ({brand._count.products})
                </span>
              )}
            </label>
          ))}
          {brands.length === 0 && (
            <p className="text-xs text-muted-foreground">No brands</p>
          )}
        </div>
      </div>

      <Separator />

      {/* ---- Rating Filter ---- */}
      <div>
        <h4 className="font-medium text-sm mb-3">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                minRating === rating
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">& up</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* ---- Stock Filter ---- */}
      <div>
        <h4 className="font-medium text-sm mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) =>
              setInStockOnly(checked === true)
            }
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
