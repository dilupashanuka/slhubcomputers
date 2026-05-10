// =============================================================================
// SL HUB COMPUTER - Product Section Component
// =============================================================================
// Purpose: Generic product section for homepage (Featured, New Arrivals, etc.)
// Features: Fetches products from configurable API endpoint, displays in grid,
//           add to cart/wishlist actions, responsive layout
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import type { ProductType, CartItemType, WishlistItemType } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  endpoint: string;
  icon?: React.ReactNode;
}

export function ProductSection({ title, subtitle, endpoint, icon }: ProductSectionProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, navigateToProduct } = useStore();

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      </div>
      {subtitle && <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const images: string[] = typeof product.images === "string" ? JSON.parse(product.images || "[]") : (product.images || []);
            const discount =
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

            return (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative">
                  <div
                    className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => navigateToProduct(product.id)}
                  >
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
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge className="bg-blue-600 text-xs">New</Badge>
                    )}
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-xs">-{discount}%</Badge>
                    )}
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => {
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
                    <p className="text-xs text-muted-foreground mb-1">
                      {product.brand?.name || ""}
                    </p>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </button>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bold text-blue-600">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={() => {
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
                    <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
