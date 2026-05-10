// =============================================================================
// SL HUB COMPUTER - Order Tracking Page Component
// =============================================================================
// Purpose: Customer-facing order tracking with order number + phone verification
// Features: Search form, status timeline with visual steps, order details,
//           responsive dark-themed design, animated timeline
// API: GET /api/orders/track?orderNumber=xxx&phone=xxx
// =============================================================================

"use client";

import { useState } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
  PackageCheck,
  PackageOpen,
  CircleDot,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Timeline Step Icons
// ---------------------------------------------------------------------------
const stepIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <PackageCheck className="w-5 h-5" />,
  processing: <PackageOpen className="w-5 h-5" />,
  shipped: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle2 className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

// ---------------------------------------------------------------------------
// Tracked Order Interface
// ---------------------------------------------------------------------------
interface TrackedOrder {
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
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  timeline: {
    status: string;
    label: string;
    isCompleted: boolean;
    isActive: boolean;
    date: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Order Tracking Page Component
// ---------------------------------------------------------------------------
export function OrderTrackingPage() {
  const { setCurrentView } = useStore();

  const [orderNumber, setOrderNumber] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);

  // ---- Handle Track Order ----
  const handleTrack = async () => {
    if (!orderNumber.trim()) {
      toast.error("Please enter your order number");
      return;
    }
    if (!phoneLast4.trim() || phoneLast4.trim().length < 4) {
      toast.error("Please enter the last 4 digits of your phone number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackedOrder(null);

    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        phone: phoneLast4.trim(),
      });

      const res = await fetch(`/api/orders/track?${params}`);
      const data = await res.json();

      if (data.success) {
        setTrackedOrder(data.data);
      } else {
        setError(data.error || "Failed to track order");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Format Date ----
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---- Format Currency ----
  const formatLKR = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // ---- Get Status Color ----
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-500",
      confirmed: "text-blue-500",
      processing: "text-indigo-500",
      shipped: "text-purple-500",
      delivered: "text-green-500",
      cancelled: "text-red-500",
    };
    return colors[status] || "text-gray-500";
  };

  const getStatusBg = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 border-yellow-500/30",
      confirmed: "bg-blue-500/10 border-blue-500/30",
      processing: "bg-indigo-500/10 border-indigo-500/30",
      shipped: "bg-purple-500/10 border-purple-500/30",
      delivered: "bg-green-500/10 border-green-500/30",
      cancelled: "bg-red-500/10 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/10 border-gray-500/30";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView("home")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Track Your Order
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your order number and phone to track your order
          </p>
        </div>
      </div>

      {/* Search Card */}
      <Card className="mb-8 border-2 border-blue-600/20 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
        <CardHeader className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Find Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., SLH-20260510-XXXX"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                From your order confirmation (e.g., SLH-YYYYMMDD-XXXX)
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneLast4">Phone (Last 4 Digits)</Label>
              <Input
                id="phoneLast4"
                value={phoneLast4}
                onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="e.g., 9444"
                maxLength={4}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Last 4 digits of the phone number used for the order
              </p>
            </div>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={loading}
            onClick={handleTrack}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Track Order
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-8 border-red-500/50 bg-red-500/5">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please double-check your order number and phone digits.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracked Order Details */}
      {trackedOrder && (
        <div className="space-y-6">
          {/* Order Status Overview */}
          <Card className="overflow-hidden">
            <div className={`p-4 ${
              trackedOrder.status === "cancelled"
                ? "bg-red-600"
                : trackedOrder.status === "delivered"
                ? "bg-green-600"
                : "bg-blue-600"
            } text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Order Status</p>
                  <p className="text-xl font-bold capitalize flex items-center gap-2">
                    {stepIcons[trackedOrder.status]}
                    {trackedOrder.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Order Number</p>
                  <p className="text-lg font-mono font-bold">{trackedOrder.orderNumber}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="relative">
                {trackedOrder.timeline.map((step, index) => {
                  const isLast = index === trackedOrder.timeline.length - 1;
                  return (
                    <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            step.isActive
                              ? `border-current ${getStatusColor(step.status)} ${getStatusBg(step.status)} animate-pulse`
                              : step.isCompleted
                              ? "border-green-500 bg-green-500/10 text-green-500"
                              : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}
                        >
                          {step.isCompleted && !step.isActive ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            stepIcons[step.status] || <CircleDot className="w-5 h-5" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-8 mt-1 ${
                              step.isCompleted
                                ? "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        )}
                      </div>
                      {/* Step content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold ${
                              step.isActive
                                ? getStatusColor(step.status)
                                : step.isCompleted
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.isActive && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${getStatusBg(step.status)} ${getStatusColor(step.status)} border`}
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{trackedOrder.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium font-mono">{trackedOrder.phone}</span>
                </div>
                {trackedOrder.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{trackedOrder.email}</span>
                  </div>
                )}
                <Separator />
                <div>
                  <span className="text-muted-foreground">Address</span>
                  <p className="font-medium mt-1">
                    {trackedOrder.address || "N/A"}
                    {trackedOrder.city ? `, ${trackedOrder.city}` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">
                    {trackedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      trackedOrder.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }
                  >
                    {trackedOrder.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatLKR(trackedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={trackedOrder.shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {trackedOrder.shipping === 0 ? "FREE" : formatLKR(trackedOrder.shipping)}
                  </span>
                </div>
                {trackedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-500">-{formatLKR(trackedOrder.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatLKR(trackedOrder.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Order Items ({trackedOrder.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {trackedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rs. {item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatLKR(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
              {trackedOrder.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                      Order Notes
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {trackedOrder.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Dates */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Order placed: {formatDate(trackedOrder.createdAt)}</span>
                <span>Last updated: {formatDate(trackedOrder.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-blue-600/20 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium">Need help with your order?</p>
                <p className="text-sm text-muted-foreground">
                  Call us at <a href="tel:0710678944" className="text-blue-600 hover:underline font-medium">071 067 8944</a> or message us on WhatsApp
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => window.open("https://wa.me/94710678944", "_blank")}
              >
                WhatsApp Us
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
