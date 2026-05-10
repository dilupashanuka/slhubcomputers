// =============================================================================
// SL HUB COMPUTER - Shipping Calculator Widget
// =============================================================================
// Purpose: Standalone shipping calculator component that can be embedded on
//           product pages, cart page, or anywhere else
// Features: City selector, weight estimation, standard/express toggle,
//           shipping cost display, delivery time, COD status,
//           professional dark themed card
// Uses: /api/shipping/calculate for cost calculation
// =============================================================================

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Zap,
  Package,
  Clock,
  Banknote,
  AlertCircle,
  Calculator,
  MapPin,
  CheckCircle2,
  Loader2,
  Weight,
} from "lucide-react";
import { SRI_LANKA_DISTRICTS } from "@/lib/shipping";

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface ShippingCalculatorWidgetProps {
  /** Pre-fill order amount for free shipping calculation */
  orderAmount?: number;
  /** Pre-fill items for weight estimation */
  items?: { price?: number; quantity: number }[];
  /** Compact mode for sidebar embedding */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when shipping is calculated */
  onCalculated?: (result: ShippingCalcResult) => void;
}

// ---------------------------------------------------------------------------
// Calculation Result Type
// ---------------------------------------------------------------------------
interface ShippingCalcResult {
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
}

// ---------------------------------------------------------------------------
// Shipping Calculator Widget
// ---------------------------------------------------------------------------
export function ShippingCalculatorWidget({
  orderAmount = 0,
  items = [],
  compact = false,
  className = "",
  onCalculated,
}: ShippingCalculatorWidgetProps) {
  const [city, setCity] = useState("");
  const [deliveryType, setDeliveryType] = useState<"standard" | "express">("standard");
  const [result, setResult] = useState<ShippingCalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  // ---- Calculate shipping ----
  const handleCalculate = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    try {
      const calcItems = items.length > 0
        ? items
        : [{ quantity: 1, price: orderAmount }];

      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          items: calcItems,
          orderSubtotal: orderAmount,
          deliveryType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const calcResult: ShippingCalcResult = {
          shippingCost: data.data.shippingCost,
          estimatedDays: data.data.estimatedDays,
          codAvailable: data.data.codAvailable,
          zoneName: data.data.zone?.name || "Unknown",
          freeShippingThreshold: data.data.freeShippingThreshold,
          freeShippingRemaining: data.data.freeShippingRemaining,
          isFreeShipping: data.data.isFreeShipping,
          deliveryType: data.data.deliveryType,
          estimatedDelivery: data.data.estimatedDelivery,
        };
        setResult(calcResult);
        onCalculated?.(calcResult);
      }
    } catch (error) {
      console.error("Shipping calculation error:", error);
    } finally {
      setLoading(false);
    }
  }, [city, deliveryType, items, orderAmount, onCalculated]);

  return (
    <Card className={`bg-gray-900 dark:bg-gray-950 border-gray-800 text-white ${className}`}>
      <CardHeader className={`${compact ? "p-3" : "p-4"}`}>
        <CardTitle className={`${compact ? "text-sm" : "text-base"} flex items-center gap-2`}>
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Truck className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          </div>
          Shipping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className={`${compact ? "p-3 pt-0" : "p-4 pt-0"} space-y-4`}>
        {/* City Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Delivery District
          </label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setResult(null); // Reset result when city changes
            }}
            className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          >
            <option value="">Select district</option>
            {SRI_LANKA_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            Delivery Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setDeliveryType("standard");
                setResult(null);
              }}
              className={`p-2 rounded-lg border text-left transition-all ${
                deliveryType === "standard"
                  ? "border-blue-500 bg-blue-600/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Package className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium">Standard</span>
              </div>
            </button>
            <button
              onClick={() => {
                setDeliveryType("express");
                setResult(null);
              }}
              className={`p-2 rounded-lg border text-left transition-all ${
                deliveryType === "express"
                  ? "border-amber-500 bg-amber-600/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium">Express</span>
                <Badge className="text-[8px] h-3 px-1 bg-amber-600/30 text-amber-400 border-0">
                  +50%
                </Badge>
              </div>
            </button>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={!city || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Shipping
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="bg-gray-800 rounded-lg p-3 space-y-3 border border-gray-700">
            {/* Shipping Cost */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Shipping Cost</span>
              <span className={`text-lg font-bold ${result.isFreeShipping ? "text-green-400" : "text-white"}`}>
                {result.isFreeShipping ? "FREE ✨" : `Rs. ${result.shippingCost.toLocaleString()}`}
              </span>
            </div>

            {/* Zone */}
            <div className="flex items-center gap-2 text-xs">
              <Truck className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">{result.zoneName}</span>
            </div>

            {/* Estimated Days */}
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">
                {result.estimatedDays[0]}–{result.estimatedDays[1]} business days
                {result.estimatedDelivery && (
                  <span className="ml-1 text-gray-500">
                    ({result.estimatedDelivery.minLabel} – {result.estimatedDelivery.maxLabel})
                  </span>
                )}
              </span>
            </div>

            {/* COD Status */}
            <div className="flex items-center gap-2 text-xs">
              {result.codAvailable ? (
                <>
                  <Banknote className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-medium">Cash on Delivery available</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-medium">COD not available — Bank Transfer only</span>
                </>
              )}
            </div>

            {/* Free Shipping Info */}
            {!result.isFreeShipping && result.freeShippingRemaining > 0 && (
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  <span className="text-[11px] text-blue-300">
                    Add Rs. {result.freeShippingRemaining.toLocaleString()} more for free shipping!
                  </span>
                </div>
                {orderAmount > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (orderAmount / result.freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
