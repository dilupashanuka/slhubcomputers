// =============================================================================
// SL HUB COMPUTER - Product Detail Component
// =============================================================================
// Purpose: Full product detail view with image gallery, specs table, reviews,
//          add to cart, wishlist toggle, and related products
// Features: Image carousel, quantity selector, specs table, star ratings,
//           review list, WhatsApp order, related products grid
// Uses: useStore for navigation, cart, and wishlist actions
// API: Fetches product data from /api/products/{id}
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ProductType,
  CartItemType,
  WishlistItemType,
  CompareItemType,
  ReviewType,
} from "@/types";

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface ProductDetailProps {
  productId?: string;
}

// ---------------------------------------------------------------------------
// Star Rating Display Sub-component
// ---------------------------------------------------------------------------
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Detail Main Component
// ---------------------------------------------------------------------------
export function ProductDetail({ productId }: ProductDetailProps) {
  const {
    selectedProductId,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToCompare,
    navigateToProduct,
    setCurrentView,
    addRecentlyViewed,
  } = useStore();

  // Use prop or fallback to store-selected product
  const activeProductId = productId || selectedProductId;

  // ---- Local State ----
  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // ---- Fetch product data ----
  useEffect(() => {
    if (!activeProductId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/products/${activeProductId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const prod = data.data as ProductType;
          setProduct(prod);

          // Add to recently viewed
          const images: string[] = JSON.parse(prod.images || "[]");
          addRecentlyViewed({
            productId: prod.id,
            name: prod.name,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: images[0] || "",
            slug: prod.slug,
          });

          // Fetch related products from same category
          if (prod.categoryId) {
            fetch(
              `/api/products?categoryId=${prod.categoryId}&limit=4`
            )
              .then((r) => r.json())
              .then((relData) => {
                if (relData.success) {
                  // Filter out current product
                  setRelatedProducts(
                    relData.data.filter(
                      (p: ProductType) => p.id !== prod.id
                    )
                  );
                }
              })
              .catch(() => {});
          }
        } else {
          setError("Product not found");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [activeProductId, addRecentlyViewed]);

  // ---- Derived Values ----
  const images: string[] = product
    ? JSON.parse(product.images || "[]")
    : [];
  const specs: Record<string, string> = product
    ? JSON.parse(product.specs || "{}")
    : {};
  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;
  const reviews: ReviewType[] = product?.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const wishlisted = product ? isInWishlist(product.id) : false;

  // ---- Handlers ----
  const handleAddToCart = () => {
    if (!product) return;
    const cartItem: CartItemType = {
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: images[0] || "",
      quantity,
      slug: product.slug,
      stock: product.stock,
    };
    addToCart(cartItem);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
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
  };

  const handleAddToCompare = () => {
    if (!product) return;
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
    toast.success("Added to compare list!");
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I'm interested in *${product.name}* (Rs. ${product.price.toLocaleString()}) from SL HUB COMPUTER. Is this available?`;
    window.open(
      `https://wa.me/94710678944?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} - Rs. ${product.price.toLocaleString()} at SL HUB COMPUTER`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {error || "Product not found"}
        </h2>
        <p className="text-muted-foreground mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
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
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => setCurrentView("home")}
          className="hover:text-blue-600 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        {product.category && (
          <>
            <button
              onClick={() =>
                useStore
                  .getState()
                  .navigateToCategory(product.category!.id, product.category!.name)
              }
              className="hover:text-blue-600 transition-colors"
            >
              {product.category.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* ---- Image Gallery ---- */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-20 h-20 text-gray-300" />
              </div>
            )}

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full"
                  onClick={() =>
                    setSelectedImage(
                      selectedImage > 0
                        ? selectedImage - 1
                        : images.length - 1
                    )
                  }
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full"
                  onClick={() =>
                    setSelectedImage(
                      selectedImage < images.length - 1
                        ? selectedImage + 1
                        : 0
                    )
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.isNew && (
                <Badge className="bg-blue-600">New</Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-red-500">-{discount}%</Badge>
              )}
              {product.isOnSale && (
                <Badge className="bg-orange-500">Sale</Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-blue-600"
                      : "border-transparent hover:border-blue-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Product Info ---- */}
        <div className="space-y-4">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.brand?.name && (
              <span className="font-medium text-blue-600">
                {product.brand.name}
              </span>
            )}
            {product.brand?.name && product.category?.name && (
              <span>|</span>
            )}
            {product.category?.name && <span>{product.category.name}</span>}
          </div>

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-3">
            <StarRating rating={averageRating} />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} review
              {reviews.length !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-blue-600">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice &&
              product.originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            {discount > 0 && (
              <Badge className="bg-red-500 text-sm">
                Save {discount}%
              </Badge>
            )}
          </div>

          {/* Short Description */}
          {product.shortDesc && (
            <p className="text-muted-foreground">{product.shortDesc}</p>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              product.stock <= 5 ? (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600"
                >
                  Only {product.stock} left in stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  <Check className="w-3 h-3 mr-1" /> In Stock
                </Badge>
              )
            ) : (
              <Badge
                variant="outline"
                className="text-red-600 border-red-600"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Warranty */}
          {product.warranty && (
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Warranty: {product.warranty}</span>
            </div>
          )}

          <Separator />

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleToggleWishlist}
              className={wishlisted ? "border-red-500 text-red-500" : ""}
            >
              <Heart
                className={`w-5 h-5 mr-2 ${wishlisted ? "fill-current" : ""}`}
              />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCompare}
            >
              Compare
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-1" /> Order via WhatsApp
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium">Free Delivery</span>
              <span className="text-[10px] text-muted-foreground">
                Orders over Rs. 5,000
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium">Warranty</span>
              <span className="text-[10px] text-muted-foreground">
                Genuine Products
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <RotateCcw className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium">7-Day Returns</span>
              <span className="text-[10px] text-muted-foreground">
                Easy Returns
              </span>
            </div>
          </div>

          {/* Call to Order */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Prefer to order by phone?
              </p>
              <a
                href="tel:0710678944"
                className="text-blue-600 font-bold hover:underline"
              >
                071 067 8944
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Product Details Tabs ---- */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description" className="mt-4">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specs" className="mt-4">
          {Object.keys(specs).length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(specs).map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={
                        idx % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-800"
                          : "bg-white dark:bg-gray-900"
                      }
                    >
                      <td className="px-4 py-3 font-medium text-sm w-1/3 border-r">
                        {key}
                      </td>
                      <td className="px-4 py-3 text-sm">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No specifications available for this product.
            </p>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium">No reviews yet</p>
              <p className="text-muted-foreground">
                Be the first to review this product!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={averageRating} size={14} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviews.length} review
                    {reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {review.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    {review.title && (
                      <p className="font-medium text-sm mb-1">
                        {review.title}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ---- Related Products ---- */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Related Products</h2>
            <Button
              variant="ghost"
              onClick={() =>
                product.categoryId &&
                useStore
                  .getState()
                  .navigateToCategory(
                    product.categoryId,
                    product.category?.name || ""
                  )
              }
              className="text-blue-600"
            >
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
