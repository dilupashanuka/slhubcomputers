// =============================================================================
// SL HUB COMPUTER - Flash Deals Component
// =============================================================================
// Purpose: Displays products on sale with countdown timers on the homepage
// Features: Countdown timer, sale badges, discount percentages,
//           product cards with quick actions
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Eye, Timer, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { ProductType, CartItemType, WishlistItemType } from "@/types";

// Countdown timer - sale ends at midnight
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

export function FlashDeals() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, navigateToProduct, navigateToCategory } = useStore();
  const timeLeft = useCountdown();

  useEffect(() => {
    fetch("/api/products?isOnSale=true&limit=6&sort=price-desc")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate discount percentage
  const getDiscount = (price: number, original?: number | null) => {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  return (
    <section className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 py-10">
      <div className="container mx-auto px-4">
        {/* Header with countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 flex items-center gap-2">
              <Timer className="w-7 h-7" /> Flash Deals
            </h2>
            <p className="text-muted-foreground mt-1">
              Hurry! These deals won&apos;t last long
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ends in:</span>
            <div className="flex gap-1">
              {[
                { val: timeLeft.hours, label: "H" },
                { val: timeLeft.minutes, label: "M" },
                { val: timeLeft.seconds, label: "S" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="bg-red-600 text-white px-2 py-1 rounded text-center min-w-[40px]"
                >
                  <div className="text-lg font-bold leading-tight">
                    {String(t.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] opacity-80">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No flash deals available right now</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product) => {
              const images: string[] = JSON.parse(product.images || "[]");
              const discount = getDiscount(product.price, product.originalPrice);

              return (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
                        -{discount}%
                      </Badge>
                    )}
                    {/* Quick actions on hover */}
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartItem: CartItemType = {
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            image: images[0] || "",
                            quantity: 1,
                            slug: product.slug,
                            stock: product.stock,
                          };
                          addToCart(cartItem);
                          toast.success("Added to cart!");
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" /> Add
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const wishItem: WishlistItemType = {
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            image: images[0] || "",
                            slug: product.slug,
                          };
                          addToWishlist(wishItem);
                          toast.success("Added to wishlist!");
                        }}
                      >
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <button
                      onClick={() => navigateToProduct(product.id)}
                      className="text-left w-full"
                    >
                      <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </button>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-red-600">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => {
                // Navigate to category view with sale filter
                navigateToCategory("", "All Sale Products");
              }}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              View All Deals <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
