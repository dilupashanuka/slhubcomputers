// =============================================================================
// SL HUB COMPUTER - Theme Customizer Page
// =============================================================================
// Purpose: Professional theme editor with live preview for customizing the
//          store's appearance in real-time
// Features:
//   - Left panel: customization controls (colors, fonts, button styles, presets)
//   - Right panel: mini preview of how the store looks
//   - Live preview updates as settings change
//   - Theme presets: Gaming Dark, Professional Light, Neon Cyber, Minimal Clean
//   - Save, Reset to Default functionality
// Client: SL HUB COMPUTER, Deiyandara
// =============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save,
  RotateCcw,
  Palette,
  Eye,
  ShoppingCart,
  Star,
  Monitor,
  Cpu,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ThemeConfig,
  themePresets,
  fontOptions,
  buttonStyleOptions,
  cardStyleOptions,
  defaultTheme,
} from "@/lib/theme-config";
import { applyTheme } from "@/lib/apply-theme";
import { dispatchThemeChange } from "@/components/theme-provider";

// ---------------------------------------------------------------------------
// Color Picker Component
// ---------------------------------------------------------------------------
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-9 p-1 cursor-pointer border rounded-md"
          />
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 text-sm font-mono"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini Preview Card
// ---------------------------------------------------------------------------
function MiniPreview({ config }: { config: ThemeConfig }) {
  const borderRadius =
    config.buttonStyle === "pill"
      ? "9999px"
      : config.buttonStyle === "sharp"
      ? "0px"
      : `${config.buttonRadius}px`;

  const cardClasses =
    config.cardStyle === "flat"
      ? "bg-muted/30"
      : config.cardStyle === "bordered"
      ? "bg-muted/30 border"
      : "bg-muted/30 shadow-md";

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
    >
      {/* Header Preview */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: config.headerBgColor }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: config.primaryColor }}
          >
            SL
          </div>
          <span className="text-white font-semibold text-sm">SL HUB</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <ShoppingCart className="w-4 h-4 text-white/70" />
        </div>
      </div>

      {/* Hero Preview */}
      <div
        className="px-4 py-6 text-center"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}15, ${config.accentColor}10)`,
        }}
      >
        <p className="text-xs text-muted-foreground mb-1">Welcome to</p>
        <h2
          className="text-lg font-bold mb-1"
          style={{ color: config.primaryColor }}
        >
          SL HUB COMPUTER
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Premium components at unbeatable prices
        </p>
        <button
          className="px-4 py-1.5 text-white text-xs font-medium"
          style={{
            backgroundColor: config.primaryColor,
            borderRadius,
          }}
        >
          Shop Now
        </button>
      </div>

      {/* Product Cards Preview */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground/70 px-1">
          Featured Products
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "RTX 4060", price: "Rs. 125,000", icon: Monitor },
            { name: "Ryzen 7", price: "Rs. 85,000", icon: Cpu },
          ].map((product) => (
            <div
              key={product.name}
              className={`p-2.5 rounded-lg ${cardClasses}`}
            >
              <div className="w-full h-10 bg-muted/50 rounded flex items-center justify-center mb-1.5">
                <product.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-medium truncate">{product.name}</p>
              <p
                className="text-[10px] font-bold"
                style={{ color: config.primaryColor }}
              >
                {product.price}
              </p>
              <button
                className="w-full mt-1.5 py-1 text-[9px] text-white font-medium"
                style={{
                  backgroundColor: config.primaryColor,
                  borderRadius,
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Preview */}
      <div
        className="px-4 py-2.5 border-t flex items-center justify-between"
        style={{ backgroundColor: config.headerBgColor }}
      >
        <span className="text-[9px] text-white/50">
          © 2025 SL HUB COMPUTER
        </span>
        <div className="flex items-center gap-1">
          {[Star, ShoppingCart].map((Icon, i) => (
            <Icon key={i} className="w-3 h-3 text-white/40" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme Customizer Page
// ---------------------------------------------------------------------------
export default function ThemeCustomizerPage() {
  const [config, setConfig] = useState<ThemeConfig>(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Gaming Dark");
  const [loaded, setLoaded] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch current theme configuration
  // -------------------------------------------------------------------------
  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/theme");
      const data = await res.json();
      if (data.success && data.data) {
        const fetched: ThemeConfig = {
          primaryColor: data.data.primaryColor || defaultTheme.primaryColor,
          accentColor: data.data.accentColor || defaultTheme.accentColor,
          headerBgColor: data.data.headerBgColor || defaultTheme.headerBgColor,
          buttonRadius: data.data.buttonRadius ?? defaultTheme.buttonRadius,
          buttonStyle: data.data.buttonStyle || defaultTheme.buttonStyle,
          fontFamily: data.data.fontFamily || defaultTheme.fontFamily,
          cardStyle: data.data.cardStyle || defaultTheme.cardStyle,
        };
        setConfig(fetched);
        setLoaded(true);
      }
    } catch (error) {
      console.error("Fetch theme error:", error);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  // -------------------------------------------------------------------------
  // Update config field and live preview
  // -------------------------------------------------------------------------
  const updateConfig = useCallback(
    (field: keyof ThemeConfig, value: string | number) => {
      const newConfig = { ...config, [field]: value };
      setConfig(newConfig);
      // Apply live preview
      applyTheme(newConfig);
    },
    [config]
  );

  // -------------------------------------------------------------------------
  // Apply a preset
  // -------------------------------------------------------------------------
  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = themePresets.find((p) => p.name === presetName);
      if (preset) {
        setConfig(preset.config);
        setActivePreset(presetName);
        applyTheme(preset.config);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Save theme to backend
  // -------------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        applyTheme(config);
        dispatchThemeChange(config);
        alert("Theme saved successfully!");
      } else {
        alert(data.error || "Failed to save theme");
      }
    } catch (error) {
      console.error("Save theme error:", error);
      alert("Failed to save theme");
    } finally {
      setSaving(false);
    }
  }, [config]);

  // -------------------------------------------------------------------------
  // Reset to default theme
  // -------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    setConfig(defaultTheme);
    setActivePreset("Gaming Dark");
    applyTheme(defaultTheme);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="size-6" />
            Theme Customizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize your store&apos;s appearance with live preview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-3.5 mr-1" />
            Reset to Default
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="size-3.5 mr-1" />
            {saving ? "Saving..." : "Save Theme"}
          </Button>
        </div>
      </div>

      {/* Main Content: Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================= */}
        {/* Left Panel: Customization Controls (2 cols)                    */}
        {/* ============================================================= */}
        <div className="lg:col-span-2 space-y-4">
          {/* Theme Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="size-4" />
                Theme Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.name)}
                    className={`
                      relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                      ${
                        activePreset === preset.name
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }
                    `}
                  >
                    {/* Mini color swatches */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-5 h-5 rounded-md border border-white/20"
                        style={{ backgroundColor: preset.config.primaryColor }}
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-white/20"
                        style={{ backgroundColor: preset.config.accentColor }}
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-white/20"
                        style={{ backgroundColor: preset.config.headerBgColor }}
                      />
                    </div>
                    <p className="text-xs font-semibold">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {preset.description}
                    </p>
                    {activePreset === preset.name && (
                      <div className="absolute top-2 right-2">
                        <Badge className="text-[9px] px-1.5 py-0">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Active
                        </Badge>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={config.primaryColor}
                  onChange={(v) => updateConfig("primaryColor", v)}
                />
                <ColorPicker
                  label="Accent Color"
                  value={config.accentColor}
                  onChange={(v) => updateConfig("accentColor", v)}
                />
                <ColorPicker
                  label="Header Background"
                  value={config.headerBgColor}
                  onChange={(v) => updateConfig("headerBgColor", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Typography & Layout */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Typography & Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Font Family */}
              <div className="space-y-1.5">
                <Label className="text-sm">Font Family</Label>
                <Select
                  value={config.fontFamily}
                  onValueChange={(v) => updateConfig("fontFamily", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: `'${font.value}', sans-serif` }}>
                          {font.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Button Style */}
              <div className="space-y-1.5">
                <Label className="text-sm">Button Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {buttonStyleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig("buttonStyle", option.value)}
                      className={`
                        py-2 text-sm font-medium transition-all duration-150
                        ${
                          config.buttonStyle === option.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }
                      `}
                      style={{
                        borderRadius:
                          option.value === "pill"
                            ? "9999px"
                            : option.value === "sharp"
                            ? "0px"
                            : `${config.buttonRadius}px`,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Border Radius</Label>
                  <span className="text-sm font-mono text-muted-foreground">
                    {config.buttonRadius}px
                  </span>
                </div>
                <Slider
                  value={[config.buttonRadius]}
                  onValueChange={([v]) => updateConfig("buttonRadius", v)}
                  min={0}
                  max={16}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0px (Sharp)</span>
                  <span>16px (Round)</span>
                </div>
              </div>

              {/* Card Style */}
              <div className="space-y-1.5">
                <Label className="text-sm">Card Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {cardStyleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig("cardStyle", option.value)}
                      className={`
                        py-2.5 px-3 text-xs font-medium rounded-lg transition-all duration-150 border
                        ${
                          config.cardStyle === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30 text-foreground"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-full h-6 rounded mb-1.5
                          ${option.value === "flat" ? "bg-muted/30" : ""}
                          ${
                            option.value === "bordered"
                              ? "bg-muted/20 border border-dashed"
                              : ""
                          }
                          ${
                            option.value === "shadowed"
                              ? "bg-muted/30 shadow-sm"
                              : ""
                          }
                        `}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================= */}
        {/* Right Panel: Live Preview (1 col)                             */}
        {/* ============================================================= */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="size-4" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniPreview config={config} />
              </CardContent>
            </Card>

            {/* Current Config Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="text-muted-foreground">Primary:</span>
                  <span className="font-mono">{config.primaryColor}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: config.accentColor }}
                  />
                  <span className="text-muted-foreground">Accent:</span>
                  <span className="font-mono">{config.accentColor}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: config.headerBgColor }}
                  />
                  <span className="text-muted-foreground">Header:</span>
                  <span className="font-mono">{config.headerBgColor}</span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Font: <span className="text-foreground">{config.fontFamily}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Buttons: <span className="text-foreground">{config.buttonStyle} ({config.buttonRadius}px)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cards: <span className="text-foreground">{config.cardStyle}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
