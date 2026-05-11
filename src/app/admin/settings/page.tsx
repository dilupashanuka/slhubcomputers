// =============================================================================
// SL HUB COMPUTER - Admin Settings Page
// =============================================================================
// Purpose: Site-wide settings management page for SL HUB COMPUTER.
//          Provides a form to update all site configuration values.
// Features:
//   - Auto-loads current settings from API on mount
//   - Organized into sections: General, Contact, Social Media, Shipping,
//     SEO & Meta, Hero, Appearance & Features
//   - Save settings with PUT to /api/admin/settings
//   - Real-time form state management
//   - Success/error feedback via alert
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Smartphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Type Definitions - Matches SiteSettingsType with ALL fields
// ---------------------------------------------------------------------------
interface Settings {
  siteName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  youtube: string;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingAbove: number;
  taxRate: number;
  openingHours: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  announcementBar: string;
  primaryColor: string;
  accentColor: string;
  enableCCTV: boolean;
  enablePCBuilder: boolean;
  enableAffiliate: boolean;
  enableTestimonials: boolean;
  enableNewsletter: boolean;
  enablePrebuiltPC: boolean;
  enableGiftCards: boolean;
  enableCoupons: boolean;
  enableReviews: boolean;
  enableRepairServices: boolean;
  // SMS Configuration
  smsProvider: string;
  smsApiKey: string;
  smsApiSecret: string;
  smsFromNumber: string;
  smsEnabled: boolean;
  smsOrderConfirmation: boolean;
  smsStatusUpdates: boolean;
  smsBackInStock: boolean;
  smsDeliveryUpdates: boolean;
}

// ---------------------------------------------------------------------------
// Default settings (fallback)
// ---------------------------------------------------------------------------
const defaultSettings: Settings = {
  siteName: "SL HUB COMPUTER",
  tagline: "Your Trusted Tech Partner",
  description: "Premium computer parts, custom PCs, and repair services in Deiyandara, Sri Lanka",
  phone: "071 067 8944",
  email: "slhubcomputer@gmail.com",
  address: "Hakmana Road, Deiyandara, Sri Lanka",
  whatsapp: "94710678944",
  facebook: "https://www.facebook.com/profile.php?id=100063543731370",
  instagram: "",
  youtube: "",
  currency: "LKR",
  currencySymbol: "Rs.",
  shippingFee: 500,
  freeShippingAbove: 25000,
  taxRate: 0,
  openingHours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
  metaTitle: "SL HUB COMPUTER - Your Trusted Tech Partner",
  metaDescription: "Shop premium computer parts, build custom PCs, and get expert repair services at SL HUB COMPUTER, Deiyandara, Sri Lanka.",
  heroTitle: "Build Your Dream PC",
  heroSubtitle: "Premium components at unbeatable prices",
  heroImageUrl: "",
  announcementBar: "",
  primaryColor: "#2563eb",
  accentColor: "",
  enableCCTV: true,
  enablePCBuilder: true,
  enableAffiliate: true,
  enableTestimonials: true,
  enableNewsletter: true,
  enablePrebuiltPC: true,
  enableGiftCards: true,
  enableCoupons: true,
  enableReviews: true,
  enableRepairServices: true,
  // SMS Configuration
  smsProvider: "none",
  smsApiKey: "",
  smsApiSecret: "",
  smsFromNumber: "",
  smsEnabled: false,
  smsOrderConfirmation: true,
  smsStatusUpdates: true,
  smsBackInStock: true,
  smsDeliveryUpdates: true,
};

// ---------------------------------------------------------------------------
// Reusable Form Field Component for consistent layout
// ---------------------------------------------------------------------------
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page Component
// ---------------------------------------------------------------------------
// Developer PIN to unlock Module Management (change this to your own secret)
const DEV_PIN = "SLHUB-DEV";

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devPin, setDevPin] = useState("");
  const [devPinError, setDevPinError] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch current settings from API
  // -------------------------------------------------------------------------
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          siteName: data.data.siteName || defaultSettings.siteName,
          tagline: data.data.tagline || defaultSettings.tagline,
          description: data.data.description || defaultSettings.description,
          phone: data.data.phone || defaultSettings.phone,
          email: data.data.email || defaultSettings.email,
          address: data.data.address || defaultSettings.address,
          whatsapp: data.data.whatsapp || defaultSettings.whatsapp,
          facebook: data.data.facebook || defaultSettings.facebook,
          instagram: data.data.instagram || "",
          youtube: data.data.youtube || "",
          currency: data.data.currency || defaultSettings.currency,
          currencySymbol: data.data.currencySymbol || defaultSettings.currencySymbol,
          shippingFee: data.data.shippingFee ?? defaultSettings.shippingFee,
          freeShippingAbove: data.data.freeShippingAbove ?? defaultSettings.freeShippingAbove,
          taxRate: data.data.taxRate ?? defaultSettings.taxRate,
          openingHours: data.data.openingHours || defaultSettings.openingHours,
          metaTitle: data.data.metaTitle || defaultSettings.metaTitle,
          metaDescription: data.data.metaDescription || defaultSettings.metaDescription,
          heroTitle: data.data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.data.heroSubtitle || defaultSettings.heroSubtitle,
          heroImageUrl: data.data.heroImageUrl || "",
          announcementBar: data.data.announcementBar || "",
          primaryColor: data.data.primaryColor || defaultSettings.primaryColor,
          accentColor: data.data.accentColor || "",
          enableCCTV: data.data.enableCCTV ?? defaultSettings.enableCCTV,
          enablePCBuilder: data.data.enablePCBuilder ?? defaultSettings.enablePCBuilder,
          enableAffiliate: data.data.enableAffiliate ?? defaultSettings.enableAffiliate,
          enableTestimonials: data.data.enableTestimonials ?? defaultSettings.enableTestimonials,
          enableNewsletter: data.data.enableNewsletter ?? defaultSettings.enableNewsletter,
          enablePrebuiltPC: data.data.enablePrebuiltPC ?? defaultSettings.enablePrebuiltPC,
          enableGiftCards: data.data.enableGiftCards ?? defaultSettings.enableGiftCards,
          enableCoupons: data.data.enableCoupons ?? defaultSettings.enableCoupons,
          enableReviews: data.data.enableReviews ?? defaultSettings.enableReviews,
          enableRepairServices: data.data.enableRepairServices ?? defaultSettings.enableRepairServices,
          // SMS Configuration
          smsProvider: data.data.smsProvider || defaultSettings.smsProvider,
          smsApiKey: data.data.smsApiKey || "",
          smsApiSecret: data.data.smsApiSecret || "",
          smsFromNumber: data.data.smsFromNumber || "",
          smsEnabled: data.data.smsEnabled ?? defaultSettings.smsEnabled,
          smsOrderConfirmation: data.data.smsOrderConfirmation ?? defaultSettings.smsOrderConfirmation,
          smsStatusUpdates: data.data.smsStatusUpdates ?? defaultSettings.smsStatusUpdates,
          smsBackInStock: data.data.smsBackInStock ?? defaultSettings.smsBackInStock,
          smsDeliveryUpdates: data.data.smsDeliveryUpdates ?? defaultSettings.smsDeliveryUpdates,
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // -------------------------------------------------------------------------
  // Handle settings save
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert("Settings saved successfully!");
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Helper to update form fields
  const updateField = (field: keyof Settings, value: string | number | boolean) => {
    setForm({ ...form, [field]: value });
  };

  // SMS test state
  const [smsTestPhone, setSmsTestPhone] = useState("");
  const [smsTesting, setSmsTesting] = useState(false);

  // Handle SMS test
  const handleSmsTest = async () => {
    if (!smsTestPhone) {
      alert("Please enter a phone number for testing");
      return;
    }
    setSmsTesting(true);
    try {
      const res = await fetch("/api/admin/sms-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: smsTestPhone }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Test SMS sent successfully! Check the phone.");
      } else {
        alert(data.error || data.detail || "Failed to send test SMS");
      }
    } catch (error) {
      console.error("SMS test error:", error);
      alert("Failed to send test SMS");
    } finally {
      setSmsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage site configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw className="size-3.5 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="size-3.5 mr-1" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* General Settings Section                                           */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Site Name">
              <Input
                value={form.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
              />
            </FormField>
            <FormField label="Tagline">
              <Input
                value={form.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
            />
          </FormField>
          <FormField label="Opening Hours">
            <Input
              value={form.openingHours}
              onChange={(e) => updateField("openingHours", e.target.value)}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Contact Settings Section                                           */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="071 067 8944"
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </FormField>
          <FormField label="WhatsApp Number">
            <Input
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="94710678944"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Social Media Settings Section                                      */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Facebook URL">
            <Input
              value={form.facebook}
              onChange={(e) => updateField("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </FormField>
          <FormField label="Instagram URL">
            <Input
              value={form.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </FormField>
          <FormField label="YouTube URL">
            <Input
              value={form.youtube}
              onChange={(e) => updateField("youtube", e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Shipping & Currency Settings Section                               */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping & Currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Currency Code">
              <Input
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </FormField>
            <FormField label="Currency Symbol">
              <Input
                value={form.currencySymbol}
                onChange={(e) => updateField("currencySymbol", e.target.value)}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Shipping Fee (LKR)">
              <Input
                type="number"
                value={form.shippingFee}
                onChange={(e) => updateField("shippingFee", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Free Shipping Above (LKR)">
              <Input
                type="number"
                value={form.freeShippingAbove}
                onChange={(e) => updateField("freeShippingAbove", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Tax Rate (%)">
              <Input
                type="number"
                value={form.taxRate}
                onChange={(e) => updateField("taxRate", Number(e.target.value))}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* SEO Settings Section                                               */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO & Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Meta Title">
            <Input
              value={form.metaTitle}
              onChange={(e) => updateField("metaTitle", e.target.value)}
            />
          </FormField>
          <FormField label="Meta Description">
            <Textarea
              value={form.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={2}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Hero Section                                                       */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Hero Title">
            <Input
              value={form.heroTitle}
              onChange={(e) => updateField("heroTitle", e.target.value)}
              placeholder="Build Your Dream PC"
            />
          </FormField>
          <FormField label="Hero Subtitle">
            <Input
              value={form.heroSubtitle}
              onChange={(e) => updateField("heroSubtitle", e.target.value)}
              placeholder="Premium components at unbeatable prices"
            />
          </FormField>
          <FormField label="Hero Image URL">
            <Input
              value={form.heroImageUrl}
              onChange={(e) => updateField("heroImageUrl", e.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Module Management Section - Developer Only                         */}
      {/* ----------------------------------------------------------------- */}
      <Card className={devUnlocked ? "border-amber-400 shadow-amber-100 shadow-md" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            🔒 Module Management
            {devUnlocked && (
              <span className="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Developer Mode Active
              </span>
            )}
          </CardTitle>
          {devUnlocked && (
            <button
              onClick={() => { setDevUnlocked(false); setDevPin(""); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              🔐 Lock
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIN Gate */}
          {!devUnlocked ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl">
                🔒
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Developer Access Required</p>
                <p className="text-xs text-muted-foreground mt-1">This section is restricted to developers only.</p>
              </div>
              <div className="flex gap-2 w-full max-w-xs">
                <input
                  type="password"
                  value={devPin}
                  onChange={(e) => { setDevPin(e.target.value); setDevPinError(false); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (devPin === DEV_PIN) {
                        setDevUnlocked(true);
                        setDevPinError(false);
                      } else {
                        setDevPinError(true);
                      }
                    }
                  }}
                  placeholder="Enter developer key..."
                  className={`flex h-9 w-full rounded-md border ${
                    devPinError ? "border-red-400" : "border-input"
                  } bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
                />
                <button
                  onClick={() => {
                    if (devPin === DEV_PIN) {
                      setDevUnlocked(true);
                      setDevPinError(false);
                    } else {
                      setDevPinError(true);
                    }
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  Unlock
                </button>
              </div>
              {devPinError && (
                <p className="text-xs text-red-500">❌ Incorrect developer key</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E-commerce Core */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1 text-primary">Core Shop Features</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-pcbuilder">PC Builder System</Label>
                  <Switch
                    id="f-pcbuilder"
                    checked={form.enablePCBuilder}
                    onCheckedChange={(val) => updateField("enablePCBuilder", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-prebuilt">Prebuilt PCs Section</Label>
                  <Switch
                    id="f-prebuilt"
                    checked={form.enablePrebuiltPC}
                    onCheckedChange={(val) => updateField("enablePrebuiltPC", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-coupons">Coupon & Discount System</Label>
                  <Switch
                    id="f-coupons"
                    checked={form.enableCoupons}
                    onCheckedChange={(val) => updateField("enableCoupons", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-reviews">Product Reviews & Ratings</Label>
                  <Switch
                    id="f-reviews"
                    checked={form.enableReviews}
                    onCheckedChange={(val) => updateField("enableReviews", val)}
                  />
                </div>
              </div>
            </div>

            {/* Growth & Services */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1 text-primary">Marketing & Services</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-affiliate">Affiliate / Agent System</Label>
                  <Switch
                    id="f-affiliate"
                    checked={form.enableAffiliate}
                    onCheckedChange={(val) => updateField("enableAffiliate", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-newsletter">Newsletter Subscription</Label>
                  <Switch
                    id="f-newsletter"
                    checked={form.enableNewsletter}
                    onCheckedChange={(val) => updateField("enableNewsletter", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-testimonials">Customer Testimonials</Label>
                  <Switch
                    id="f-testimonials"
                    checked={form.enableTestimonials}
                    onCheckedChange={(val) => updateField("enableTestimonials", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-giftcards">Gift Cards / Vouchers</Label>
                  <Switch
                    id="f-giftcards"
                    checked={form.enableGiftCards}
                    onCheckedChange={(val) => updateField("enableGiftCards", val)}
                  />
                </div>
              </div>
            </div>

            {/* Special Services */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1 text-primary">Technical Services</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-cctv">CCTV Services Section</Label>
                  <Switch
                    id="f-cctv"
                    checked={form.enableCCTV}
                    onCheckedChange={(val) => updateField("enableCCTV", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="f-repairs">Repair Services Module</Label>
                  <Switch
                    id="f-repairs"
                    checked={form.enableRepairServices}
                    onCheckedChange={(val) => updateField("enableRepairServices", val)}
                  />
                </div>
              </div>
            </div>
          </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>⚠️ Developer Note:</strong> Turning off these modules will hide their sections from the frontend homepage and navigation.
                  Data remains intact in the database. The PIN is: <code className="bg-amber-100 px-1 rounded font-mono">SLHUB-DEV</code> — change it in <code className="bg-amber-100 px-1 rounded font-mono">settings/page.tsx</code>.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Appearance Section                                                 */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Announcement Bar Text">
            <Input
              value={form.announcementBar}
              onChange={(e) => updateField("announcementBar", e.target.value)}
              placeholder="e.g., Free shipping on orders over Rs. 25,000!"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Primary Color">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </FormField>
            <FormField label="Accent Color">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.accentColor || "#f59e0b"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={form.accentColor}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* SMS Configuration Section                                          */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="size-4" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable SMS */}
          <div className="flex items-center gap-2">
            <Switch
              checked={form.smsEnabled}
              onCheckedChange={(val) => updateField("smsEnabled", val)}
            />
            <Label>Enable SMS Notifications</Label>
          </div>

          {/* Provider Selection */}
          <FormField label="SMS Provider">
            <select
              value={form.smsProvider}
              onChange={(e) => updateField("smsProvider", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">None (Disabled)</option>
              <option value="twilio">Twilio</option>
              <option value="dialog">Dialog SMS API</option>
              <option value="hutch">Hutch Business SMS</option>
            </select>
          </FormField>

          {form.smsProvider !== "none" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="API Key / Account SID">
                  <Input
                    type="password"
                    value={form.smsApiKey}
                    onChange={(e) => updateField("smsApiKey", e.target.value)}
                    placeholder="Enter API key"
                  />
                </FormField>
                <FormField label="API Secret / Auth Token">
                  <Input
                    type="password"
                    value={form.smsApiSecret}
                    onChange={(e) => updateField("smsApiSecret", e.target.value)}
                    placeholder="Enter API secret"
                  />
                </FormField>
              </div>
              <FormField label="From Number / Sender ID">
                <Input
                  value={form.smsFromNumber}
                  onChange={(e) => updateField("smsFromNumber", e.target.value)}
                  placeholder="e.g., +94XXXXXXXXX or SLHUB"
                />
              </FormField>
            </>
          )}

          {/* SMS Notification Types */}
          {form.smsEnabled && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">SMS Notification Types</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.smsOrderConfirmation}
                    onCheckedChange={(val) => updateField("smsOrderConfirmation", val)}
                  />
                  <Label className="text-sm">Order Confirmations</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.smsStatusUpdates}
                    onCheckedChange={(val) => updateField("smsStatusUpdates", val)}
                  />
                  <Label className="text-sm">Status Updates</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.smsBackInStock}
                    onCheckedChange={(val) => updateField("smsBackInStock", val)}
                  />
                  <Label className="text-sm">Back in Stock</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.smsDeliveryUpdates}
                    onCheckedChange={(val) => updateField("smsDeliveryUpdates", val)}
                  />
                  <Label className="text-sm">Delivery Updates</Label>
                </div>
              </div>
            </div>
          )}

          {/* Test SMS */}
          {form.smsEnabled && form.smsProvider !== "none" && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">Test SMS</p>
              <div className="flex items-center gap-2">
                <Input
                  value={smsTestPhone}
                  onChange={(e) => setSmsTestPhone(e.target.value)}
                  placeholder="Enter phone number (e.g., 0712345678)"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSmsTest}
                  disabled={smsTesting}
                >
                  <Send className="size-3.5 mr-1" />
                  {smsTesting ? "Sending..." : "Send Test"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Test SMS will be sent using the configured provider. If SMS is not configured, it will be logged to the console.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-3.5 mr-1.5" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
