// =============================================================================
// SL HUB COMPUTER - Shipping Policy Page Component
// =============================================================================
// Purpose: Shipping policy information page for customers
// Features: Delivery options (Standard, Express, Store Pickup, On-Site Service),
//           delivery zones table with rates, important notes, estimated times
// =============================================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  Zap,
  Store,
  Wrench,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Package,
  ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Delivery Options Data
// ---------------------------------------------------------------------------
const deliveryOptions = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Standard Delivery",
    description: "Reliable island-wide delivery via courier service",
    time: "2-5 business days",
    fee: "Rs. 300 (FREE over Rs. 5,000)",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-600",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Express Delivery",
    description: "Fast delivery for urgent orders in select areas",
    time: "1-2 business days",
    fee: "Rs. 600",
    color: "bg-orange-100 dark:bg-orange-900 text-orange-600",
  },
  {
    icon: <Store className="w-8 h-8" />,
    title: "Store Pickup",
    description: "Pick up your order from our Deiyandara store",
    time: "Ready within 2 hours",
    fee: "FREE",
    color: "bg-green-100 dark:bg-green-900 text-green-600",
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "On-Site Service",
    description: "We come to you for installation and setup services",
    time: "Scheduled appointment",
    fee: "Varies by service",
    color: "bg-purple-100 dark:bg-purple-900 text-purple-600",
  },
];

// ---------------------------------------------------------------------------
// Delivery Zones Data
// ---------------------------------------------------------------------------
const deliveryZones = [
  {
    zone: "Deiyandara & Hakmana",
    standardTime: "1-2 days",
    expressTime: "Same day",
    standardFee: "Rs. 200",
    expressFee: "Rs. 400",
  },
  {
    zone: "Matara & Surrounding",
    standardTime: "2-3 days",
    expressTime: "1 day",
    standardFee: "Rs. 300",
    expressFee: "Rs. 600",
  },
  {
    zone: "Galle & Southern Province",
    standardTime: "2-4 days",
    expressTime: "1-2 days",
    standardFee: "Rs. 350",
    expressFee: "Rs. 700",
  },
  {
    zone: "Colombo & Western Province",
    standardTime: "3-5 days",
    expressTime: "1-2 days",
    standardFee: "Rs. 400",
    expressFee: "Rs. 800",
  },
  {
    zone: "Other Areas (Island-wide)",
    standardTime: "3-7 days",
    expressTime: "Not available",
    standardFee: "Rs. 450",
    expressFee: "N/A",
  },
];

// ---------------------------------------------------------------------------
// Shipping Page Component
// ---------------------------------------------------------------------------
export function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Shipping Policy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We deliver across Sri Lanka! Learn about our delivery options, rates,
          and estimated times for your area.
        </p>
      </div>

      {/* ---- Free Shipping Banner ---- */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 mb-10">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center shrink-0">
            <Package className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-green-700 dark:text-green-400">
              Free Shipping on Orders Over Rs. 5,000!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Enjoy free standard delivery on all orders above Rs. 5,000.
              No coupon needed — it&apos;s automatic!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Delivery Options ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Delivery Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deliveryOptions.map((option) => (
            <Card key={option.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${option.color}`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {option.description}
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{option.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{option.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mb-12" />

      {/* ---- Delivery Zones Table ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Delivery Zones & Rates</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold border">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border">
                  Standard Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border">
                  Express Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border">
                  Standard Fee
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border">
                  Express Fee
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveryZones.map((zone, idx) => (
                <tr
                  key={zone.zone}
                  className={
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }
                >
                  <td className="px-4 py-3 text-sm font-medium border">
                    {zone.zone}
                  </td>
                  <td className="px-4 py-3 text-sm border">
                    {zone.standardTime}
                  </td>
                  <td className="px-4 py-3 text-sm border">
                    {zone.expressTime}
                  </td>
                  <td className="px-4 py-3 text-sm border font-medium">
                    {zone.standardFee}
                  </td>
                  <td className="px-4 py-3 text-sm border font-medium">
                    {zone.expressFee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * Delivery times are estimates and may vary during holidays and peak
          seasons. Express delivery is subject to availability in your area.
        </p>
      </section>

      <Separator className="mb-12" />

      {/* ---- Important Notes ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Important Notes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What to Expect */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                What to Expect
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Order confirmation via WhatsApp/SMS within 1 hour
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Tracking information provided for all deliveries
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Products are carefully packaged with protective materials
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Delivery personnel will call before arrival
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Cash on delivery (COD) available for most areas
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Please Note */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Please Note
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  Delivery times may be longer during holidays
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  Someone must be available to receive the package
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  Please inspect items upon delivery before accepting
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  Specially ordered items may have longer delivery times
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  Remote areas may incur additional delivery charges
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---- Packaging & Insurance ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Packaging & Protection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Secure Packaging</h3>
              <p className="text-xs text-muted-foreground">
                All items are packed with bubble wrap and protective materials
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Package className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Original Packaging</h3>
              <p className="text-xs text-muted-foreground">
                Products shipped in manufacturer&apos;s original boxes
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Truck className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Insured Delivery</h3>
              <p className="text-xs text-muted-foreground">
                High-value items include transit insurance coverage
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
