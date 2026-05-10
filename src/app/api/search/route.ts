// =============================================================================
// SL HUB COMPUTER - Enhanced Search API Route
// =============================================================================
// Purpose: GET endpoint for searching products, categories, and brands
// Features: Full-text search with relevance scoring, autocomplete mode,
//           search filters (category, brand, price range, stock, sale, rating),
//           sorting (relevance, price, rating, newest), pagination,
//           popular searches, "did you mean" suggestions
// Query Params:
//   q (search query), mode (autocomplete|full), limit, page, sort,
//   category, brand, priceMin, priceMax, inStock, onSale, rating
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildCacheKey, deduplicatedFetch, CACHE_TTL } from "@/lib/cache";

// ---------------------------------------------------------------------------
// Popular search terms (can be updated dynamically)
// ---------------------------------------------------------------------------
const POPULAR_SEARCHES = [
  "GPU",
  "RAM",
  "SSD",
  "Processor",
  "Motherboard",
  "Power Supply",
  "Gaming PC",
  "Monitor",
  "Keyboard",
  "Mouse",
];

// ---------------------------------------------------------------------------
// Simple Levenshtein distance for "did you mean" suggestions
// ---------------------------------------------------------------------------
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ---------------------------------------------------------------------------
// Relevance scoring: name match > category match > description match
// ---------------------------------------------------------------------------
function calculateRelevance(product: {
  name: string;
  description: string;
  shortDesc: string | null;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Name exact match = highest
  if (product.name.toLowerCase() === q) score += 100;
  // Name starts with query
  else if (product.name.toLowerCase().startsWith(q)) score += 80;
  // Name contains query
  else if (product.name.toLowerCase().includes(q)) score += 60;

  // Brand match
  if (product.brand?.name?.toLowerCase().includes(q)) score += 50;

  // Category match
  if (product.category?.name?.toLowerCase().includes(q)) score += 40;

  // Short description match
  if (product.shortDesc?.toLowerCase().includes(q)) score += 20;

  // Full description match = lowest
  if (product.description.toLowerCase().includes(q)) score += 10;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const mode = searchParams.get("mode") || "full";
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "relevance";

    // Filter params
    const categoryFilter = searchParams.get("category");
    const brandFilter = searchParams.get("brand");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const inStock = searchParams.get("inStock");
    const onSale = searchParams.get("onSale");
    const ratingFilter = searchParams.get("rating");

    // ---- Autocomplete mode ----
    if (mode === "autocomplete") {
      if (!query.trim()) {
        return NextResponse.json({
          success: true,
          data: {
            products: [],
            categories: [],
            brands: [],
            suggestions: POPULAR_SEARCHES.slice(0, 5),
          },
        });
      }

      const cacheKey = buildCacheKey("search:autocomplete", {
        q: query,
        limit,
      });

      const result = await deduplicatedFetch(
        cacheKey,
        async () => {
          const autoLimit = Math.min(limit, 5);

          const [products, categories, brands] = await Promise.all([
            db.product.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { shortDesc: { contains: query, mode: "insensitive" } },
                  { sku: { contains: query, mode: "insensitive" } },
                ],
              },
              take: autoLimit,
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                images: true,
                stock: true,
                isOnSale: true,
                brand: { select: { name: true } },
                category: { select: { name: true } },
              },
              orderBy: { createdAt: "desc" },
            }),
            db.category.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
                isActive: true,
              },
              take: 3,
              select: {
                id: true,
                name: true,
                slug: true,
                _count: { select: { products: true } },
              },
            }),
            db.brand.findMany({
              where: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { country: { contains: query, mode: "insensitive" } },
                ],
                isActive: true,
              },
              take: 3,
              select: {
                id: true,
                name: true,
                slug: true,
                _count: { select: { products: true } },
              },
            }),
          ]);

          return { products, categories, brands, suggestions: [] };
        },
        CACHE_TTL.PRODUCTS
      );

      return NextResponse.json({ success: true, data: result });
    }

    // ---- Full search mode ----
    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: { products: [], categories: [], brands: [] },
        suggestions: POPULAR_SEARCHES,
      });
    }

    const cacheKey = buildCacheKey("search:full", {
      q: query,
      limit,
      page,
      sort,
      category: categoryFilter,
      brand: brandFilter,
      priceMin,
      priceMax,
      inStock,
      onSale,
      rating: ratingFilter,
    });

    const result = await deduplicatedFetch(
      cacheKey,
      async () => {
        // Build product filter
        const productWhere: Record<string, unknown> = {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { shortDesc: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        };

        // Apply filters
        const andConditions: Record<string, unknown>[] = [productWhere];

        if (categoryFilter) {
          andConditions.push({
            categoryId: categoryFilter,
          });
        }

        if (brandFilter) {
          andConditions.push({
            brandId: brandFilter,
          });
        }

        if (priceMin || priceMax) {
          const priceCondition: Record<string, unknown> = {};
          if (priceMin) priceCondition.gte = parseFloat(priceMin);
          if (priceMax) priceCondition.lte = parseFloat(priceMax);
          andConditions.push({ price: priceCondition });
        }

        if (inStock === "true") {
          andConditions.push({ stock: { gt: 0 } });
        }

        if (onSale === "true") {
          andConditions.push({ isOnSale: true });
        }

        if (ratingFilter) {
          andConditions.push({
            rating: { gte: parseInt(ratingFilter) },
          });
        }

        const finalWhere =
          andConditions.length > 1 ? { AND: andConditions } : productWhere;

        // Determine sort order for DB query
        let orderBy: Record<string, string> = { createdAt: "desc" };
        if (sort === "price_asc") orderBy = { price: "asc" };
        else if (sort === "price_desc") orderBy = { price: "desc" };
        else if (sort === "rating") orderBy = { rating: "desc" };
        else if (sort === "newest") orderBy = { createdAt: "desc" };
        // For "relevance", we sort after fetching

        const skip = (page - 1) * limit;

        const [products, categories, brands, total] = await Promise.all([
          db.product.findMany({
            where: finalWhere,
            take: limit + 50, // Fetch extra for relevance sorting
            include: {
              category: { select: { name: true, slug: true } },
              brand: { select: { name: true, slug: true } },
            },
            orderBy,
          }),
          db.category.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
              isActive: true,
            },
            take: 5,
            include: { _count: { select: { products: true } } },
          }),
          db.brand.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { country: { contains: query, mode: "insensitive" } },
              ],
              isActive: true,
            },
            take: 5,
            include: { _count: { select: { products: true } } },
          }),
          db.product.count({ where: finalWhere }),
        ]);

        // Apply relevance scoring if sort is "relevance"
        let sortedProducts = products;
        if (sort === "relevance") {
          sortedProducts = products
            .map((p) => ({
              ...p,
              _relevance: calculateRelevance(p, query),
            }))
            .sort((a, b) => b._relevance - a._relevance)
            .map(({ _relevance, ...p }) => p);
        }

        // Apply pagination after sorting
        const paginatedProducts = sortedProducts.slice(skip, skip + limit);

        // "Did you mean?" - find close matches from product names if few results
        let didYouMean: string[] = [];
        if (paginatedProducts.length === 0 && query.length >= 3) {
          const allProductNames = await db.product.findMany({
            select: { name: true },
            take: 500,
            orderBy: { createdAt: "desc" },
          });

          const queryLower = query.toLowerCase();
          const closeMatches = allProductNames
            .map((p) => ({
              name: p.name,
              dist: Math.min(
                ...p.name
                  .split(/\s+/)
                  .map((word) => levenshtein(queryLower, word.toLowerCase()))
              ),
            }))
            .filter((m) => m.dist <= 3 && m.dist > 0)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 3)
            .map((m) => m.name);

          didYouMean = closeMatches;
        }

        return {
          products: paginatedProducts,
          categories,
          brands,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          didYouMean,
        };
      },
      CACHE_TTL.PRODUCTS
    );

    return NextResponse.json({
      success: true,
      data: result,
      suggestions: !query.trim() ? POPULAR_SEARCHES : undefined,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
