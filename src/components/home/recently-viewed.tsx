// =============================================================================
// SL HUB COMPUTER - Recently Viewed Component
// =============================================================================
// Purpose: Displays recently viewed products on the homepage
// Features: Horizontal scrollable list, stored in Zustand/localStorage,
//           quick add to cart/wishlist
// =============================================================================

"use client";

import { useStore } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Clock } from "lucide-react";
import { toast } from "sonner";
import type { CartItemType, WishlistItemType } from "@/types";

export function RecentlyViewed() {
  const { recentlyViewed, addToCart, addToWishlist, navigateToProduct } = useStore();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentlyViewed.map((item) => (
          <Card
            key={item.productId}
            className="shrink-0 w-48 hover:shadow-lg transition-shadow group"
          >
            <div
              className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => navigateToProduct(item.productId)}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <CardContent className="p-3">
              <button
                onClick={() => navigateToProduct(item.productId)}
                className="text-left w-full"
              >
                <h3 className="font-medium text-xs line-clamp-2 mb-1 hover:text-blue-600">
                  {item.name}
                </h3>
              </button>
              <p className="font-bold text-blue-600 text-sm mb-2">
                Rs. {item.price.toLocaleString()}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-[10px] h-7"
                  onClick={() => {
                    const cartItem: CartItemType = {
                      productId: item.productId,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      image: item.image,
                      quantity: 1,
                      slug: item.slug,
                      stock: 10,
                    };
                    addToCart(cartItem);
                    toast.success("Added to cart!");
                  }}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" /> Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    const wishItem: WishlistItemType = {
                      productId: item.productId,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      image: item.image,
                      slug: item.slug,
                    };
                    addToWishlist(wishItem);
                    toast.success("Added to wishlist!");
                  }}
                >
                  <Heart className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
