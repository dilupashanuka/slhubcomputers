// =============================================================================
// SL HUB COMPUTER - Data Parsing Utilities
// =============================================================================
// Purpose: Safe parsing of JSON data from database fields
// =============================================================================

/**
 * Safely parse JSON images from database
 */
export function parseImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Safely parse JSON specs from database
 */
export function parseSpecs(specs: any): Record<string, string> {
  if (!specs) return {};
  if (typeof specs === "object" && !Array.isArray(specs)) return specs;
  if (typeof specs === "string") {
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Safely parse JSON tags from database
 */
export function parseTags(tags: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Format currency in LKR
 */
export function formatCurrency(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-LK");
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
