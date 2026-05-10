// =============================================================================
// SL HUB COMPUTER - Returns & Refunds Page Component
// =============================================================================
// Purpose: Returns and refunds policy page for customers
// Features: 7-day return policy, eligible/not eligible lists, step-by-step
//           return process, refund methods, warranty claims process
// =============================================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Truck,
  Search,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  Phone,
  Package,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Return Process Steps
// ---------------------------------------------------------------------------
const returnSteps = [
  {
    step: 1,
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Contact Us",
    description:
      "Reach out via WhatsApp or phone within 7 days of receiving your order. Provide your order details and reason for return.",
  },
  {
    step: 2,
    icon: <Search className="w-6 h-6" />,
    title: "Return Approval",
    description:
      "Our team will review your request and confirm eligibility. You'll receive a return reference number and instructions.",
  },
  {
    step: 3,
    icon: <Package className="w-6 h-6" />,
    title: "Pack the Item",
    description:
      "Pack the product in its original packaging with all accessories, manuals, and free items included.",
  },
  {
    step: 4,
    icon: <Truck className="w-6 h-6" />,
    title: "Ship or Drop Off",
    description:
      "Either drop off the item at our Deiyandara store or arrange for pickup (pickup charges may apply).",
  },
  {
    step: 5,
    icon: <CreditCard className="w-6 h-6" />,
    title: "Refund Processed",
    description:
      "Once we receive and inspect the item, your refund will be processed within 3-5 business days.",
  },
];

// ---------------------------------------------------------------------------
// Eligible Items List
// ---------------------------------------------------------------------------
const eligibleItems = [
  "Product received in damaged or defective condition",
  "Wrong product delivered (different from what was ordered)",
  "Product significantly different from the description on our website",
  "Product that arrived with missing parts or accessories",
  "Unopened and unused products in original packaging",
  "Products with manufacturing defects covered under warranty",
];

// ---------------------------------------------------------------------------
// Not Eligible Items List
// ---------------------------------------------------------------------------
const notEligibleItems = [
  "Products returned after 7 days from delivery date",
  "Opened or used software, games, and consumables (ink, toner, etc.)",
  "Products with physical damage caused by misuse or accidents",
  "Items missing original packaging, accessories, or manuals",
  "Specially ordered or custom-built products (including custom PCs)",
  "Products with removed or altered serial numbers or warranty stickers",
  "Clearance or final sale items",
  "Mobile phone screen protectors (once applied)",
];

// ---------------------------------------------------------------------------
// Returns Page Component
// ---------------------------------------------------------------------------
export function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Returns & Refunds</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We want you to be completely satisfied with your purchase. If
          something&apos;s not right, we&apos;re here to help.
        </p>
      </div>

      {/* ---- 7-Day Return Policy Highlight ---- */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-10">
        <CardContent className="p-6 text-center">
          <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
            7-Day Return Policy
          </h2>
          <p className="text-blue-600 dark:text-blue-400 max-w-xl mx-auto">
            You can return eligible products within 7 days of delivery for a
            full refund or exchange. Products must be in original condition with
            all packaging and accessories intact.
          </p>
        </CardContent>
      </Card>

      {/* ---- Eligible vs Not Eligible ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Return Eligibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligible */}
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Eligible for Return
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {eligibleItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Not Eligible */}
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {notEligibleItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="mb-12" />

      {/* ---- Step-by-Step Return Process ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How to Return a Product</h2>
        <div className="space-y-4">
          {returnSteps.map((step, idx) => (
            <div key={step.step} className="flex gap-4 items-start">
              {/* Step Number & Line */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  {step.icon}
                </div>
                {idx < returnSteps.length - 1 && (
                  <div className="w-0.5 h-full bg-blue-200 dark:bg-blue-800 min-h-[20px] mt-2" />
                )}
              </div>

              {/* Step Content */}
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600 text-[10px]">
                    Step {step.step}
                  </Badge>
                  <h3 className="font-bold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-12" />

      {/* ---- Refund Methods ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Refund Methods</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <CreditCard className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Bank Transfer</h3>
              <p className="text-xs text-muted-foreground">
                Refund to your bank account within 3-5 business days
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <RotateCcw className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Store Credit</h3>
              <p className="text-xs text-muted-foreground">
                Immediate store credit for faster exchanges or new purchases
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Package className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Replacement</h3>
              <p className="text-xs text-muted-foreground">
                Get a replacement product shipped to you at no extra cost
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="mb-12" />

      {/* ---- Warranty Claims ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Warranty Claims</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <ShieldCheck className="w-10 h-10 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Product Warranty Process
                </h3>
                <p className="text-sm text-muted-foreground">
                  If your product develops a fault during the warranty period,
                  follow these steps:
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground ml-14">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                Contact us with your proof of purchase (receipt or order number)
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                Describe the issue in detail — our team will assess the problem
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                Bring or send the product to us for inspection
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                If the defect is covered under warranty, we&apos;ll repair,
                replace, or refund at no charge
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">5.</span>
                Warranty claims typically take 5-10 business days to resolve
              </li>
            </ul>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <strong>Note:</strong> Warranty does not cover physical damage,
                liquid damage, misuse, unauthorized modifications, or normal
                wear and tear. Keep your original receipt as proof of purchase.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---- Contact CTA ---- */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Need to Return a Product?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact us within 7 days of delivery to initiate a return.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/94710678944"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
              </Button>
            </a>
            <a href="tel:0710678944">
              <Button variant="outline" className="border-blue-600 text-blue-600">
                <Phone className="w-4 h-4 mr-2" /> Call: 071 067 8944
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
