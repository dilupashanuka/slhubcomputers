// =============================================================================
// SL HUB COMPUTER - Enhanced Search Results Page Component
// =============================================================================
// Purpose: Full search results page with filters, sorting, and view options
// Features: Filter sidebar (category, brand, price, stock, sale, rating),
//           active filter badges, sort dropdown, grid/list view toggle,
//           result count, pagination, "did you mean" suggestions,
//           related searches, no results state
// Uses: useStore for search query and navigation
// API: Fetches from /api/search for search results
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/use-store";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ArrowLeft,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Star,
  TrendingUp,
  Package,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { ProductType, CategoryType, BrandType } from "@/types";

// ---------------------------------------------------------------------------
// Filter State Interface
// ---------------------------------------------------------------------------
interface SearchFilters {
  category: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  onSale: boolean;
  rating: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  category: "",
  brand: "",
  priceMin: 0,
  priceMax: 500000,
  inStock: false,
  onSale: false,
  rating: 0,
};

// ---------------------------------------------------------------------------
// Related search suggestions
// ---------------------------------------------------------------------------
const RELATED_SEARCHES_MAP: Record<string, string[]> = {
  gpu: ["RTX 4060", "RTX 4070", "GTX 1650", "Graphics Card"],
  ram: ["DDR4 RAM", "DDR5 RAM", "16GB RAM", "32GB RAM"],
  ssd: ["NVMe SSD", "SATA SSD", "1TB SSD", "512GB SSD"],
  processor: ["Intel Core i5", "AMD Ryzen 5", "Intel Core i7", "AMD Ryzen 7"],
  monitor: ["Gaming Monitor", "144Hz Monitor", "4K Monitor", "Curved Monitor"],
  keyboard: ["Mechanical Keyboard", "RGB Keyboard", "Gaming Keyboard"],
  mouse: ["Gaming Mouse", "Wireless Mouse", "RGB Mouse"],
  motherboard: ["B660 Motherboard", "B550 Motherboard", "Z690 Motherboard"],
  default: ["GPU", "RAM", "SSD", "Processor", "Monitor"],
};

function getRelatedSearches(query: string): string[] {
  const q = query.toLowerCase();
  for (const [key, suggestions] of Object.entries(RELATED_SEARCHES_MAP)) {
    if (q.includes(key)) return suggestions;
  }
  return RELATED_SEARCHES_MAP.default;
}

// ---------------------------------------------------------------------------
// Search Results Component
// ---------------------------------------------------------------------------
export function SearchResults() {
  const { searchQuery, navigateToSearch, setCurrentView } = useStore();

  // ---- Local State ----
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [refinedQuery, setRefinedQuery] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [didYouMean, setDidYouMean] = useState<string[]>([]);

  // ---- Filter options from DB ----
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);

  // ---- Active filter count ----
  const activeFilterCount = [
    filters.category,
    filters.brand,
    filters.inStock,
    filters.onSale,
    filters.rating > 0,
    filters.priceMin > 0 || filters.priceMax < 500000,
  ].filter(Boolean).length;

  // ---- Fetch categories and brands for filters ----
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ])
      .then(([catData, brandData]) => {
        if (catData.success) setCategories(catData.data || []);
        if (brandData.success) setBrands(brandData.data || []);
      })
      .catch(console.error);
  }, []);

  // ---- Fetch search results ----
  const fetchResults = useCallback(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    // Apply filters
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.priceMin > 0) params.set("priceMin", String(filters.priceMin));
    if (filters.priceMax < 500000) params.set("priceMax", String(filters.priceMax));
    if (filters.inStock) params.set("inStock", "true");
    if (filters.onSale) params.set("onSale", "true");
    if (filters.rating > 0) params.set("rating", String(filters.rating));

    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const resultData = data.data || data;
          setProducts(resultData.products || []);
          setTotalPages(resultData.totalPages || 1);
          setTotalResults(resultData.total || 0);
          setDidYouMean(resultData.didYouMean || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchQuery, sort, page, filters]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ---- Reset page on query change ----
  useEffect(() => {
    setPage(1);
    setDidYouMean([]);
  }, [searchQuery]);

  // ---- Handle refined search ----
  const handleRefinedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinedQuery.trim()) {
      setPage(1);
      navigateToSearch(refinedQuery.trim());
    }
  };

  // ---- Remove a single filter ----
  const removeFilter = (key: keyof SearchFilters) => {
    const resetValue =
      key === "priceMin" ? 0 :
      key === "priceMax" ? 500000 :
      key === "rating" ? 0 :
      "";
    setFilters((prev) => ({ ...prev, [key]: resetValue }));
    setPage(1);
  };

  // ---- Clear all filters ----
  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  // ---- Related searches ----
  const relatedSearches = getRelatedSearches(searchQuery);

  // ---- No Query State ----
  if (!searchQuery.trim()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Search Our Products</h2>
        <p className="text-muted-foreground mb-6">
          Type in the search bar above to find products, brands, or categories.
        </p>
        <Button
          onClick={() => setCurrentView("home")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  // ---- Main Render ----
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView("home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {totalResults} product{totalResults !== 1 ? "s" : ""} found
                {activeFilterCount > 0 && (
                  <span> · {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Did You Mean */}
        {didYouMean.length > 0 && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-400">Did you mean:</span>
            {didYouMean.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => navigateToSearch(suggestion)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Refine Search Bar + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleRefinedSearch} className="flex max-w-xl flex-1">
            <Input
              value={refinedQuery}
              onChange={(e) => setRefinedQuery(e.target.value)}
              placeholder="Refine your search..."
              className="rounded-r-none border-r-0 focus-visible:ring-blue-600"
            />
            <Button
              type="submit"
              className="rounded-l-none bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <div className="flex items-center gap-2">
            {/* Sort Options */}
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "rounded-r-none" : "rounded-r-none"}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1.5 text-[9px] h-4 min-w-[16px] px-1 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.category && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {categories.find((c) => c.id === filters.category)?.name || "Category"}
                <button onClick={() => removeFilter("category")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.brand && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {brands.find((b) => b.id === filters.brand)?.name || "Brand"}
                <button onClick={() => removeFilter("brand")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(filters.priceMin > 0 || filters.priceMax < 500000) && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Rs. {filters.priceMin.toLocaleString()} – {filters.priceMax.toLocaleString()}
                <button onClick={() => { setFilters((f) => ({ ...f, priceMin: 0, priceMax: 500000 })); setPage(1); }} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.inStock && (
              <Badge variant="secondary" className="gap-1 pr-1">
                In Stock
                <button onClick={() => removeFilter("inStock")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.onSale && (
              <Badge variant="secondary" className="gap-1 pr-1">
                On Sale
                <button onClick={() => removeFilter("onSale")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {filters.rating}+ Stars
                <button onClick={() => removeFilter("rating")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* ---- Filter Sidebar ---- */}
        {showFilters && (
          <div className="hidden md:block w-64 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    <Filter className="w-4 h-4" /> Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <Separator />

                {/* Category Filter */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Category</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={filters.category === cat.id}
                          onCheckedChange={(checked) => {
                            setFilters((f) => ({
                              ...f,
                              category: checked ? cat.id : "",
                            }));
                            setPage(1);
                          }}
                        />
                        <span className="truncate">{cat.name}</span>
                        {cat._count && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            ({cat._count.products})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Brand Filter */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Brand</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={filters.brand === brand.id}
                          onCheckedChange={(checked) => {
                            setFilters((f) => ({
                              ...f,
                              brand: checked ? brand.id : "",
                            }));
                            setPage(1);
                          }}
                        />
                        <span className="truncate">{brand.name}</span>
                        {brand._count && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            ({brand._count.products})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range Filter */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Price Range</h4>
                  <div className="px-1">
                    <Slider
                      min={0}
                      max={500000}
                      step={5000}
                      value={[filters.priceMin, filters.priceMax]}
                      onValueChange={([min, max]) => {
                        setFilters((f) => ({ ...f, priceMin: min, priceMax: max }));
                        setPage(1);
                      }}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Rs. {filters.priceMin.toLocaleString()}</span>
                      <span>Rs. {filters.priceMax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* In Stock Filter */}
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.inStock}
                    onCheckedChange={(checked) => {
                      setFilters((f) => ({ ...f, inStock: !!checked }));
                      setPage(1);
                    }}
                  />
                  In Stock Only
                </label>

                {/* On Sale Filter */}
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.onSale}
                    onCheckedChange={(checked) => {
                      setFilters((f) => ({ ...f, onSale: !!checked }));
                      setPage(1);
                    }}
                  />
                  On Sale
                </label>

                <Separator />

                {/* Rating Filter */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Minimum Rating</h4>
                  <div className="space-y-1">
                    {[4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setFilters((f) => ({ ...f, rating: f.rating === r ? 0 : r }));
                          setPage(1);
                        }}
                        className={`flex items-center gap-1.5 w-full px-2 py-1 rounded text-sm transition-colors ${
                          filters.rating === r
                            ? "bg-blue-50 dark:bg-blue-950/30"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= r
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">& up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- Results Area ---- */}
        <div className="flex-1 min-w-0">
          {/* Loading State */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "h-72 rounded-xl" : "h-24 rounded-xl"} />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* No Results */
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-2">
                We couldn&apos;t find any products matching &ldquo;{searchQuery}&rdquo;
              </p>

              {/* Did You Mean */}
              {didYouMean.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Did you mean:</p>
                  <div className="flex justify-center gap-2">
                    {didYouMean.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToSearch(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-6">
                Try searching with different keywords or browse our categories
              </p>

              {/* Related Searches */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3 flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Related Searches
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {relatedSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => navigateToSearch(term)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setCurrentView("home")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Categories
              </Button>
            </div>
          ) : (
            <>
              {/* Products Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Related Searches */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Related Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => navigateToSearch(term)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
