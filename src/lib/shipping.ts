// =============================================================================
// SL HUB COMPUTER - Shipping Configuration & Calculator
// =============================================================================
// Purpose: Shipping zone definitions, rate calculation, and delivery estimation
//           for Sri Lanka-wide delivery
// Features: Zone-based pricing, weight tiers, express delivery surcharge,
//           COD availability, free shipping thresholds, delivery date estimation
// Business: SL HUB COMPUTER, Deiyandara | Hotline: 071 067 8944
// =============================================================================

// ---------------------------------------------------------------------------
// Shipping Zone Definitions for Sri Lanka
// ---------------------------------------------------------------------------
export interface ShippingZone {
  id: string;
  name: string;
  districts: string[];
  baseRate: number;        // Base shipping cost in LKR
  maxRate: number;         // Maximum shipping cost in LKR
  freeShippingAbove: number; // Free delivery threshold
  estimatedDays: { standard: [number, number]; express: [number, number] }; // [min, max] days
  codAvailable: boolean;   // Cash on Delivery availability
  weightTiers: WeightTier[];
}

export interface WeightTier {
  maxWeight: number;  // kg
  additionalCharge: number; // LKR per kg above base
}

// ---------------------------------------------------------------------------
// Default Shipping Zones
// ---------------------------------------------------------------------------
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "zone-1",
    name: "Zone 1 — Deiyandara & Nearby",
    districts: ["Matara", "Galle", "Hambantota"],
    baseRate: 0,
    maxRate: 250,
    freeShippingAbove: 5000,
    estimatedDays: { standard: [1, 2], express: [1, 1] },
    codAvailable: true,
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 50 },
      { maxWeight: 20, additionalCharge: 100 },
      { maxWeight: 50, additionalCharge: 200 },
    ],
  },
  {
    id: "zone-2",
    name: "Zone 2 — Southern Province",
    districts: ["Galle", "Matara", "Hambantota"],
    baseRate: 300,
    maxRate: 500,
    freeShippingAbove: 15000,
    estimatedDays: { standard: [2, 3], express: [1, 2] },
    codAvailable: true,
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 75 },
      { maxWeight: 20, additionalCharge: 150 },
      { maxWeight: 50, additionalCharge: 300 },
    ],
  },
  {
    id: "zone-3",
    name: "Zone 3 — Western Province",
    districts: ["Colombo", "Gampaha", "Kalutara"],
    baseRate: 400,
    maxRate: 600,
    freeShippingAbove: 25000,
    estimatedDays: { standard: [2, 4], express: [1, 2] },
    codAvailable: true,
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 100 },
      { maxWeight: 20, additionalCharge: 200 },
      { maxWeight: 50, additionalCharge: 400 },
    ],
  },
  {
    id: "zone-4",
    name: "Zone 4 — Central Province",
    districts: ["Kandy", "Matale", "Nuwara Eliya"],
    baseRate: 500,
    maxRate: 700,
    freeShippingAbove: 25000,
    estimatedDays: { standard: [3, 5], express: [2, 3] },
    codAvailable: true,
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 100 },
      { maxWeight: 20, additionalCharge: 200 },
      { maxWeight: 50, additionalCharge: 400 },
    ],
  },
  {
    id: "zone-5",
    name: "Zone 5 — Northern/Eastern Province",
    districts: [
      "Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya",
      "Trincomalee", "Batticaloa", "Ampara",
    ],
    baseRate: 600,
    maxRate: 900,
    freeShippingAbove: 30000,
    estimatedDays: { standard: [4, 7], express: [2, 4] },
    codAvailable: false, // No COD for remote areas
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 150 },
      { maxWeight: 20, additionalCharge: 300 },
      { maxWeight: 50, additionalCharge: 500 },
    ],
  },
  {
    id: "zone-6",
    name: "Zone 6 — Remote Areas",
    districts: [
      "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa",
      "Badulla", "Monaragala", "Ratnapura", "Kegalle",
    ],
    baseRate: 800,
    maxRate: 1200,
    freeShippingAbove: 35000,
    estimatedDays: { standard: [5, 8], express: [3, 5] },
    codAvailable: true,
    weightTiers: [
      { maxWeight: 5, additionalCharge: 0 },
      { maxWeight: 10, additionalCharge: 150 },
      { maxWeight: 20, additionalCharge: 300 },
      { maxWeight: 50, additionalCharge: 600 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Express Delivery Surcharge (50%)
// ---------------------------------------------------------------------------
const EXPRESS_SURCHARGE = 0.5; // 50%

// ---------------------------------------------------------------------------
// Default product weight estimation (kg) per category
// ---------------------------------------------------------------------------
const DEFAULT_WEIGHT_PER_ITEM = 0.5; // 500g default

// ---------------------------------------------------------------------------
// Shipping Calculation Result
// ---------------------------------------------------------------------------
export interface ShippingCalculationResult {
  shippingCost: number;
  estimatedDays: [number, number];
  codAvailable: boolean;
  zone: ShippingZone;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
  deliveryType: "standard" | "express";
  weightUsed: number;
  breakdown: {
    baseRate: number;
    weightCharge: number;
    expressSurcharge: number;
    discount: number;
  };
}

// ---------------------------------------------------------------------------
// Find shipping zone by district/city
// ---------------------------------------------------------------------------
export function findShippingZone(city: string): ShippingZone | null {
  const cityLower = city.toLowerCase().trim();

  // Check each zone's districts
  for (const zone of SHIPPING_ZONES) {
    if (zone.districts.some((d) => d.toLowerCase() === cityLower)) {
      return zone;
    }
  }

  // Fuzzy match - check if city contains a district name or vice versa
  for (const zone of SHIPPING_ZONES) {
    if (
      zone.districts.some(
        (d) =>
          d.toLowerCase().includes(cityLower) ||
          cityLower.includes(d.toLowerCase())
      )
    ) {
      return zone;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Calculate estimated weight for cart items
// ---------------------------------------------------------------------------
export function estimateWeight(items: { productId?: string; quantity: number; price?: number }[]): number {
  // Simple estimation: base weight per item
  // In a real system, this would look up actual product weights
  let totalWeight = 0;
  for (const item of items) {
    // Heuristic: more expensive items tend to be heavier (GPUs, monitors, etc.)
    const itemWeight = item.price
      ? item.price > 50000 ? 3 : item.price > 20000 ? 1.5 : item.price > 5000 ? 1 : DEFAULT_WEIGHT_PER_ITEM
      : DEFAULT_WEIGHT_PER_ITEM;
    totalWeight += itemWeight * item.quantity;
  }
  return Math.round(totalWeight * 10) / 10;
}

// ---------------------------------------------------------------------------
// Calculate weight surcharge based on weight tiers
// ---------------------------------------------------------------------------
function calculateWeightCharge(zone: ShippingZone, weight: number): number {
  let charge = 0;
  for (const tier of zone.weightTiers) {
    if (weight <= tier.maxWeight) {
      charge = tier.additionalCharge;
      break;
    }
  }
  // If weight exceeds all tiers, use the last tier's rate + per-kg overage
  if (weight > zone.weightTiers[zone.weightTiers.length - 1].maxWeight) {
    const lastTier = zone.weightTiers[zone.weightTiers.length - 1];
    const overage = weight - lastTier.maxWeight;
    charge = lastTier.additionalCharge + Math.ceil(overage) * 100; // Rs. 100 per extra kg
  }
  return charge;
}

// ---------------------------------------------------------------------------
// Main shipping calculation function
// ---------------------------------------------------------------------------
export function calculateShipping(
  city: string,
  items: { productId?: string; quantity: number; price?: number }[],
  orderSubtotal: number,
  deliveryType: "standard" | "express" = "standard"
): ShippingCalculationResult {
  const zone = findShippingZone(city);

  if (!zone) {
    // Return default zone (most expensive) if city not found
    return {
      shippingCost: SHIPPING_ZONES[SHIPPING_ZONES.length - 1].maxRate,
      estimatedDays: [5, 10],
      codAvailable: false,
      zone: SHIPPING_ZONES[SHIPPING_ZONES.length - 1],
      freeShippingThreshold: 35000,
      freeShippingRemaining: 35000 - orderSubtotal,
      isFreeShipping: false,
      deliveryType,
      weightUsed: 0,
      breakdown: {
        baseRate: SHIPPING_ZONES[SHIPPING_ZONES.length - 1].maxRate,
        weightCharge: 0,
        expressSurcharge: 0,
        discount: 0,
      },
    };
  }

  const weight = estimateWeight(items);
  const weightCharge = calculateWeightCharge(zone, weight);
  const baseRate = zone.baseRate;
  const isFreeShipping = orderSubtotal >= zone.freeShippingAbove;

  let shippingCost = baseRate + weightCharge;

  // Cap at max rate
  shippingCost = Math.min(shippingCost, zone.maxRate);

  // Apply free shipping discount
  const discount = isFreeShipping ? shippingCost : 0;
  shippingCost = isFreeShipping ? 0 : shippingCost;

  // Apply express surcharge
  let expressSurcharge = 0;
  if (deliveryType === "express" && shippingCost > 0) {
    expressSurcharge = Math.round(shippingCost * EXPRESS_SURCHARGE);
    shippingCost += expressSurcharge;
  }

  const estimatedDays =
    deliveryType === "express"
      ? zone.estimatedDays.express
      : zone.estimatedDays.standard;

  return {
    shippingCost: Math.round(shippingCost),
    estimatedDays,
    codAvailable: zone.codAvailable,
    zone,
    freeShippingThreshold: zone.freeShippingAbove,
    freeShippingRemaining: Math.max(0, zone.freeShippingAbove - orderSubtotal),
    isFreeShipping,
    deliveryType,
    weightUsed: weight,
    breakdown: {
      baseRate,
      weightCharge,
      expressSurcharge,
      discount,
    },
  };
}

// ---------------------------------------------------------------------------
// Get all shipping zones
// ---------------------------------------------------------------------------
export function getShippingZones(): ShippingZone[] {
  return SHIPPING_ZONES;
}

// ---------------------------------------------------------------------------
// Estimate delivery date
// ---------------------------------------------------------------------------
export function estimateDeliveryDate(
  zone: ShippingZone,
  type: "standard" | "express" = "standard"
): { minDate: Date; maxDate: Date; minLabel: string; maxLabel: string } {
  const days = type === "express" ? zone.estimatedDays.express : zone.estimatedDays.standard;
  const now = new Date();

  const addBusinessDays = (startDate: Date, days: number): Date => {
    const date = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0) addedDays++; // Skip Sundays
    }
    return date;
  };

  const minDate = addBusinessDays(now, days[0]);
  const maxDate = addBusinessDays(now, days[1]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-LK", {
      month: "short",
      day: "numeric",
    });
  };

  return {
    minDate,
    maxDate,
    minLabel: formatDate(minDate),
    maxLabel: formatDate(maxDate),
  };
}

// ---------------------------------------------------------------------------
// Sri Lankan Districts for dropdown selectors
// ---------------------------------------------------------------------------
export const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara",
  "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya",
  "Trincomalee", "Batticaloa", "Ampara",
  "Kurunegala", "Puttalam",
  "Anuradhapura", "Polonnaruwa",
  "Badulla", "Monaragala",
  "Ratnapura", "Kegalle",
];

// ---------------------------------------------------------------------------
// Get zone info for a district (for display purposes)
// ---------------------------------------------------------------------------
export function getZoneForDistrict(district: string): {
  zone: ShippingZone | null;
  zoneName: string;
  rate: string;
  freeAbove: string;
  codAvailable: boolean;
} {
  const zone = findShippingZone(district);
  if (!zone) {
    return {
      zone: null,
      zoneName: "Unknown Zone",
      rate: "Contact us",
      freeAbove: "N/A",
      codAvailable: false,
    };
  }
  return {
    zone,
    zoneName: zone.name,
    rate: zone.baseRate === 0 ? "FREE" : `Rs. ${zone.baseRate.toLocaleString()} – ${zone.maxRate.toLocaleString()}`,
    freeAbove: zone.freeShippingAbove > 0 ? `Rs. ${zone.freeShippingAbove.toLocaleString()}` : "Always free",
    codAvailable: zone.codAvailable,
  };
}
