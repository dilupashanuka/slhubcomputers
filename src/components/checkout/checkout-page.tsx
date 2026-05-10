// =============================================================================
// SL HUB COMPUTER - Checkout Page Component
// =============================================================================
// Purpose: Complete checkout form with integrated shipping calculator
// Features: Customer details form, order summary, payment method selection,
//           shipping calculator with zone-based pricing, express delivery,
//           COD availability, free shipping progress bar,
//           order placement via API, WhatsApp order option, success state
// Business: COD (Cash on Delivery) and Bank Transfer as payment methods
//           Zone-based shipping with free delivery thresholds
// API: POST /api/orders to create order, POST /api/shipping/calculate
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Package,
  AlertCircle,
  Banknote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SRI_LANKA_DISTRICTS, getZoneForDistrict } from "@/lib/shipping";

// ---------------------------------------------------------------------------
// Shipping calculation result type
// ---------------------------------------------------------------------------
interface ShippingCalculation {
  shippingCost: number;
  estimatedDays: [number, number];
  codAvailable: boolean;
  zoneName: string;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
  deliveryType: "standard" | "express";
  estimatedDelivery?: {
    minLabel: string;
    maxLabel: string;
  };
  breakdown: {
    baseRate: number;
    weightCharge: number;
    expressSurcharge: number;
    discount: number;
  };
}

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
  deliveryType: "standard" | "express";
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
    deliveryType: "standard",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [shippingCalc, setShippingCalc] = useState<ShippingCalculation | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Gift card state
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardChecking, setGiftCardChecking] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{
    code: string;
    balance: number;
    name: string;
  } | null>(null);
  const [giftCardError, setGiftCardError] = useState("");

  // ---- Derived Values ----
  const subtotal = getCartTotal();

  // ---- Calculate shipping when city or delivery type changes ----
  const calculateShippingCost = useCallback(async () => {
    if (!form.city) {
      setShippingCalc(null);
      return;
    }

    setCalculatingShipping(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          items,
          orderSubtotal: subtotal,
          deliveryType: form.deliveryType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShippingCalc({
          shippingCost: data.data.shippingCost,
          estimatedDays: data.data.estimatedDays,
          codAvailable: data.data.codAvailable,
          zoneName: data.data.zone?.name || "Unknown",
          freeShippingThreshold: data.data.freeShippingThreshold,
          freeShippingRemaining: data.data.freeShippingRemaining,
          isFreeShipping: data.data.isFreeShipping,
          deliveryType: data.data.deliveryType,
          estimatedDelivery: data.data.estimatedDelivery,
          breakdown: data.data.breakdown,
        });
      }
    } catch (error) {
      console.error("Shipping calculation error:", error);
    } finally {
      setCalculatingShipping(false);
    }
  }, [form.city, form.deliveryType, cart, subtotal]);

  useEffect(() => {
    calculateShippingCost();
  }, [calculateShippingCost]);

  // ---- Final totals ----
  const shippingFee = shippingCalc?.shippingCost ?? 0;
  const giftCardDeduction = appliedGiftCard
    ? Math.min(appliedGiftCard.balance, subtotal + shippingFee)
    : 0;
  const total = subtotal + shippingFee - giftCardDeduction;

  // ---- Free shipping progress ----
  const freeShippingProgress = shippingCalc
    ? Math.min(100, (subtotal / shippingCalc.freeShippingThreshold) * 100)
    : 0;

  // ---- Handle Form Field Change ----
  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-update COD availability when city changes
    if (field === "city" && value) {
      const zoneInfo = getZoneForDistrict(value);
      if (!zoneInfo.codAvailable && form.paymentMethod === "cod") {
        setForm((prev) => ({ ...prev, paymentMethod: "bank_transfer", city: value }));
      }
    }
  };

  // ---- Apply Gift Card ----
  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setGiftCardChecking(true);
    setGiftCardError("");
    try {
      const res = await fetch("/api/gift-cards/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCardCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedGiftCard({
          code: giftCardCode.trim().toUpperCase(),
          balance: data.data.balance,
          name: data.data.name || "Gift Card",
        });
        setGiftCardCode("");
        toast.success(`Gift card applied! Balance: Rs. ${data.data.balance.toLocaleString()}`);
      } else {
        setGiftCardError(data.error || "Invalid gift card");
        toast.error(data.error || "Invalid gift card");
      }
    } catch {
      setGiftCardError("Failed to check gift card");
      toast.error("Failed to check gift card");
    } finally {
      setGiftCardChecking(false);
    }
  };

  // ---- Remove Gift Card ----
  const removeGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardError("");
    toast.success("Gift card removed");
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
    if (form.paymentMethod === "cod" && shippingCalc && !shippingCalc.codAvailable) {
      toast.error("Cash on Delivery is not available for this area. Please select Bank Transfer.");
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

    const shippingInfo = shippingCalc
      ? `Shipping: ${shippingCalc.isFreeShipping ? "FREE ✨" : `Rs. ${shippingFee.toLocaleString()}`} (${shippingCalc.deliveryType === "express" ? "Express" : "Standard"} - ${shippingCalc.estimatedDays[0]}-${shippingCalc.estimatedDays[1]} days)`
      : `Shipping: Rs. ${shippingFee.toLocaleString()}`;

    const message = `Hi SL HUB COMPUTER! I'd like to place an order:\n\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city}\n${form.notes ? `*Notes:* ${form.notes}\n` : ""}\n${itemLines}\n\nSubtotal: Rs. ${subtotal.toLocaleString()}\n${shippingInfo}\n*Total: Rs. ${total.toLocaleString()}*\n*Payment:* ${form.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`;

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
          {shippingCalc && (
            <p className="text-sm text-muted-foreground mb-2">
              Estimated delivery: {shippingCalc.estimatedDays[0]}–{shippingCalc.estimatedDays[1]} business days
              {shippingCalc.estimatedDelivery && (
                <span> ({shippingCalc.estimatedDelivery.minLabel} – {shippingCalc.estimatedDelivery.maxLabel})</span>
              )}
            </p>
          )}
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

              {/* Shipping Zone Info */}
              {form.city && shippingCalc && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{shippingCalc.zoneName}</span>
                    {calculatingShipping && (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {shippingCalc.estimatedDays[0]}–{shippingCalc.estimatedDays[1]} days
                        {shippingCalc.estimatedDelivery && (
                          <span className="ml-1">
                            ({shippingCalc.estimatedDelivery.minLabel} – {shippingCalc.estimatedDelivery.maxLabel})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {shippingCalc.codAvailable ? (
                        <>
                          <Banknote className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">COD Available</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-amber-600 font-medium">COD Not Available</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Type Toggle */}
              {form.city && shippingCalc && (
                <div className="space-y-1.5">
                  <Label>Delivery Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Standard */}
                    <button
                      type="button"
                      onClick={() => updateField("deliveryType", "standard")}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.deliveryType === "standard"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Standard</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {shippingCalc.estimatedDays[0]}–{shippingCalc.estimatedDays[1]} business days
                      </p>
                    </button>

                    {/* Express */}
                    <button
                      type="button"
                      onClick={() => updateField("deliveryType", "express")}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.deliveryType === "express"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium">Express</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">+50%</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Faster delivery
                      </p>
                    </button>
                  </div>
                </div>
              )}

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
                    shippingCalc && !shippingCalc.codAvailable
                      ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
                      : form.paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    if (!shippingCalc || shippingCalc.codAvailable) {
                      updateField("paymentMethod", "cod");
                    }
                  }}
                >
                  <RadioGroupItem value="cod" id="cod" disabled={shippingCalc ? !shippingCalc.codAvailable : false} />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="font-medium cursor-pointer flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Cash on Delivery (COD)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shippingCalc && !shippingCalc.codAvailable
                        ? "COD is not available for your selected area"
                        : "Pay when you receive your order. No advance payment needed."
                      }
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

              {/* Free Shipping Progress */}
              {form.city && shippingCalc && !shippingCalc.isFreeShipping && shippingCalc.freeShippingRemaining > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Gift className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Add Rs. {shippingCalc.freeShippingRemaining.toLocaleString()} more for free shipping!
                    </span>
                  </div>
                  <Progress value={freeShippingProgress} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Rs. {shippingCalc.freeShippingThreshold.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {shippingCalc?.isFreeShipping && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Free shipping applied! 🎉
                  </span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Shipping
                    {form.deliveryType === "express" && (
                      <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                        <Zap className="w-2.5 h-2.5 mr-0.5" />Express
                      </Badge>
                    )}
                  </span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-600 font-medium"
                        : ""
                    }
                  >
                    {calculatingShipping
                      ? "Calculating..."
                      : shippingFee === 0
                      ? "FREE"
                      : `Rs. ${shippingFee.toLocaleString()}`}
                  </span>
                </div>

                {/* Shipping Breakdown (expandable) */}
                {shippingCalc && shippingFee > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 text-[11px] space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Base rate</span>
                      <span>Rs. {shippingCalc.breakdown.baseRate.toLocaleString()}</span>
                    </div>
                    {shippingCalc.breakdown.weightCharge > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Weight charge</span>
                        <span>Rs. {shippingCalc.breakdown.weightCharge.toLocaleString()}</span>
                      </div>
                    )}
                    {shippingCalc.breakdown.expressSurcharge > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Express surcharge</span>
                        <span>+Rs. {shippingCalc.breakdown.expressSurcharge.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Gift Card Section */}
              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  Have a gift card?
                </p>
                {appliedGiftCard ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {appliedGiftCard.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{appliedGiftCard.code}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Balance: Rs. {appliedGiftCard.balance.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={removeGiftCard}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={giftCardCode}
                        onChange={(e) => { setGiftCardCode(e.target.value.toUpperCase()); setGiftCardError(""); }}
                        placeholder="SLHUB-XXXX-XXXX"
                        className="font-mono text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyGiftCard()}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyGiftCard}
                        disabled={giftCardChecking || !giftCardCode.trim()}
                        className="shrink-0"
                      >
                        {giftCardChecking ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {giftCardError && (
                      <p className="text-xs text-red-500">{giftCardError}</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
              {appliedGiftCard && giftCardDeduction > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">Gift Card Deduction</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">-Rs. {giftCardDeduction.toLocaleString()}</span>
                  </div>
                  {appliedGiftCard.balance > giftCardDeduction && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Remaining on card after order: Rs. {(appliedGiftCard.balance - giftCardDeduction).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={submitting || calculatingShipping}
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
                {shippingCalc && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Delivery within {shippingCalc.estimatedDays[0]}–{shippingCalc.estimatedDays[1]} business days
                    </span>
                  </div>
                )}
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
