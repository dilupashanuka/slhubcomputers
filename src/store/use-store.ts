// =============================================================================
// SL HUB COMPUTER - Zustand Store
// =============================================================================
// Purpose: Global state management using Zustand with localStorage persistence
// Features: Navigation, Cart, Wishlist, Compare list, Recently viewed products,
//           Category/Brand selection, Search, PC Builder state
// Storage Key: 'slhub-store' for localStorage persistence
// Updated: 2025-01 - Added 'prebuilt' view support
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ViewType,
  CartItemType,
  WishlistItemType,
  CompareItemType,
  PCBuilderComponent,
  CustomerType,
} from "@/types";

// ---------------------------------------------------------------------------
// Store Interface - All state and actions
// ---------------------------------------------------------------------------
interface SLHubStore {
  // ---- Navigation State ----
  currentView: ViewType;
  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  selectedProductId: string | null;
  searchQuery: string;

  // ---- Navigation Actions ----
  setCurrentView: (view: ViewType) => void;
  navigateToCategory: (categoryId: string, categoryName: string) => void;
  navigateToProduct: (productId: string) => void;
  navigateToSearch: (query: string) => void;

  // ---- Customer Auth State ----
  customer: CustomerType | null;
  isLoggedIn: boolean;

  // ---- Customer Auth Actions ----
  setCustomer: (customer: CustomerType | null) => void;
  loginCustomer: (customer: CustomerType) => void;
  logoutCustomer: () => void;

  // ---- Cart State ----
  cart: CartItemType[];

  // ---- Cart Actions ----
  addToCart: (item: CartItemType) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // ---- Wishlist State ----
  wishlist: WishlistItemType[];

  // ---- Wishlist Actions ----
  addToWishlist: (item: WishlistItemType) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // ---- Compare State ----
  compareList: CompareItemType[];

  // ---- Compare Actions ----
  addToCompare: (item: CompareItemType) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  // ---- Recently Viewed ----
  recentlyViewed: WishlistItemType[];

  // ---- Recently Viewed Actions ----
  addRecentlyViewed: (item: WishlistItemType) => void;

  // ---- PC Builder State ----
  pcBuilderComponents: PCBuilderComponent[];

  // ---- PC Builder Actions ----
  setPCBuilderComponent: (component: PCBuilderComponent) => void;
  removePCBuilderComponent: (category: string) => void;
  clearPCBuilder: () => void;
  getPCBuilderTotal: () => number;

  // ---- UI State ----
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // ---- Settings State ----
  siteSettings: any;
  setSiteSettings: (settings: any) => void;
}

// ---------------------------------------------------------------------------
// Store Creation with Persistence
// ---------------------------------------------------------------------------
export const useStore = create<SLHubStore>()(
  persist(
    (set, get) => ({
      // =====================================================================
      // Navigation State
      // =====================================================================
      currentView: "home",
      selectedCategoryId: null,
      selectedCategoryName: null,
      selectedProductId: null,
      searchQuery: "",

      setCurrentView: (view) =>
        set({
          currentView: view,
          isMobileMenuOpen: false,
        }),

      navigateToCategory: (categoryId, categoryName) =>
        set({
          currentView: "category",
          selectedCategoryId: categoryId,
          selectedCategoryName: categoryName,
          isMobileMenuOpen: false,
        }),

      navigateToProduct: (productId) =>
        set({
          currentView: "product",
          selectedProductId: productId,
          isMobileMenuOpen: false,
        }),

      navigateToSearch: (query) =>
        set({
          currentView: "search",
          searchQuery: query,
          isMobileMenuOpen: false,
        }),

      // =====================================================================
      // Cart State & Actions
      // =====================================================================
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.productId !== productId),
        })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((i) => i.productId !== productId)
              : state.cart.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // =====================================================================
      // Wishlist State & Actions
      // =====================================================================
      wishlist: [],

      addToWishlist: (item) =>
        set((state) => {
          if (state.wishlist.find((i) => i.productId === item.productId)) {
            return state;
          }
          return { wishlist: [...state.wishlist, item] };
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.productId !== productId),
        })),

      isInWishlist: (productId) => {
        return get().wishlist.some((i) => i.productId === productId);
      },

      // =====================================================================
      // Compare State & Actions
      // =====================================================================
      compareList: [],

      addToCompare: (item) =>
        set((state) => {
          if (state.compareList.find((i) => i.productId === item.productId)) {
            return state;
          }
          if (state.compareList.length >= 4) {
            return state; // Max 4 items in compare
          }
          return { compareList: [...state.compareList, item] };
        }),

      removeFromCompare: (productId) =>
        set((state) => ({
          compareList: state.compareList.filter((i) => i.productId !== productId),
        })),

      isInCompare: (productId) => {
        return get().compareList.some((i) => i.productId === productId);
      },

      clearCompare: () => set({ compareList: [] }),

      // =====================================================================
      // Recently Viewed State & Actions
      // =====================================================================
      recentlyViewed: [],

      addRecentlyViewed: (item) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (i) => i.productId !== item.productId
          );
          return {
            recentlyViewed: [item, ...filtered].slice(0, 10), // Keep max 10 items
          };
        }),

      // =====================================================================
      // PC Builder State & Actions
      // =====================================================================
      pcBuilderComponents: [],

      setPCBuilderComponent: (component) =>
        set((state) => ({
          pcBuilderComponents: [
            ...state.pcBuilderComponents.filter((c) => c.category !== component.category),
            component,
          ],
        })),

      removePCBuilderComponent: (category) =>
        set((state) => ({
          pcBuilderComponents: state.pcBuilderComponents.filter(
            (c) => c.category !== category
          ),
        })),

      clearPCBuilder: () => set({ pcBuilderComponents: [] }),

      getPCBuilderTotal: () => {
        return get().pcBuilderComponents.reduce((total, c) => total + c.price, 0);
      },

      // =====================================================================
      // Customer Auth State & Actions
      // =====================================================================
      customer: null,
      isLoggedIn: false,

      setCustomer: (customer) => set({ customer, isLoggedIn: !!customer }),

      loginCustomer: (customer) =>
        set({
          customer,
          isLoggedIn: true,
          currentView: "customer-account",
        }),

      logoutCustomer: () =>
        set({
          customer: null,
          isLoggedIn: false,
          currentView: "home",
        }),

      // =====================================================================
      // UI State
      // =====================================================================
      isMobileMenuOpen: false,
      setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      // =====================================================================
      // Settings State
      // =====================================================================
      siteSettings: null,
      setSiteSettings: (settings) => set({ siteSettings: settings }),
    }),
    {
      name: "slhub-store", // localStorage key
      // Only persist these fields (exclude functions and transient state)
      partialize: (state) => ({
        currentView: state.currentView,
        selectedCategoryId: state.selectedCategoryId,
        selectedCategoryName: state.selectedCategoryName,
        selectedProductId: state.selectedProductId,
        searchQuery: state.searchQuery,
        cart: state.cart,
        wishlist: state.wishlist,
        compareList: state.compareList,
        recentlyViewed: state.recentlyViewed,
        pcBuilderComponents: state.pcBuilderComponents,
        customer: state.customer,
        isLoggedIn: state.isLoggedIn,
        siteSettings: state.siteSettings,
      }),
    }
  )
);
