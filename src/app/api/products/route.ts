// =============================================================================
// SL HUB COMPUTER - Products API Route
// =============================================================================
// Purpose: GET endpoint for fetching products with filtering, sorting, pagination
// Features: Filter by category, brand, price range, featured/new/sale flags,
//           search query; Sort by price, name, date; Paginated results
//           Server-side caching with 30s TTL for real-time feel
// Query Params: categoryId, brandId, minPrice, maxPrice, isFeatured, isNew,
//               isOnSale, search, sort, page, limit
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deduplicatedFetch, buildCacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isFeatured = searchParams.get("isFeatured");
    const isNew = searchParams.get("isNew");
    const isOnSale = searchParams.get("isOnSale");
    const isBestSeller = searchParams.get("isBestSeller");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build cache key from all query params
    const cacheKey = buildCacheKey("products", {
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      isFeatured,
      isNew,
      isOnSale,
      isBestSeller,
      search,
      sort,
      page,
      limit,
    });

    const result = await deduplicatedFetch(
      cacheKey,
      async () => {
        // Build where clause
        const where: Record<string, unknown> = {};

        if (categoryId) where.categoryId = categoryId;
        if (brandId) where.brandId = brandId;
        
        // Handle boolean flags (case-insensitive "true")
        if (isFeatured?.toLowerCase() === "true") where.isFeatured = true;
        if (isNew?.toLowerCase() === "true") where.isNew = true;
        if (isOnSale?.toLowerCase() === "true") where.isOnSale = true;
        if (isBestSeller?.toLowerCase() === "true") where.isBestSeller = true;

        // Price range filter
        if (minPrice || maxPrice) {
          where.price = {};
          if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
          if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
        }

        // Search filter - search in name, description, and SKU
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { shortDesc: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ];
        }

        // Build order by clause
        let orderBy: Record<string, string> = { createdAt: "desc" };
        switch (sort) {
          case "price-asc":
            orderBy = { price: "asc" };
            break;
          case "price-desc":
            orderBy = { price: "desc" };
            break;
          case "name-asc":
            orderBy = { name: "asc" };
            break;
          case "name-desc":
            orderBy = { name: "desc" };
            break;
          case "newest":
            orderBy = { createdAt: "desc" };
            break;
          default:
            orderBy = { createdAt: "desc" };
        }

        // Run count and data queries in parallel for better performance
        const [total, products] = await Promise.all([
          db.product.count({ where }),
          db.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              shortDesc: true,
              price: true,
              comparePrice: true,
              images: true,
              stock: true,
              isFeatured: true,
              isNew: true,
              isOnSale: true,
              categoryId: true,
              brandId: true,
              createdAt: true,
              category: { select: { id: true, name: true, slug: true } },
              brand: { select: { id: true, name: true, slug: true, logo: true } },
              _count: { select: { reviews: true } },
            },
          }),
        ]);

        return {
          success: true,
          data: products,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      CACHE_TTL.PRODUCTS
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch products",
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
