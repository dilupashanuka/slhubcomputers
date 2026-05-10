// =============================================================================
// SL HUB COMPUTER - FAQ Page Component
// =============================================================================
// Purpose: Frequently Asked Questions page with accordion sections
// Features: 4 sections (General, Products & Orders, Repair & Services,
//           CCTV & Security), searchable, fetches from API with fallback
// Uses: shadcn/ui Accordion component for expand/collapse
// =============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Search,
  ShoppingBag,
  Wrench,
  Camera,
  MessageCircle,
  Phone,
} from "lucide-react";

// ---------------------------------------------------------------------------
// FAQ Data Structure
// ---------------------------------------------------------------------------
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

// ---------------------------------------------------------------------------
// Hardcoded FAQ Data - FALLBACK when API returns empty
// ---------------------------------------------------------------------------
const fallbackSections: FAQSection[] = [
  {
    title: "General",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "text-blue-600",
    items: [
      {
        question: "Where is SL HUB COMPUTER located?",
        answer:
          "We are located on Hakmana Road, Deiyandara, Sri Lanka. You can visit our store during business hours: Mon-Sat 9AM-7PM, Sun 10AM-5PM. We're easily accessible from the main road.",
      },
      {
        question: "What are your business hours?",
        answer:
          "We're open Monday to Saturday from 9:00 AM to 7:00 PM, and Sunday from 10:00 AM to 5:00 PM. We are closed on Poya days and major public holidays.",
      },
      {
        question: "How can I contact SL HUB COMPUTER?",
        answer:
          "You can reach us through multiple channels: Hotline/WhatsApp at 071 067 8944, Email at slhubcomputer@gmail.com, or visit our Facebook page. For quick inquiries, WhatsApp is the fastest way to get a response.",
      },
      {
        question: "Do you offer warranty on your products?",
        answer:
          "Yes! All products sold by SL HUB COMPUTER come with genuine manufacturer warranty. The warranty period varies by product — computer components typically have 1-3 years warranty, accessories have 6 months to 1 year, and laptops come with their manufacturer's standard warranty.",
      },
      {
        question: "Are your products genuine?",
        answer:
          "Absolutely. We only sell 100% genuine products sourced from authorized distributors and suppliers. We do not sell counterfeit or refurbished products as new. Every product comes with a valid warranty and original packaging.",
      },
    ],
  },
  {
    title: "Products & Orders",
    icon: <ShoppingBag className="w-5 h-5" />,
    color: "text-green-600",
    items: [
      {
        question: "How can I place an order?",
        answer:
          "You can place orders through our website by adding items to your cart and checking out via WhatsApp or phone call. Alternatively, you can directly WhatsApp us at 071 067 8944 with the product details, call our hotline, or visit our store in person.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept cash on delivery, bank transfers, and payments at our store. For online orders, we typically arrange payment via bank transfer. We're working on adding more digital payment options soon.",
      },
      {
        question: "Do you deliver products to my area?",
        answer:
          "We deliver island-wide across Sri Lanka! Standard delivery takes 2-5 business days depending on your location. Express delivery is available for select areas. Orders over Rs. 5,000 qualify for free standard delivery. You can also pick up your order from our store.",
      },
      {
        question: "Can I return or exchange a product?",
        answer:
          "Yes, we have a 7-day return policy for eligible products. Items must be in original condition with packaging intact. Software, consumables, and specially ordered items are not eligible for returns. Please refer to our Returns & Refunds page for full details.",
      },
      {
        question: "Do you offer installment plans?",
        answer:
          "We occasionally offer installment plans for select high-value items. Please contact us directly via WhatsApp or visit our store to inquire about current installment options and eligibility.",
      },
      {
        question: "How do I check product availability before ordering?",
        answer:
          "Product stock levels are shown on our website. For the most up-to-date availability, we recommend WhatsApp-ing us at 071 067 8944 before placing your order, especially for high-demand items.",
      },
    ],
  },
  {
    title: "Repair & Services",
    icon: <Wrench className="w-5 h-5" />,
    color: "text-purple-600",
    items: [
      {
        question: "What repair services do you offer?",
        answer:
          "We offer comprehensive repair services including: laptop screen replacement, keyboard replacement, battery replacement, motherboard repair, virus and malware removal, data recovery, OS installation, hardware upgrades, and general troubleshooting for both laptops and desktops.",
      },
      {
        question: "How long do repairs usually take?",
        answer:
          "Simple repairs like OS installation or virus removal can be completed same day. Hardware repairs typically take 1-3 business days depending on parts availability. Complex motherboard repairs may take 5-7 business days. We always provide an estimated timeline before starting any repair.",
      },
      {
        question: "Do you charge for repair diagnostics?",
        answer:
          "We offer free basic diagnostics for most issues. If advanced diagnostics or disassembly is required, a nominal fee may apply which is adjusted against the repair cost if you proceed with the repair.",
      },
      {
        question: "Do you provide repair warranties?",
        answer:
          "Yes, all repair services come with a service warranty. The warranty period depends on the type of repair — typically 30 days for software services and 90 days for hardware repairs. We stand behind our work.",
      },
      {
        question: "Can you build a custom PC for me?",
        answer:
          "Absolutely! Custom PC building is one of our specialties. Use our online PC Builder tool to select your components, or visit our store and our experts will help you design the perfect build based on your budget and requirements. We handle assembly, testing, and setup.",
      },
      {
        question: "Do you offer on-site repair services?",
        answer:
          "Yes, for certain services like CCTV installation, network setup, and some desktop repairs, we offer on-site service within the Deiyandara area and surrounding towns. Additional travel charges may apply for distant locations. Contact us for details.",
      },
    ],
  },
  {
    title: "CCTV & Security",
    icon: <Camera className="w-5 h-5" />,
    color: "text-red-600",
    items: [
      {
        question: "What CCTV brands do you carry?",
        answer:
          "We are an authorized dealer for Tiandy CCTV products, one of the leading security camera brands. We offer a range of Tiandy cameras including dome, bullet, and PTZ cameras, along with DVRs/NVRs and accessories.",
      },
      {
        question: "Do you provide CCTV installation services?",
        answer:
          "Yes! We provide complete CCTV installation services including site survey, camera placement planning, cabling, installation, configuration, and testing. Our technicians ensure optimal coverage for your property.",
      },
      {
        question: "How many cameras do I need for my home/business?",
        answer:
          "The number of cameras depends on the size and layout of your property. For a typical home, 4-8 cameras provide good coverage. For businesses, we recommend a site survey to determine the optimal number and placement. Contact us for a free consultation.",
      },
      {
        question: "Can I view my CCTV cameras remotely on my phone?",
        answer:
          "Yes! All our Tiandy CCTV systems support remote viewing via smartphone apps. You can monitor your property from anywhere in the world using your mobile phone or tablet with an internet connection.",
      },
      {
        question: "What is the warranty on CCTV systems?",
        answer:
          "Tiandy CCTV cameras come with a 2-year manufacturer warranty. DVRs/NVRs have a 1-2 year warranty depending on the model. Installation workmanship is covered by our 90-day service warranty.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Category config for mapping API categories to icons/colors
// ---------------------------------------------------------------------------
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; title: string }> = {
  General: { icon: <HelpCircle className="w-5 h-5" />, color: "text-blue-600", title: "General" },
  "Products & Orders": { icon: <ShoppingBag className="w-5 h-5" />, color: "text-green-600", title: "Products & Orders" },
  "Repair & Services": { icon: <Wrench className="w-5 h-5" />, color: "text-purple-600", title: "Repair & Services" },
  "CCTV & Security": { icon: <Camera className="w-5 h-5" />, color: "text-red-600", title: "CCTV & Security" },
};

import { PageHero } from "@/components/layout/page-hero";

// ---------------------------------------------------------------------------
// FAQ Page Component
// ---------------------------------------------------------------------------
export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicFaqs, setDynamicFaqs] = useState<any[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // -------------------------------------------------------------------------
  // Fetch FAQs from API on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setDynamicFaqs(data.data);
        }
        setLoadingFaqs(false);
      })
      .catch(() => setLoadingFaqs(false));
  }, []);

  // -------------------------------------------------------------------------
  // Build active sections from dynamic FAQs or fall back to hardcoded
  // -------------------------------------------------------------------------
  const activeSections = useMemo(() => {
    if (dynamicFaqs.length > 0) {
      // Group by category
      const grouped: Record<string, any[]> = {};
      dynamicFaqs.forEach((faq: any) => {
        const cat = faq.category || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ question: faq.question, answer: faq.answer });
      });
      return Object.entries(grouped).map(([category, items]) => ({
        title: categoryConfig[category]?.title || category,
        icon: categoryConfig[category]?.icon || <HelpCircle className="w-5 h-5" />,
        color: categoryConfig[category]?.color || "text-gray-600",
        items,
      }));
    }
    return fallbackSections; // fallback to hardcoded
  }, [dynamicFaqs]);

  // ---- Filter FAQ items based on search query ----
  const filteredSections = activeSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen">
      <PageHero 
        title="Frequently Asked Questions"
        subtitle="How can we help you?"
        description="Find answers to common questions about our products, services, shipping, and warranty policies."
        gradient="from-indigo-600 to-purple-800"
        icon={<HelpCircle className="w-12 h-12" />}
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          className="pl-10 focus-visible:ring-blue-600"
        />
      </div>

      {/* Loading State */}
      {loadingFaqs && (
        <div className="text-center py-10">
          <div className="animate-pulse text-muted-foreground">Loading FAQs...</div>
        </div>
      )}

      {/* No Search Results */}
      {!loadingFaqs && searchQuery && filteredSections.length === 0 && (
        <div className="text-center py-10">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium">No matching questions found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try different keywords or contact us directly for help.
          </p>
        </div>
      )}

      {/* FAQ Sections */}
      {!loadingFaqs && (
        <div className="space-y-8">
          {filteredSections.map((section, sectionIdx) => (
            <div key={section.title}>
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className={section.color}>{section.icon}</span>
                <h2 className="text-xl font-bold">{section.title}</h2>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-muted-foreground text-xs">
                  {section.items.length} questions
                </Badge>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <AccordionItem
                    key={itemIdx}
                    value={`${sectionIdx}-${itemIdx}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium hover:text-blue-600 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {sectionIdx < filteredSections.length - 1 && (
                <Separator className="mt-8" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Still Need Help CTA */}
      <Card className="mt-12 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Still Have Questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our team is ready to help you with any questions or concerns.
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
    </div>
  );
}
