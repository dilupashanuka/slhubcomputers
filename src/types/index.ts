// =============================================================================
// SL HUB COMPUTER - TypeScript Type Definitions
// =============================================================================
// Purpose: Central type definitions for the entire application
// Features: Product, Category, Brand, Cart, Wishlist, Compare, Order types,
//           ViewType for client-side routing, PrebuiltPC type
// Updated: 2025-01 - Added PrebuiltPC types and 'prebuilt' ViewType
// =============================================================================

// ---------------------------------------------------------------------------
// Navigation / View Types - Client-side routing via Zustand
// ---------------------------------------------------------------------------
export type ViewType =
  | "home"
  | "category"
  | "product"
  | "pc-builder"
  | "cart"
  | "checkout"
  | "wishlist"
  | "search"
  | "compare"
  | "about"
  | "contact"
  | "faq"
  | "shipping"
  | "returns"
  | "terms"
  | "prebuilt"
  | "order-tracking"
  | "customer-login"
  | "customer-account"
  | "affiliate"
  | "gift-card";

// ---------------------------------------------------------------------------
// Category Types
// ---------------------------------------------------------------------------
export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
  children?: CategoryType[];
}

// ---------------------------------------------------------------------------
// Brand Types
// ---------------------------------------------------------------------------
export interface BrandType {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  country: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

// ---------------------------------------------------------------------------
// Product Types
// ---------------------------------------------------------------------------
export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  price: number;
  originalPrice: number | null;
  images: string; // JSON string of image URLs
  specs: string; // JSON string of specifications
  categoryId: string;
  brandId: string;
  stock: number;
  sku: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  isDeal: boolean;
  dealEndDate: string | null;
  isBestSeller: boolean;
  tags: string | null;
  warranty: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoryType;
  brand?: BrandType;
  reviews?: ReviewType[];
  _count?: { reviews: number };
  // Parsed helpers (computed on frontend)
  parsedImages?: string[];
  parsedSpecs?: Record<string, string>;
  averageRating?: number;
}

// ---------------------------------------------------------------------------
// Review Types
// ---------------------------------------------------------------------------
export interface ReviewType {
  id: string;
  productId: string;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Cart Types
// ---------------------------------------------------------------------------
export interface CartItemType {
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  quantity: number;
  slug: string;
  stock: number;
}

// ---------------------------------------------------------------------------
// Wishlist Item
// ---------------------------------------------------------------------------
export interface WishlistItemType {
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Compare Item
// ---------------------------------------------------------------------------
export interface CompareItemType {
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  slug: string;
  specs: Record<string, string>;
  brand: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Order Types
// ---------------------------------------------------------------------------
export interface OrderType {
  id: string;
  orderNumber: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  discount: number;
  items: OrderItemType[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemType {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Banner Types
// ---------------------------------------------------------------------------
export interface BannerType {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  bgColor: string | null;
  order: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Service Types
// ---------------------------------------------------------------------------
export interface ServiceType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  features: string | null;
  price: string | null;
  order: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Contact Message Types
// ---------------------------------------------------------------------------
export interface ContactMessageType {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Site Settings Types
// ---------------------------------------------------------------------------
export interface SiteSettingsType {
  id: string;
  siteName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string | null;
  youtube: string | null;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingAbove: number;
  taxRate: number;
  openingHours: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string | null;
  announcementBar: string | null;
  primaryColor: string;
  accentColor: string | null;
  enableCCTV: boolean;
  enablePCBuilder: boolean;
}

// ---------------------------------------------------------------------------
// Pre-Built PC Types - NEW
// ---------------------------------------------------------------------------
export interface PrebuiltPCType {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "budget" | "gaming" | "office" | "workstation";
  price: number;
  originalPrice: number | null;
  image: string;
  specs: string; // JSON: { cpu, gpu, ram, storage, psu, case, cooler, motherboard }
  features: string | null; // JSON array of feature strings
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  // Parsed helpers (computed on frontend)
  parsedSpecs?: PrebuiltPCSpecs;
  parsedFeatures?: string[];
}

export interface PrebuiltPCSpecs {
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  psu?: string;
  case?: string;
  cooler?: string;
  motherboard?: string;
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// PC Builder Types
// ---------------------------------------------------------------------------
export interface PCBuilderComponent {
  category: string;
  categoryId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
}

// ---------------------------------------------------------------------------
// FAQ Types
// ---------------------------------------------------------------------------
export interface FAQType {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Testimonial Types
// ---------------------------------------------------------------------------
export interface TestimonialType {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// PageContent Types
// ---------------------------------------------------------------------------
export interface PageContentType {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// FAQ Types
// ---------------------------------------------------------------------------
export interface FAQType {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Testimonial Types
// ---------------------------------------------------------------------------
export interface TestimonialType {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// PageContent Types
// ---------------------------------------------------------------------------
export interface PageContentType {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Customer Types
// ---------------------------------------------------------------------------
export interface CustomerType {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  addresses: string | null; // JSON array
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orders?: Order2Type[];
  reviews?: CustomerReviewType[];
}

export interface Order2Type {
  id: string;
  orderNumber: string;
  customerId: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  discount: number;
  couponCode: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  statusHistory: string | null;
  items: OrderItem2Type[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem2Type {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerReviewType {
  id: string;
  productId: string;
  customerId: string | null;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Filter Types
// ---------------------------------------------------------------------------
export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  isDeal?: boolean;
  isBestSeller?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}
