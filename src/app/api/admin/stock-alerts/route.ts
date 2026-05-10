// =============================================================================
// SL HUB COMPUTER - Stock Alerts API
// =============================================================================
// Purpose: GET endpoint for admin stock alerts - products with low stock
// Features: Configurable threshold, returns product name, current stock,
//           category, and brand information for restocking decisions
// Query Params: threshold (default: 5)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  sku: string | null;
  price: number;
  image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  };
}

interface StockAlertsResponse {
  success: boolean;
  data: {
    threshold: number;
    totalLowStock: number;
    outOfStock: number;
    lowStock: number;
    products: LowStockProduct[];
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // -------------------------------------------------------------------------
    // Parse threshold parameter (default: 5)
    // -------------------------------------------------------------------------
    const threshold = Math.max(0, parseInt(searchParams.get("threshold") || "5"));

    // -------------------------------------------------------------------------
    // Fetch products with stock at or below the threshold
    // -------------------------------------------------------------------------
    const products = await db.product.findMany({
      where: {
        stock: { lte: threshold },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        sku: true,
        price: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    // -------------------------------------------------------------------------
    // Parse the first image from JSON string for each product
    // -------------------------------------------------------------------------
    const formattedProducts: LowStockProduct[] = products.map((product) => {
      let image: string | null = null;
      try {
        const images = JSON.parse(product.images);
        if (Array.isArray(images) && images.length > 0) {
          image = images[0];
        }
      } catch {
        // If images is not valid JSON, use as-is if it's a single URL
        image = product.images || null;
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        stock: product.stock,
        sku: product.sku,
        price: product.price,
        image,
        category: product.category,
        brand: product.brand,
      };
    });

    // -------------------------------------------------------------------------
    // Separate out-of-stock (0) from low-stock items
    // -------------------------------------------------------------------------
    const outOfStock = formattedProducts.filter((p) => p.stock === 0).length;
    const lowStock = formattedProducts.filter((p) => p.stock > 0 && p.stock <= threshold).length;

    // -------------------------------------------------------------------------
    // Return stock alerts data
    // -------------------------------------------------------------------------
    return NextResponse.json<StockAlertsResponse>({
      success: true,
      data: {
        threshold,
        totalLowStock: formattedProducts.length,
        outOfStock,
        lowStock,
        products: formattedProducts,
      },
    });
  } catch (error) {
    console.error("Stock alerts API error:", error);
    return NextResponse.json<StockAlertsResponse>(
      { success: false, data: { threshold: 5, totalLowStock: 0, outOfStock: 0, lowStock: 0, products: [] }, error: "Failed to fetch stock alerts" },
      { status: 500 }
    );
  }
}
