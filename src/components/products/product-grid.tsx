// =============================================================================
// SL HUB COMPUTER - Product Grid Component
// =============================================================================
// Purpose: Category product listing with filters, sorting, and pagination
// Features: Sidebar filters, sort options, product cards, pagination,
//           responsive grid layout
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import type { ProductType, CategoryType, BrandType } from "@/types";

export function ProductGrid() {
  const { selectedCategoryId, selectedCategoryName } = useStore();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Fetch categories and brands for filters
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([catData, brandData]) => {
      if (catData.success) setCategories(catData.data);
      if (brandData.success) setBrands(brandData.data);
    });
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (selectedBrand) params.set("brandId", selectedBrand);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategoryId, selectedBrand, sort, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {selectedCategoryName || "All Products"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {products.length > 0
              ? `Showing ${products.length} products`
              : "No products found"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
          </Button>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block w-64 shrink-0`}>
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedBrand={selectedBrand}
            onBrandChange={(b) => { setSelectedBrand(b); setPage(1); }}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or browse other categories
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
