// =============================================================================
// SL HUB COMPUTER - Product Detail Component
// =============================================================================
// Purpose: Full product detail view with image gallery (zoom/lightbox), video
//          embeds, reviews (submit/display/sort), and related products
// Features: Image carousel with zoom & lightbox, YouTube/TikTok/Facebook video
//           embeds, star rating selector, review form, review sort, related
//           products with horizontal scroll
// Uses: useStore for navigation, cart, and wishlist actions
// API: Fetches product data from /api/products/{id}, reviews from /api/reviews
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/store/use-store";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  X,
  ZoomIn,
  Play,
  Loader2,
  ThumbsUp,
  TrendingUp,
  Bell,
  BellRing,
  ArrowDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
// Video URL Interface
// ---------------------------------------------------------------------------
interface VideoInfo {
  type: "youtube" | "tiktok" | "facebook";
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  id: string;
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
// Interactive Star Rating Selector
// ---------------------------------------------------------------------------
function StarRatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value} star{value !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video Embed Helper - Parse video URLs from tags
// ---------------------------------------------------------------------------
function parseVideoUrls(tagsJson: string | null): VideoInfo[] {
  if (!tagsJson) return [];
  let tags: string[];
  try {
    tags = JSON.parse(tagsJson);
  } catch {
    return [];
  }
  if (!Array.isArray(tags)) return [];

  const videos: VideoInfo[] = [];

  for (const tag of tags) {
    if (typeof tag !== "string") continue;

    // YouTube: various URL formats
    const ytMatch = tag.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      videos.push({
        type: "youtube",
        url: tag,
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`,
        id: ytMatch[1],
      });
      continue;
    }

    // TikTok: various URL formats
    const tiktokMatch = tag.match(
      /tiktok\.com\/(?:@[^/]+\/video\/|embed\/v2\/)(\d+)/
    );
    if (tiktokMatch) {
      videos.push({
        type: "tiktok",
        url: tag,
        embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
        thumbnailUrl: "",
        id: tiktokMatch[1],
      });
      continue;
    }

    // Facebook: video URLs
    const fbMatch = tag.match(
      /facebook\.com\/.*(?:\/videos\/|watch\/?\?v=)(\d+)/
    );
    if (fbMatch) {
      videos.push({
        type: "facebook",
        url: tag,
        embedUrl: `https://www.facebook.com/video/embed?video_id=${fbMatch[1]}`,
        thumbnailUrl: "",
        id: fbMatch[1],
      });
      continue;
    }

    // Also check if it's just a URL starting with youtube/tiktok/facebook
    if (tag.startsWith("https://www.youtube.com/") || tag.startsWith("https://youtube.com/")) {
      const vid = tag.match(/v=([a-zA-Z0-9_-]{11})/);
      if (vid) {
        videos.push({
          type: "youtube",
          url: tag,
          embedUrl: `https://www.youtube.com/embed/${vid[1]}`,
          thumbnailUrl: `https://img.youtube.com/vi/${vid[1]}/mqdefault.jpg`,
          id: vid[1],
        });
      }
    } else if (tag.startsWith("https://www.tiktok.com/") || tag.startsWith("https://tiktok.com/")) {
      const tid = tag.match(/video\/(\d+)/);
      if (tid) {
        videos.push({
          type: "tiktok",
          url: tag,
          embedUrl: `https://www.tiktok.com/embed/v2/${tid[1]}`,
          thumbnailUrl: "",
          id: tid[1],
        });
      }
    } else if (tag.startsWith("https://www.facebook.com/") || tag.startsWith("https://facebook.com/")) {
      const fid = tag.match(/videos\/(\d+)/);
      if (fid) {
        videos.push({
          type: "facebook",
          url: tag,
          embedUrl: `https://www.facebook.com/video/embed?video_id=${fid[1]}`,
          thumbnailUrl: "",
          id: fid[1],
        });
      }
    }
  }

  return videos;
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

  // ---- Lightbox State ----
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // ---- Video State ----
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  // ---- Review State ----
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: [] as { star: number; count: number; percentage: number }[],
  });
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 0,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // ---- Price History State ----
  const [priceHistory, setPriceHistory] = useState<
    { date: string; price: number; originalPrice: number | null }[]
  >([]);
  const [priceStats, setPriceStats] = useState({
    lowestPrice: 0,
    highestPrice: 0,
    priceDroppedRecently: false,
    lowestInDays: 0,
  });

  // ---- Stock Alert State ----
  const [alertEmail, setAlertEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

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
              `/api/products?categoryId=${prod.categoryId}&limit=8`
            )
              .then((r) => r.json())
              .then((relData) => {
                if (relData.success) {
                  const sameCategory = relData.data.filter(
                    (p: ProductType) => p.id !== prod.id
                  );
                  if (sameCategory.length >= 4) {
                    setRelatedProducts(sameCategory.slice(0, 8));
                  } else if (prod.brandId) {
                    // Fill with same brand products
                    fetch(
                      `/api/products?brandId=${prod.brandId}&limit=8`
                    )
                      .then((r) => r.json())
                      .then((brandData) => {
                        if (brandData.success) {
                          const sameBrand = brandData.data.filter(
                            (p: ProductType) =>
                              p.id !== prod.id &&
                              !sameCategory.some((c: ProductType) => c.id === p.id)
                          );
                          const combined = [
                            ...sameCategory,
                            ...sameBrand,
                          ].slice(0, 8);
                          setRelatedProducts(combined);
                        }
                      })
                      .catch(() => {});
                  } else {
                    setRelatedProducts(sameCategory);
                  }
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

  // ---- Fetch reviews separately for sorting ----
  const fetchReviews = useCallback(() => {
    if (!activeProductId) return;
    fetch(
      `/api/reviews?productId=${activeProductId}&sort=${reviewSort}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.data);
          if (data.stats) {
            setReviewStats(data.stats);
          }
        }
      })
      .catch(() => {});
  }, [activeProductId, reviewSort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ---- Fetch price history ----
  useEffect(() => {
    if (!activeProductId) return;
    fetch(`/api/products/${activeProductId}/price-history`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPriceHistory(
            data.data.map((h: { date: string; price: number; originalPrice: number | null }) => ({
              date: h.date,
              price: h.price,
              originalPrice: h.originalPrice,
            }))
          );
          if (data.stats) setPriceStats(data.stats);
        }
      })
      .catch(() => {});
  }, [activeProductId]);

  // ---- Derived Values ----
  const images: string[] = product
    ? JSON.parse(product.images || "[]")
    : [];
  const specs: Record<string, string> = product
    ? JSON.parse(product.specs || "{}")
    : {};
  const videos: VideoInfo[] = product
    ? parseVideoUrls(product.tags)
    : [];
  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;
  const averageRating = reviewStats.averageRating || 0;
  const totalReviews = reviewStats.totalReviews || 0;
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

  // ---- Image Zoom Handlers ----
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleOpenLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  // ---- Review Submit Handler ----
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (reviewForm.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewForm,
          productId: product.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Review submitted successfully!");
        setReviewForm({ name: "", email: "", rating: 0, title: "", comment: "" });
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
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
        {/* ---- Image Gallery with Zoom ---- */}
        <div className="space-y-3">
          {/* Main Image with Zoom */}
          <div
            className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-zoom-in group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleImageMouseMove}
            onClick={() => handleOpenLightbox(selectedImage)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={
                      isZoomed
                        ? {
                            transform: "scale(2)",
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : {}
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-20 h-20 text-gray-300" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Zoom indicator */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3 h-3" /> Click to enlarge
            </div>

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(
                      selectedImage > 0
                        ? selectedImage - 1
                        : images.length - 1
                    );
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(
                      selectedImage < images.length - 1
                        ? selectedImage + 1
                        : 0
                    );
                  }}
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

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-transparent hover:border-blue-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
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
              {averageRating.toFixed(1)} ({totalReviews} review
              {totalReviews !== 1 ? "s" : ""})
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

          {/* Notify Me When Available - Only shown when out of stock */}
          {product.stock === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold">Notify Me When Available</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Enter your email and we&apos;ll let you know when this item is back in stock.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  You&apos;re subscribed! We&apos;ll email you when this item is back in stock.
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="flex-1 h-9 text-sm bg-white dark:bg-gray-900"
                    disabled={subscribing}
                  />
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    disabled={subscribing || !alertEmail}
                    onClick={async () => {
                      if (!alertEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alertEmail)) {
                        toast.error("Please enter a valid email address");
                        return;
                      }
                      setSubscribing(true);
                      try {
                        const res = await fetch("/api/stock-alerts/subscribe", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ productId: product.id, email: alertEmail }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setSubscribed(true);
                          toast.success(data.message);
                          if (data.alreadySubscribed) {
                            setSubscribed(true);
                          }
                        } else {
                          toast.error(data.error || "Failed to subscribe");
                        }
                      } catch {
                        toast.error("Failed to subscribe. Please try again.");
                      } finally {
                        setSubscribing(false);
                      }
                    }}
                  >
                    {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 mr-1" />}
                    Notify Me
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Image Lightbox ---- */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-4xl w-full p-0 bg-black border-gray-800 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {product.name} - Image {lightboxIndex + 1}
          </DialogTitle>
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={lightboxIndex}
                src={images[lightboxIndex]}
                alt={`${product.name} ${lightboxIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={() =>
                    setLightboxIndex(
                      lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1
                    )
                  }
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={() =>
                    setLightboxIndex(
                      lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0
                    )
                  }
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded-full text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail strip in lightbox */}
          {images.length > 1 && (
            <div className="bg-gray-900 p-3 flex gap-2 overflow-x-auto justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                    lightboxIndex === idx
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-500"
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
        </DialogContent>
      </Dialog>

      {/* ---- Product Details Tabs ---- */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          {videos.length > 0 && (
            <TabsTrigger value="videos" className="gap-1">
              🎬 Videos
            </TabsTrigger>
          )}
          <TabsTrigger value="reviews">
            Reviews ({totalReviews})
          </TabsTrigger>
          <TabsTrigger value="price-history" className="gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Price History
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

        {/* Price History Tab */}
        <TabsContent value="price-history" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            {/* Header with badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Price History
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Track price changes for this product
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {priceStats.priceDroppedRecently && (
                  <Badge className="bg-emerald-500 text-white gap-1">
                    <ArrowDownRight className="w-3 h-3" /> Price Drop!
                  </Badge>
                )}
                {priceStats.lowestInDays > 0 && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400">
                    Lowest in {priceStats.lowestInDays} day{priceStats.lowestInDays !== 1 ? "s" : ""}
                  </Badge>
                )}
                {priceStats.lowestPrice > 0 && (
                  <Badge variant="outline" className="border-gray-400 dark:border-gray-600">
                    Lowest: Rs. {priceStats.lowestPrice.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Chart */}
            {priceHistory.length > 1 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={priceHistory.map((h) => ({
                      date: new Date(h.date).toLocaleDateString("en-LK", {
                        month: "short",
                        day: "numeric",
                      }),
                      price: h.price,
                      originalPrice: h.originalPrice,
                    }))}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="originalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v: number) => `Rs.${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        `Rs. ${value.toLocaleString()}`,
                        name === "price" ? "Selling Price" : "Original Price",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="originalPrice"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      fill="url(#originalGradient)"
                      connectNulls
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No price history yet</p>
                <p className="text-sm">Price changes will appear here when the product price is updated.</p>
              </div>
            )}

            {/* Price Stats Cards */}
            {priceHistory.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
                  <p className="text-sm font-bold text-emerald-600">Rs. {product.price.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lowest</p>
                  <p className="text-sm font-bold">Rs. {priceStats.lowestPrice.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest</p>
                  <p className="text-sm font-bold">Rs. {priceStats.highestPrice.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Changes</p>
                  <p className="text-sm font-bold">{priceHistory.length}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        {videos.length > 0 && (
          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveVideoIndex(idx)}
                >
                  {/* Video Thumbnail / Preview */}
                  {activeVideoIndex === idx ? (
                    <iframe
                      src={video.embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${video.type} video`}
                    />
                  ) : (
                    <>
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={`${video.type} video thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <Play className="w-16 h-16 text-gray-500" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      {/* Video type badge */}
                      <Badge className="absolute top-3 left-3 capitalize">
                        {video.type}
                      </Badge>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              {/* Left - Big rating */}
              <div className="text-center md:text-left shrink-0">
                <div className="text-5xl font-bold text-blue-600">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size={18} />
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {totalReviews} review
                  {totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Right - Rating distribution bars */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const dist = reviewStats.distribution?.find(
                    (d) => d.star === star
                  );
                  const count = dist?.count || 0;
                  const pct = dist?.percentage || 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right">{star}★</span>
                      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-yellow-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sort & Review List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Customer Reviews</h3>
                <Select
                  value={reviewSort}
                  onValueChange={setReviewSort}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg font-medium">No reviews yet</p>
                  <p className="text-muted-foreground">
                    Be the first to review this product!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      className="border rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
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
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
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
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* ---- Review Form ---- */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Your Rating *</Label>
                  <StarRatingSelector
                    value={reviewForm.rating}
                    onChange={(rating) =>
                      setReviewForm((prev) => ({ ...prev, rating }))
                    }
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-name">Name *</Label>
                    <Input
                      id="review-name"
                      placeholder="Your name"
                      value={reviewForm.name}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-email">Email</Label>
                    <Input
                      id="review-email"
                      type="email"
                      placeholder="your@email.com"
                      value={reviewForm.email}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="review-title">Review Title</Label>
                  <Input
                    id="review-title"
                    placeholder="Summarize your experience"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="review-comment">Your Review *</Label>
                  <Textarea
                    id="review-comment"
                    placeholder="Share your experience with this product..."
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ---- Related Products ---- */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">You May Also Like</h2>
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
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="shrink-0 w-[200px] sm:w-[220px] md:w-[240px] snap-start"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
