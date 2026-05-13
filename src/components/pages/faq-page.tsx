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

// Category config for mapping API categories to icons/colors
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
    return []; // No hardcoded fallback
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
