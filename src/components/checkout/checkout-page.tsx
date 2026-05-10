// =============================================================================
// SL HUB COMPUTER - Checkout Page Component
// =============================================================================
// Purpose: Complete checkout form that saves orders to the database
// Features: Customer details form, order summary, payment method selection,
//           order placement via API, WhatsApp order option, success state
// Business: COD (Cash on Delivery) and Bank Transfer as payment methods
//           Free shipping on orders over Rs. 25,000
// API: POST /api/orders to create order in database
// =============================================================================

"use client";

import { useState } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  Gift,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  CheckCircle2,
  MessageCircle,
  Loader2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Shipping Configuration
// ---------------------------------------------------------------------------
const FREE_SHIPPING_ABOVE = 25000;
const SHIPPING_FEE = 500;

// ---------------------------------------------------------------------------
// Sri Lankan Districts for Address Dropdown
// ---------------------------------------------------------------------------
const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Trincomalee", "Batticaloa", "Ampara",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

// ---------------------------------------------------------------------------
// Checkout Form Data Interface
// ---------------------------------------------------------------------------
interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: "cod" | "bank_transfer";
}

// ---------------------------------------------------------------------------
// Checkout Page Component
// ---------------------------------------------------------------------------
export function CheckoutPage() {
  const {
    cart,
    getCartTotal,
    clearCart,
    setCurrentView,
  } = useStore();

  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cod",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // ---- Derived Values ----
  const subtotal = getCartTotal();
  const shippingFee = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // ---- Handle Form Field Change ----
  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Validate Form ----
  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return false;
    }
    if (!form.address.trim()) {
      toast.error("Please enter your delivery address");
      return false;
    }
    if (!form.city) {
      toast.error("Please select your district/city");
      return false;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    return true;
  };

  // ---- Generate Order Number ----
  const generateOrderNumber = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SLH-${dateStr}-${random}`;
  };

  // ---- Submit Order to API ----
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const orderData = {
        orderNumber: generateOrderNumber(),
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city,
        notes: form.notes.trim() || null,
        subtotal,
        shipping: shippingFee,
        total,
        status: "pending",
        paymentMethod: form.paymentMethod,
        items: {
          create: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        setOrderNumber(data.data.orderNumber);
        setOrderSuccess(true);
        clearCart();
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- WhatsApp Checkout ----
  const handleWhatsAppCheckout = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please fill in at least your name and phone number");
      return;
    }

    const itemLines = cart
      .map((item) => `• ${item.name} x${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const message = `Hi SL HUB COMPUTER! I'd like to place an order:\n\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city}\n${form.notes ? `*Notes:* ${form.notes}\n` : ""}\n${itemLines}\n\nSubtotal: Rs. ${subtotal.toLocaleString()}\nShipping: ${shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString()}`}\n*Total: Rs. ${total.toLocaleString()}*\n*Payment:* ${form.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`;

    window.open(
      `https://wa.me/94710678944?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ---- WhatsApp Order Confirmation ----
  const handleWhatsAppConfirmation = async () => {
    if (!orderNumber) return;
    try {
      const res = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (data.success && data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, "_blank");
      } else {
        toast.error(data.error || "Failed to generate WhatsApp message");
      }
    } catch {
      toast.error("Failed to connect to WhatsApp");
    }
  };

  // ---- Order Success State ----
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-green-50 dark:bg-green-950 rounded-2xl p-8">
          <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3">
            Order Placed Successfully!
          </h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your order, <strong>{form.name}</strong>! We will
            contact you shortly to confirm your order.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 inline-block">
            <p className="text-xs text-muted-foreground mb-1">Order Number</p>
            <p className="text-xl font-bold text-blue-600 font-mono">
              {orderNumber}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Save this order number for tracking. You can also call us at{" "}
            <a href="tel:0710678944" className="text-blue-600 hover:underline font-medium">
              071 067 8944
            </a>{" "}
            to check your order status.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 mb-4">
            <Button
              onClick={() => setCurrentView("order-tracking")}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Track Your Order
            </Button>

            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              size="lg"
              onClick={handleWhatsAppConfirmation}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send to WhatsApp
            </Button>

            <Button
              onClick={() => setCurrentView("home")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Empty Cart Redirect ----
  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out.
        </p>
        <Button
          onClick={() => setCurrentView("home")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  // ---- Main Checkout Form ----
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView("cart")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Complete your order details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---- Left: Checkout Form ---- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="07X XXX XXXX"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">
                  Full Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="House number, street name, area..."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">
                  District / City <span className="text-red-500">*</span>
                </Label>
                <select
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select your district</option>
                  {SRI_LANKA_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Any special instructions for delivery..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <RadioGroup
                value={form.paymentMethod}
                onValueChange={(val) => updateField("paymentMethod", val)}
                className="space-y-3"
              >
                {/* Cash on Delivery */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => updateField("paymentMethod", "cod")}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="font-medium cursor-pointer flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Cash on Delivery (COD)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay when you receive your order. No advance payment needed.
                    </p>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.paymentMethod === "bank_transfer"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => updateField("paymentMethod", "bank_transfer")}
                >
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <div className="flex-1">
                    <Label htmlFor="bank_transfer" className="font-medium cursor-pointer flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Bank Transfer
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Transfer the total amount to our bank account. We will confirm
                      and ship upon verification.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* ---- Right: Order Summary ---- */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Cart Items Preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        x{item.quantity} • Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
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
                {shippingFee > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">
                        Add Rs. {(FREE_SHIPPING_ABOVE - subtotal).toLocaleString()} more for free shipping!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={submitting}
                  onClick={handleSubmitOrder}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleWhatsAppCheckout}
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                  Order via WhatsApp
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Secure ordering - Your data is safe</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Delivery within 2-5 business days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Call 071 067 8944 for order support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
