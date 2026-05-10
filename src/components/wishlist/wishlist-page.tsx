// =============================================================================
// SL HUB COMPUTER - Wishlist Page Component
// =============================================================================
// Purpose: Display user's saved wishlist items with management options
// Features: Product grid layout, remove from wishlist, add to cart, price alerts
//           toggle, empty state with CTA
// Uses: useStore for wishlist state and cart actions
// =============================================================================

"use client";

import { useState } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Bell,
  ShoppingBag,
  ArrowLeft,
  GitCompareArrows,
} from "lucide-react";
import { toast } from "sonner";
import type { CartItemType, CompareItemType } from "@/types";

// ---------------------------------------------------------------------------
// Wishlist Page Component
// ---------------------------------------------------------------------------
export function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    addToCart,
    addToCompare,
    setCurrentView,
  } = useStore();

  // ---- Local state for price alerts toggle per item ----
  const [priceAlerts, setPriceAlerts] = useState<Record<string, boolean>>({});

  // ---- Toggle price alert for a product ----
  const togglePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const newState = { ...prev, [productId]: !prev[productId] };
      toast.success(
        newState[productId]
          ? "Price alert enabled! We'll notify you when the price drops."
          : "Price alert disabled"
      );
      return newState;
    });
  };

  // ---- Handle Add to Cart ----
  const handleAddToCart = (item: (typeof wishlist)[0]) => {
    const cartItem: CartItemType = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      quantity: 1,
      slug: item.slug,
      stock: 99, // Will be validated server-side
    };
    addToCart(cartItem);
    toast.success(`${item.name} added to cart!`);
  };

  // ---- Handle Add to Compare ----
  const handleAddToCompare = (item: (typeof wishlist)[0]) => {
    const compareItem: CompareItemType = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      slug: item.slug,
      specs: {},
      brand: "",
      category: "",
    };
    addToCompare(compareItem);
    toast.success("Added to compare list!");
  };

  // ---- Handle Remove ----
  const handleRemove = (productId: string, name: string) => {
    removeFromWishlist(productId);
    toast.success(`${name} removed from wishlist`);
  };

  // ---- Empty State ----
  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Save your favorite products here so you can easily find them later.
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
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView("home")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My
            Wishlist
          </h1>
          <p className="text-sm text-muted-foreground">
            {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wishlist.map((item) => (
          <Card
            key={item.productId}
            className="group hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Product Image */}
            <div
              className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer relative"
              onClick={() =>
                useStore.getState().navigateToProduct(item.productId)
              }
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <ShoppingCart className="w-12 h-12 text-gray-300" />
              )}

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.productId, item.name);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>

              {/* Sale Badge */}
              {item.originalPrice && item.originalPrice > item.price && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-[10px]">
                  -
                  {Math.round(
                    ((item.originalPrice - item.price) / item.originalPrice) *
                      100
                  )}
                  %
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Product Name */}
              <h3
                className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() =>
                  useStore.getState().navigateToProduct(item.productId)
                }
              >
                {item.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-blue-600">
                  Rs. {item.price.toLocaleString()}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    Rs. {item.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleAddToCompare(item)}
                >
                  <GitCompareArrows className="w-3 h-3" />
                </Button>
              </div>

              <Separator />

              {/* Price Alert Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Price Alert
                  </span>
                </div>
                <Switch
                  checked={priceAlerts[item.productId] || false}
                  onCheckedChange={() => togglePriceAlert(item.productId)}
                  className="scale-75"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
