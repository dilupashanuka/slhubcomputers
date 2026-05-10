// =============================================================================
// SL HUB COMPUTER - Cart Page Component
// =============================================================================
// Purpose: Full shopping cart page with item management and checkout options
// Features: Item list with quantity controls, order summary with free shipping
//           threshold, checkout via WhatsApp or phone call, empty cart state
// Uses: useStore for cart state and actions
// Business: Free shipping on orders over Rs. 5,000, WhatsApp ordering at 071 067 8944
// =============================================================================

"use client";

import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Phone,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Gift,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Free Shipping Threshold (LKR)
// ---------------------------------------------------------------------------
const FREE_SHIPPING_ABOVE = 5000;
const SHIPPING_FEE = 300;

// ---------------------------------------------------------------------------
// Cart Page Component
// ---------------------------------------------------------------------------
export function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    setCurrentView,
  } = useStore();

  // ---- Derived Values ----
  const subtotal = getCartTotal();
  const shippingFee = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_ABOVE) * 100, 100);
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_ABOVE - subtotal);

  // ---- Handlers ----
  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeFromCart(productId);
        toast.success("Item removed from cart");
      } else if (newQty > item.stock) {
        toast.error(`Only ${item.stock} items available`);
      } else {
        updateCartQuantity(productId, newQty);
      }
    }
  };

  const handleRemoveItem = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  // ---- Checkout via WhatsApp ----
  const handleWhatsAppCheckout = () => {
    const itemLines = cart
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}`
      )
      .join("\n");
    const message = `Hi SL HUB COMPUTER! I'd like to order:\n\n${itemLines}\n\nSubtotal: Rs. ${subtotal.toLocaleString()}\nShipping: ${shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString()}`}\n*Total: Rs. ${total.toLocaleString()}*\n\nPlease confirm availability and delivery details.`;
    window.open(
      `https://wa.me/94710678944?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ---- Empty Cart State ----
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Button
          onClick={() => setCurrentView("home")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
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
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---- Left: Cart Items ---- */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Item Image */}
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                    onClick={() =>
                      useStore
                        .getState()
                        .navigateToProduct(item.productId)
                    }
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors truncate"
                      onClick={() =>
                        useStore
                          .getState()
                          .navigateToProduct(item.productId)
                      }
                    >
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-blue-600">
                        Rs. {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            Rs. {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                    </div>

                    {item.stock <= 5 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Only {item.stock} left
                      </p>
                    )}

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.productId, -1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.productId, 1)
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">
                          Rs.{" "}
                          {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleRemoveItem(item.productId, item.name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ---- Right: Order Summary ---- */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Free Shipping Progress */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                {subtotal < FREE_SHIPPING_ABOVE ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Rs. {amountForFreeShipping.toLocaleString()} away from
                        free shipping!
                      </span>
                    </div>
                    <Progress value={shippingProgress} className="h-2" />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      You qualify for FREE shipping! 🎉
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)}{" "}
                    items)
                  </span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-600 font-medium"
                        : ""
                    }
                  >
                    {shippingFee === 0
                      ? "FREE"
                      : `Rs. ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={() => setCurrentView("checkout")}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" /> Proceed to Checkout
                </Button>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleWhatsAppCheckout}
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Order via
                  WhatsApp
                </Button>

                <a href="tel:0710678944" className="block">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Call to Order: 071 067
                    8944
                  </Button>
                </a>
              </div>

              {/* Trust Info */}
              <div className="text-center space-y-1 pt-2">
                <p className="text-xs text-muted-foreground">
                  🔒 Secure ordering via WhatsApp
                </p>
                <p className="text-xs text-muted-foreground">
                  ✓ Genuine products with warranty
                </p>
                <p className="text-xs text-muted-foreground">
                  ✓ Free delivery on orders over Rs. 5,000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
