// =============================================================================
// SL HUB COMPUTER - Product Card Component
// =============================================================================
// Purpose: Reusable product card for grids and listings
// Features: Image, badges (new/sale/discount), price, quick actions,
//           responsive layout, hover effects
// =============================================================================

"use client";

import { useStore } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import type { ProductType, CartItemType, WishlistItemType, CompareItemType } from "@/types";

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, addToCompare, navigateToProduct, isInWishlist, isInCompare } = useStore();
  const images: string[] = typeof product.images === "string" ? JSON.parse(product.images || "[]") : (product.images || []);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const specs: Record<string, string> = JSON.parse(product.specs || "{}");

  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      <div className="relative">
        {/* Product Image */}
        <div
          className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => navigateToProduct(product.id)}
        >
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <Badge className="bg-blue-600 text-[10px]">New</Badge>}
          {discount > 0 && <Badge className="bg-red-500 text-[10px]">-{discount}%</Badge>}
          {product.isOnSale && <Badge className="bg-orange-500 text-[10px]">Sale</Badge>}
          {product.stock <= 3 && product.stock > 0 && (
            <Badge className="bg-yellow-500 text-[10px]">Only {product.stock} left</Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-gray-500 text-[10px]">Out of Stock</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant={isInWishlist(product.id) ? "default" : "secondary"}
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => {
              if (!isInWishlist(product.id)) {
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
              }
            }}
          >
            <Heart className={`w-3 h-3 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant={isInCompare(product.id) ? "default" : "secondary"}
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => {
              if (!isInCompare(product.id)) {
                const compareItem: CompareItemType = {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: images[0] || "",
                  slug: product.slug,
                  specs,
                  brand: product.brand?.name || "",
                  category: product.category?.name || "",
                };
                addToCompare(compareItem);
                toast.success("Added to compare!");
              }
            }}
          >
            <GitCompareArrows className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <button
          onClick={() => navigateToProduct(product.id)}
          className="text-left w-full"
        >
          <p className="text-[10px] text-muted-foreground mb-0.5">
            {product.brand?.name || ""} • {product.category?.name || ""}
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
          disabled={product.stock === 0}
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
}
