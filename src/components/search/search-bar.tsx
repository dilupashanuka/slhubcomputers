// =============================================================================
// SL HUB COMPUTER - Search Bar Component
// =============================================================================
// Purpose: Autocomplete search bar with dropdown suggestions
// Features: Debounced search input, dropdown with product/category/brand
//           suggestions, keyboard navigation, click-to-navigate
// Uses: useStore for navigation, fetches from /api/search?q=
// =============================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store/use-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Package,
  FolderOpen,
  Tag,
  Loader2,
} from "lucide-react";
import type { ProductType, CategoryType, BrandType } from "@/types";

// ---------------------------------------------------------------------------
// Search Result Item Types
// ---------------------------------------------------------------------------
interface SearchSuggestion {
  products: ProductType[];
  categories: CategoryType[];
  brands: BrandType[];
}

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Search Bar Component
// ---------------------------------------------------------------------------
export function SearchBar({
  className = "",
  placeholder = "Search products, brands, categories...",
  onSearch,
}: SearchBarProps) {
  const { navigateToSearch, navigateToCategory, navigateToProduct } =
    useStore();

  // ---- Local State ----
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // ---- Refs ----
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Total suggestion count for keyboard navigation ----
  const totalSuggestions =
    (suggestions?.products.length || 0) +
    (suggestions?.categories.length || 0) +
    (suggestions?.brands.length || 0);

  // ---- Debounced search for suggestions ----
  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSuggestions(null);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setSuggestions(data.data);
            setShowDropdown(true);
          }
        })
        .catch(() => setSuggestions(null))
        .finally(() => setLoading(false));
    }, 300); // 300ms debounce
  }, []);

  // ---- Handle input change ----
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestions(value);
  };

  // ---- Handle form submission ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigateToSearch(query.trim());
      }
    }
  };

  // ---- Handle keyboard navigation ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !suggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < totalSuggestions - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : totalSuggestions - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      // Navigate to the selected suggestion
      let currentIdx = 0;

      // Check products
      for (const product of suggestions.products) {
        if (currentIdx === selectedIndex) {
          navigateToProduct(product.id);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
      // Check categories
      for (const category of suggestions.categories) {
        if (currentIdx === selectedIndex) {
          navigateToCategory(category.id, category.name);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
      // Check brands - navigate to search for brand
      for (const brand of suggestions.brands) {
        if (currentIdx === selectedIndex) {
          navigateToSearch(brand.name);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Clear search ----
  const handleClear = () => {
    setQuery("");
    setSuggestions(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // ---- Flatten suggestions for indexing ----
  const flatItems: { type: "product" | "category" | "brand"; data: unknown }[] =
    [
      ...(suggestions?.products.map((p) => ({ type: "product" as const, data: p })) || []),
      ...(suggestions?.categories.map((c) => ({ type: "category" as const, data: c })) || []),
      ...(suggestions?.brands.map((b) => ({ type: "brand" as const, data: b })) || []),
    ];

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions && query.trim()) setShowDropdown(true);
            }}
            placeholder={placeholder}
            className="pr-8 focus-visible:ring-blue-600"
          />
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="rounded-l-none bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* ---- Dropdown Suggestions ---- */}
      {showDropdown && suggestions && totalSuggestions > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
        >
          {/* Products Section */}
          {suggestions.products.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0">
                <Package className="w-3 h-3 inline mr-1" /> Products
              </div>
              {suggestions.products.map((product, idx) => {
                const globalIdx = idx;
                const images: string[] = JSON.parse(
                  product.images || "[]"
                );
                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigateToProduct(product.id);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${
                      selectedIndex === globalIdx
                        ? "bg-blue-50 dark:bg-blue-950"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand?.name} • Rs.{" "}
                        {product.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Categories Section */}
          {suggestions.categories.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0 border-t">
                <FolderOpen className="w-3 h-3 inline mr-1" /> Categories
              </div>
              {suggestions.categories.map((category, idx) => {
                const globalIdx = suggestions.products.length + idx;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      navigateToCategory(category.id, category.name);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${
                      selectedIndex === globalIdx
                        ? "bg-blue-50 dark:bg-blue-950"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center shrink-0">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{category.name}</p>
                      {category._count && (
                        <p className="text-xs text-muted-foreground">
                          {category._count.products} products
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Brands Section */}
          {suggestions.brands.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0 border-t">
                <Tag className="w-3 h-3 inline mr-1" /> Brands
              </div>
              {suggestions.brands.map((brand, idx) => {
                const globalIdx =
                  suggestions.products.length +
                  suggestions.categories.length +
                  idx;
                return (
                  <button
                    key={brand.id}
                    onClick={() => {
                      navigateToSearch(brand.name);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${
                      selectedIndex === globalIdx
                        ? "bg-blue-50 dark:bg-blue-950"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{brand.name}</p>
                      {brand._count && (
                        <p className="text-xs text-muted-foreground">
                          {brand._count.products} products
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* View All Results */}
          <div className="border-t p-2">
            <button
              onClick={() => {
                navigateToSearch(query);
                setShowDropdown(false);
              }}
              className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown && suggestions && totalSuggestions === 0 && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 p-6 text-center"
        >
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
}
