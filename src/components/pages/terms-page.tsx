// =============================================================================
// SL HUB COMPUTER - Terms & Conditions Page Component
// =============================================================================
// Purpose: Terms and conditions page with comprehensive legal information
// Features: 9 sections covering general terms, products & pricing, orders &
//           payment, delivery, returns, warranty, liability, privacy, changes
// =============================================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Terms Sections Data
// ---------------------------------------------------------------------------
const termsSections = [
  {
    id: "general",
    icon: <FileText className="w-5 h-5" />,
    title: "1. General Terms",
    content: [
      "These Terms and Conditions govern your use of the SL HUB COMPUTER website and your purchase of products and services from our store located at Hakmana Road, Deiyandara, Sri Lanka.",
      "By accessing our website or making a purchase, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our services.",
      "SL HUB COMPUTER reserves the right to refuse service to anyone for any reason at any time.",
      "We strive to provide accurate product information, but we do not warrant that product descriptions, images, or other content on our website is entirely accurate, complete, reliable, or error-free.",
    ],
  },
  {
    id: "products",
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "2. Products & Pricing",
    content: [
      "All products displayed on our website are subject to availability. We reserve the right to discontinue any product at any time.",
      "Prices are displayed in Sri Lankan Rupees (LKR) and include applicable taxes unless otherwise stated.",
      "While we make every effort to ensure pricing accuracy, errors may occur. If a product is listed at an incorrect price, we reserve the right to cancel any orders placed for that product and notify you of the cancellation.",
      "Prices are subject to change without prior notice. Promotional offers and discounts are available for limited periods and may be withdrawn at any time.",
      "Product images are for illustration purposes only and may vary slightly from the actual product received.",
    ],
  },
  {
    id: "orders",
    icon: <CreditCard className="w-5 h-5" />,
    title: "3. Orders & Payment",
    content: [
      "By placing an order, you confirm that all information provided is accurate and complete. We are not responsible for delays caused by incorrect information.",
      "Orders placed through our website are processed during business hours (Mon-Sat 9AM-7PM, Sun 10AM-5PM). Orders placed outside these hours will be processed the next business day.",
      "We accept the following payment methods: Cash on Delivery (COD), Bank Transfer, and in-store payments. Payment must be received before we ship your order (except for COD).",
      "We reserve the right to cancel orders that appear fraudulent, violate these terms, or involve products that are no longer available.",
      "Order confirmation via WhatsApp or SMS does not guarantee product availability. We will notify you if any items in your order are unavailable.",
    ],
  },
  {
    id: "delivery",
    icon: <Truck className="w-5 h-5" />,
    title: "4. Delivery",
    content: [
      "We deliver island-wide across Sri Lanka. Standard delivery takes 2-5 business days; express delivery takes 1-2 business days where available.",
      "Free standard delivery is available for orders over Rs. 5,000. A delivery fee of Rs. 300 applies for orders below this threshold.",
      "Delivery times are estimates and may vary depending on your location, weather conditions, and other factors beyond our control.",
      "We are not liable for delays caused by courier services, natural disasters, strikes, or other force majeure events.",
      "Someone must be available to receive the delivery at the specified address. Redelivery may incur additional charges.",
      "Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.",
    ],
  },
  {
    id: "returns",
    icon: <RotateCcw className="w-5 h-5" />,
    title: "5. Returns & Refunds",
    content: [
      "We offer a 7-day return policy for eligible products from the date of delivery. Products must be in original condition with all packaging, accessories, and documentation intact.",
      "Products that are not eligible for return include: opened software, consumables, custom-built products, products with altered serial numbers, and clearance items.",
      "To initiate a return, contact us via WhatsApp at 071 067 8944 or visit our store with your proof of purchase.",
      "Refunds are processed within 3-5 business days after we receive and inspect the returned product. Refund methods include bank transfer, store credit, or replacement.",
      "Shipping costs for returning defective or incorrect items will be borne by SL HUB COMPUTER. Return shipping for change-of-mind returns is the customer's responsibility.",
    ],
  },
  {
    id: "warranty",
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "6. Warranty",
    content: [
      "All products sold by SL HUB COMPUTER come with genuine manufacturer warranty. The warranty period varies by product and brand.",
      "Warranty covers manufacturing defects only. It does not cover physical damage, liquid damage, misuse, unauthorized modifications, or normal wear and tear.",
      "To make a warranty claim, provide your original proof of purchase and a description of the defect. Warranty claims are processed within 5-10 business days.",
      "During the warranty period, we will repair, replace, or provide a refund for defective products at our discretion.",
      "Some products may carry extended warranty from the manufacturer. Please check the product documentation for details.",
    ],
  },
  {
    id: "liability",
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "7. Limitation of Liability",
    content: [
      "SL HUB COMPUTER shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services.",
      "Our total liability for any claim arising from the sale of products or services shall not exceed the purchase price of the product or service in question.",
      "We do not guarantee that our website will be uninterrupted, secure, or error-free. We are not responsible for any damage to your computer or data resulting from using our website.",
      "You are responsible for maintaining the confidentiality of any account information and for all activities that occur under your account.",
    ],
  },
  {
    id: "privacy",
    icon: <Lock className="w-5 h-5" />,
    title: "8. Privacy & Data Protection",
    content: [
      "We collect personal information (name, email, phone, address) only for the purpose of processing your orders and providing customer support.",
      "We do not sell, trade, or otherwise transfer your personal information to third parties except as required to fulfill your order (e.g., courier services).",
      "We take reasonable measures to protect your personal information from unauthorized access, alteration, or disclosure.",
      "You may request to view, update, or delete your personal information by contacting us at slhubcomputer@gmail.com.",
      "By providing your phone number and email, you consent to receiving order updates and communications related to your purchases.",
    ],
  },
  {
    id: "changes",
    icon: <RefreshCw className="w-5 h-5" />,
    title: "9. Changes to Terms",
    content: [
      "SL HUB COMPUTER reserves the right to update or modify these Terms and Conditions at any time without prior notice.",
      "The latest version of the Terms and Conditions will always be available on our website. The date of the most recent update will be indicated.",
      "Your continued use of our website and services after any changes constitutes your acceptance of the revised terms.",
      "If you have any questions about these Terms and Conditions, please contact us at slhubcomputer@gmail.com or call 071 067 8944.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Terms Page Component
// ---------------------------------------------------------------------------
import { PageHero } from "@/components/layout/page-hero";

// ---------------------------------------------------------------------------
// Terms Page Component
// ---------------------------------------------------------------------------
export function TermsPage() {
  return (
    <div className="min-h-screen">
      <PageHero 
        title="Terms & Conditions"
        subtitle="Legal Agreement & Policies"
        description="Please read these terms carefully before using our website or making a purchase. By using our services, you agree to be bound by these terms."
        gradient="from-slate-700 to-slate-900"
        icon={<FileText className="w-12 h-12" />}
      />

      <div className="container mx-auto px-4 pb-16">

      {/* ---- Quick Navigation ---- */}
      <Card className="mb-10">
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Table of Contents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {termsSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-sm transition-colors"
              >
                <span className="text-blue-600">{section.icon}</span>
                <span className="text-foreground">{section.title}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---- Terms Sections ---- */}
      <div className="space-y-8">
        {termsSections.map((section, idx) => (
          <section key={section.id} id={section.id}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                </div>

                <ul className="space-y-3">
                  {section.content.map((paragraph, pIdx) => (
                    <li
                      key={pIdx}
                      className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-blue-200 dark:border-blue-800"
                    >
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {idx < termsSections.length - 1 && (
              <Separator className="mt-8" />
            )}
          </section>
        ))}
      </div>

      {/* ---- Contact Note ---- */}
      <Card className="mt-10 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold mb-2">Questions About Our Terms?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have any questions or concerns about these terms and
            conditions, please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="tel:0710678944"
              className="text-blue-600 hover:underline font-medium"
            >
              📞 071 067 8944
            </a>
            <a
              href="mailto:slhubcomputer@gmail.com"
              className="text-blue-600 hover:underline font-medium"
            >
              📧 slhubcomputer@gmail.com
            </a>
            <a
              href="https://wa.me/94710678944"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline font-medium"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
