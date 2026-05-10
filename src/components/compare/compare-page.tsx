// =============================================================================
// SL HUB COMPUTER - Compare Page Component
// =============================================================================
// Purpose: Side-by-side comparison of up to 4 products with spec highlighting
// Features: Product cards with images/prices, spec comparison table,
//           highlight differences between products, remove products from compare
// Uses: useStore for compare list state
// =============================================================================

"use client";

import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitCompareArrows,
  X,
  ShoppingCart,
  ArrowLeft,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { CartItemType } from "@/types";

// ---------------------------------------------------------------------------
// Compare Page Component
// ---------------------------------------------------------------------------
export function ComparePage() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    addToCart,
    setCurrentView,
    navigateToProduct,
  } = useStore();

  // ---- Collect all spec keys across all products ----
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap((item) => Object.keys(item.specs)))
  );

  // ---- Determine which spec rows have differences ----
  const getDifferingSpecs = (): Set<string> => {
    const differing = new Set<string>();
    allSpecKeys.forEach((key) => {
      const values = compareList.map((item) => item.specs[key] || "N/A");
      if (new Set(values).size > 1) {
        differing.add(key);
      }
    });
    return differing;
  };

  const differingSpecs = getDifferingSpecs();

  // ---- Handle Add to Cart ----
  const handleAddToCart = (item: (typeof compareList)[0]) => {
    const cartItem: CartItemType = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      quantity: 1,
      slug: item.slug,
      stock: 99,
    };
    addToCart(cartItem);
    toast.success(`${item.name} added to cart!`);
  };

  // ---- Empty State ----
  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GitCompareArrows className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">No Products to Compare</h2>
        <p className="text-muted-foreground mb-6">
          Add products to your compare list to see them side by side.
        </p>
        <Button
          onClick={() => setCurrentView("home")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
        </Button>
      </div>
    );
  }

  // ---- Main Render ----
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView("home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitCompareArrows className="w-6 h-6 text-blue-600" /> Compare
              Products
            </h1>
            <p className="text-sm text-muted-foreground">
              Comparing {compareList.length} product
              {compareList.length !== 1 ? "s" : ""} (max 4)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            clearCompare();
            toast.success("Compare list cleared");
          }}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4 mr-1" /> Clear All
        </Button>
      </div>

      {/* ---- Product Cards Row ---- */}
      <div
        className="grid gap-4 mb-8"
        style={{
          gridTemplateColumns: `repeat(${compareList.length}, 1fr)`,
        }}
      >
        {compareList.map((item) => (
          <Card
            key={item.productId}
            className="relative group hover:shadow-lg transition-all"
          >
            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full z-10 bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900"
              onClick={() => {
                removeFromCompare(item.productId);
                toast.success(`${item.name} removed from comparison`);
              }}
            >
              <X className="w-3 h-3 text-red-500" />
            </Button>

            <CardContent className="p-4 text-center">
              {/* Product Image */}
              <div
                className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3 cursor-pointer"
                onClick={() => navigateToProduct(item.productId)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <button
                onClick={() => navigateToProduct(item.productId)}
                className="text-left w-full"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {item.brand && `${item.brand} • `}
                  {item.category}
                </p>
                <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                  {item.name}
                </h3>
              </button>

              {/* Price */}
              <div className="mb-3">
                <span className="font-bold text-blue-600">
                  Rs. {item.price.toLocaleString()}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="text-xs text-muted-foreground line-through">
                    Rs. {item.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Spec Comparison Table ---- */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div
            className="grid border-b bg-gray-50 dark:bg-gray-800"
            style={{
              gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
            }}
          >
            <div className="p-3 font-semibold text-sm">Specification</div>
            {compareList.map((item) => (
              <div
                key={item.productId}
                className="p-3 font-semibold text-sm truncate"
              >
                {item.name}
              </div>
            ))}
          </div>

          {/* Price Row */}
          <div
            className="grid border-b"
            style={{
              gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
            }}
          >
            <div className="p-3 text-sm font-medium bg-gray-50 dark:bg-gray-800">
              Price
            </div>
            {compareList.map((item) => {
              // Find the lowest price
              const lowestPrice = Math.min(
                ...compareList.map((i) => i.price)
              );
              const isLowest = item.price === lowestPrice;
              return (
                <div key={item.productId} className="p-3 text-sm">
                  <span
                    className={
                      isLowest ? "text-green-600 font-bold" : "font-medium"
                    }
                  >
                    Rs. {item.price.toLocaleString()}
                  </span>
                  {isLowest && compareList.length > 1 && (
                    <Badge className="ml-2 bg-green-600 text-[10px]">
                      Lowest
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Brand Row */}
          <div
            className="grid border-b"
            style={{
              gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
            }}
          >
            <div className="p-3 text-sm font-medium bg-gray-50 dark:bg-gray-800">
              Brand
            </div>
            {compareList.map((item) => (
              <div key={item.productId} className="p-3 text-sm">
                {item.brand || "N/A"}
              </div>
            ))}
          </div>

          {/* Category Row */}
          <div
            className="grid border-b"
            style={{
              gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
            }}
          >
            <div className="p-3 text-sm font-medium bg-gray-50 dark:bg-gray-800">
              Category
            </div>
            {compareList.map((item) => (
              <div key={item.productId} className="p-3 text-sm">
                {item.category || "N/A"}
              </div>
            ))}
          </div>

          {/* Spec Rows */}
          {allSpecKeys.map((key, idx) => {
            const isDifferent = differingSpecs.has(key);
            return (
              <div
                key={key}
                className={`grid border-b ${
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
                style={{
                  gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
                }}
              >
                <div
                  className={`p-3 text-sm font-medium ${
                    isDifferent
                      ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  {isDifferent && (
                    <span className="text-yellow-500 mr-1">⚡</span>
                  )}
                  {key}
                </div>
                {compareList.map((item) => (
                  <div
                    key={item.productId}
                    className={`p-3 text-sm ${
                      isDifferent
                        ? "bg-yellow-50/50 dark:bg-yellow-950/20 font-medium"
                        : ""
                    }`}
                  >
                    {item.specs[key] || "N/A"}
                  </div>
                ))}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Legend */}
      {compareList.length > 1 && differingSpecs.size > 0 && (
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            ⚡ Yellow highlighted rows indicate differences between products
          </span>
          <span className="flex items-center gap-1">
            <Badge className="bg-green-600 text-[10px]">Lowest</Badge>{" "}
            Indicates the lowest price
          </span>
        </div>
      )}

      {/* Add More CTA */}
      {compareList.length < 4 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-3">
            You can add up to {4 - compareList.length} more product
            {4 - compareList.length !== 1 ? "s" : ""} to compare
          </p>
          <Button
            variant="outline"
            onClick={() => setCurrentView("home")}
            className="border-blue-600 text-blue-600"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Browse More Products
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
