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
import { Save, RefreshCw } from "lucide-react";
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
export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);

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
      {/* Appearance & Features Section                                      */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance & Features</CardTitle>
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
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enableCCTV}
                onCheckedChange={(val) => updateField("enableCCTV", val)}
              />
              <Label>Enable CCTV Section</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enablePCBuilder}
                onCheckedChange={(val) => updateField("enablePCBuilder", val)}
              />
              <Label>Enable PC Builder</Label>
            </div>
          </div>
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
