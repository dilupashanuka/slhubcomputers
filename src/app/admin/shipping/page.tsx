// =============================================================================
// SL HUB COMPUTER - Admin Shipping Configuration Page
// =============================================================================
// Purpose: Admin interface for managing shipping zones, rates, and settings
// Features: Zone management, rate editing, free shipping thresholds,
//           express delivery settings, COD per zone, weight pricing,
//           test calculator, professional admin UI
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Edit3,
  Save,
  Plus,
  Trash2,
  Calculator,
  MapPin,
  Package,
  Zap,
  Clock,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  TestTube,
  RefreshCw,
  Weight,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WeightTier {
  maxWeight: number;
  additionalCharge: number;
}

interface ShippingZoneConfig {
  id: string;
  name: string;
  districts: string[];
  baseRate: number;
  maxRate: number;
  freeShippingAbove: number;
  estimatedDays: {
    standard: [number, number];
    express: [number, number];
  };
  codAvailable: boolean;
  weightTiers: WeightTier[];
}

// ---------------------------------------------------------------------------
// Admin Shipping Page
// ---------------------------------------------------------------------------
export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZoneConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("zones");

  // Test calculator state
  const [testCity, setTestCity] = useState("");
  const [testDeliveryType, setTestDeliveryType] = useState<"standard" | "express">("standard");
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // ---- Fetch shipping config ----
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (data.success) {
        setZones(data.data.zones || []);
      }
    } catch (error) {
      console.error("Failed to fetch shipping config:", error);
      toast.error("Failed to load shipping configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ---- Save shipping config ----
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Shipping configuration saved successfully");
        setEditingZone(null);
      } else {
        toast.error(data.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  // ---- Test calculator ----
  const handleTestCalculate = async () => {
    if (!testCity) {
      toast.error("Please select a test city");
      return;
    }

    setTestLoading(true);
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: testCity,
          items: [{ quantity: 1, price: 10000 }],
          orderSubtotal: 10000,
          deliveryType: testDeliveryType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult(data.data);
      } else {
        toast.error(data.error || "Calculation failed");
      }
    } catch (error) {
      console.error("Test calculation error:", error);
      toast.error("Calculation failed");
    } finally {
      setTestLoading(false);
    }
  };

  // ---- Update zone field ----
  const updateZoneField = (
    zoneId: string,
    field: string,
    value: unknown
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, [field]: value } : z))
    );
  };

  // ---- Update estimated days ----
  const updateEstimatedDays = (
    zoneId: string,
    type: "standard" | "express",
    index: 0 | 1,
    value: number
  ) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const newDays = { ...z.estimatedDays };
        const current = [...newDays[type]] as [number, number];
        current[index] = value;
        newDays[type] = current;
        return { ...z, estimatedDays: newDays };
      })
    );
  };

  // ---- Update weight tier ----
  const updateWeightTier = (
    zoneId: string,
    tierIndex: number,
    field: keyof WeightTier,
    value: number
  ) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const newTiers = [...z.weightTiers];
        newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: value };
        return { ...z, weightTiers: newTiers };
      })
    );
  };

  // ---- Add weight tier ----
  const addWeightTier = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const lastTier = z.weightTiers[z.weightTiers.length - 1];
        return {
          ...z,
          weightTiers: [
            ...z.weightTiers,
            { maxWeight: (lastTier?.maxWeight || 5) + 10, additionalCharge: 0 },
          ],
        };
      })
    );
  };

  // ---- Remove weight tier ----
  const removeWeightTier = (zoneId: string, tierIndex: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          weightTiers: z.weightTiers.filter((_, i) => i !== tierIndex),
        };
      })
    );
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Shipping Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage shipping zones, rates, and delivery options for Sri Lanka
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchConfig}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="zones" className="gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Shipping Zones
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <TestTube className="w-3.5 h-3.5" /> Test Calculator
          </TabsTrigger>
        </TabsList>

        {/* ---- Shipping Zones Tab ---- */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{zone.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {zone.districts.join(", ")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={zone.codAvailable ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {zone.codAvailable ? (
                        <>
                          <Banknote className="w-3 h-3 mr-0.5" /> COD
                        </>
                      ) : (
                        "No COD"
                      )}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditingZone(editingZone === zone.id ? null : zone.id)
                      }
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      {editingZone === zone.id ? "Close" : "Edit"}
                    </Button>
                  </div>
                </div>

                {/* Summary when not editing */}
                {editingZone !== zone.id && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground">Base Rate</p>
                      <p className="text-sm font-semibold">
                        {zone.baseRate === 0 ? "FREE" : `Rs. ${zone.baseRate.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground">Max Rate</p>
                      <p className="text-sm font-semibold">Rs. {zone.maxRate.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground">Free Above</p>
                      <p className="text-sm font-semibold">Rs. {zone.freeShippingAbove.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground">Delivery</p>
                      <p className="text-sm font-semibold">
                        {zone.estimatedDays.standard[0]}–{zone.estimatedDays.standard[1]} days
                      </p>
                    </div>
                  </div>
                )}
              </CardHeader>

              {/* Edit Form */}
              {editingZone === zone.id && (
                <CardContent className="p-4 pt-0 space-y-4">
                  <Separator />

                  {/* Basic Rates */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" /> Basic Rates
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Base Rate (Rs.)</Label>
                        <Input
                          type="number"
                          value={zone.baseRate}
                          onChange={(e) =>
                            updateZoneField(zone.id, "baseRate", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Max Rate (Rs.)</Label>
                        <Input
                          type="number"
                          value={zone.maxRate}
                          onChange={(e) =>
                            updateZoneField(zone.id, "maxRate", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Free Shipping Above (Rs.)</Label>
                        <Input
                          type="number"
                          value={zone.freeShippingAbove}
                          onChange={(e) =>
                            updateZoneField(zone.id, "freeShippingAbove", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estimated Days */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Estimated Delivery Days
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Package className="w-3 h-3" /> Standard
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={1}
                            value={zone.estimatedDays.standard[0]}
                            onChange={(e) =>
                              updateEstimatedDays(zone.id, "standard", 0, Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            type="number"
                            min={1}
                            value={zone.estimatedDays.standard[1]}
                            onChange={(e) =>
                              updateEstimatedDays(zone.id, "standard", 1, Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">days</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Express
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={1}
                            value={zone.estimatedDays.express[0]}
                            onChange={(e) =>
                              updateEstimatedDays(zone.id, "express", 0, Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            type="number"
                            min={1}
                            value={zone.estimatedDays.express[1]}
                            onChange={(e) =>
                              updateEstimatedDays(zone.id, "express", 1, Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COD Toggle */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`cod-${zone.id}`}
                      checked={zone.codAvailable}
                      onCheckedChange={(checked) =>
                        updateZoneField(zone.id, "codAvailable", !!checked)
                      }
                    />
                    <Label htmlFor={`cod-${zone.id}`} className="text-sm font-medium cursor-pointer">
                      Cash on Delivery (COD) Available
                    </Label>
                  </div>

                  {/* Weight Tiers */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5" /> Weight-Based Pricing
                    </h4>
                    <div className="space-y-2">
                      {zone.weightTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-28">
                            Up to {tier.maxWeight} kg:
                          </span>
                          <Input
                            type="number"
                            value={tier.additionalCharge}
                            onChange={(e) =>
                              updateWeightTier(zone.id, idx, "additionalCharge", Number(e.target.value))
                            }
                            className="w-28"
                            placeholder="Extra charge (Rs.)"
                          />
                          <span className="text-xs text-muted-foreground">Rs. extra</span>
                          {zone.weightTiers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeWeightTier(zone.id, idx)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWeightTier(zone.id)}
                        className="mt-1"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Weight Tier
                      </Button>
                    </div>
                  </div>

                  {/* Districts */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Districts
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.districts.map((district) => (
                        <Badge key={district} variant="secondary" className="text-xs">
                          {district}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* ---- Test Calculator Tab ---- */}
        <TabsContent value="test" className="mt-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TestTube className="w-4 h-4 text-primary" />
                Test Shipping Calculator
              </CardTitle>
              <CardDescription>
                Enter a test address to see the calculated shipping cost and delivery estimate
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Test District</Label>
                  <select
                    value={testCity}
                    onChange={(e) => setTestCity(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select district</option>
                    {[
                      "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
                      "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
                      "Mullaitivu", "Vavuniya", "Trincomalee", "Batticaloa", "Ampara",
                      "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
                      "Monaragala", "Ratnapura", "Kegalle",
                    ].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Type</Label>
                  <Select
                    value={testDeliveryType}
                    onValueChange={(v) => setTestDeliveryType(v as "standard" | "express")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express (+50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleTestCalculate}
                disabled={!testCity || testLoading}
              >
                {testLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                Calculate
              </Button>

              {/* Test Results */}
              {testResult && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Calculation Result
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground">Shipping Cost</p>
                      <p className="text-lg font-bold text-primary">
                        {(testResult as { shippingCost: number }).shippingCost === 0
                          ? "FREE"
                          : `Rs. ${(testResult as { shippingCost: number }).shippingCost.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground">Estimated Days</p>
                      <p className="text-lg font-bold">
                        {(testResult as { estimatedDays: [number, number] }).estimatedDays[0]}–{(testResult as { estimatedDays: [number, number] }).estimatedDays[1]}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground">COD</p>
                      <p className={`text-lg font-bold ${(testResult as { codAvailable: boolean }).codAvailable ? "text-green-600" : "text-amber-600"}`}>
                        {(testResult as { codAvailable: boolean }).codAvailable ? "Available" : "Not Available"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Zone:</span>{" "}
                      {(testResult as { zone: { name: string } }).zone?.name}
                    </p>
                    <p>
                      <span className="font-medium">Free shipping above:</span>{" "}
                      Rs. {(testResult as { freeShippingThreshold: number }).freeShippingThreshold.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Delivery type:</span>{" "}
                      {testDeliveryType === "express" ? "Express" : "Standard"}
                    </p>
                    {(testResult as { estimatedDelivery?: { minLabel: string; maxLabel: string } }).estimatedDelivery && (
                      <p>
                        <span className="font-medium">Est. dates:</span>{" "}
                        {(testResult as { estimatedDelivery: { minLabel: string; maxLabel: string } }).estimatedDelivery.minLabel} – {(testResult as { estimatedDelivery: { minLabel: string; maxLabel: string } }).estimatedDelivery.maxLabel}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
