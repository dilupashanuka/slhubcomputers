// =============================================================================
// SL HUB COMPUTER - Search Results Page Component
// =============================================================================
// Purpose: Full search results page displaying filtered products in a grid
// Features: Search query display, sort options, product count, grid layout,
//           pagination, no results state, search refinement
// Uses: useStore for search query and navigation
// API: Fetches from /api/search?q= for search results
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowLeft, SlidersHorizontal } from "lucide-react";
import type { ProductType } from "@/types";

// ---------------------------------------------------------------------------
// Search Results Component
// ---------------------------------------------------------------------------
export function SearchResults() {
  const { searchQuery, navigateToSearch, setCurrentView } = useStore();

  // ---- Local State ----
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [refinedQuery, setRefinedQuery] = useState(searchQuery);

  // ---- Fetch search results ----
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.set("search", searchQuery);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchQuery, sort, page]);

  // ---- Handle refined search ----
  const handleRefinedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinedQuery.trim()) {
      setPage(1);
      navigateToSearch(refinedQuery.trim());
    }
  };

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
          <div>
            <h1 className="text-2xl font-bold">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {totalResults} product{totalResults !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Refine Search Bar */}
        <form onSubmit={handleRefinedSearch} className="flex max-w-xl mb-4">
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

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* No Results */
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No products found</h2>
          <p className="text-muted-foreground mb-2">
            We couldn&apos;t find any products matching &ldquo;{searchQuery}
            &rdquo;
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Try searching with different keywords or browse our categories
          </p>
          <Button
            onClick={() => setCurrentView("home")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse Categories
          </Button>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
