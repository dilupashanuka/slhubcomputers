import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const POPULAR_SEARCHES = ["GPU", "RAM", "SSD", "Processor", "Motherboard", "Power Supply", "Gaming PC", "Monitor", "Keyboard", "Mouse"];

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function calculateRelevance(product: { name: string; description: string; shortDesc: string | null; category?: { name: string } | null; brand?: { name: string } | null }, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (product.name.toLowerCase() === q) score += 100;
  else if (product.name.toLowerCase().startsWith(q)) score += 80;
  else if (product.name.toLowerCase().includes(q)) score += 60;
  if (product.brand?.name?.toLowerCase().includes(q)) score += 50;
  if (product.category?.name?.toLowerCase().includes(q)) score += 40;
  if (product.shortDesc?.toLowerCase().includes(q)) score += 20;
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
    const categoryFilter = searchParams.get("category");
    const brandFilter = searchParams.get("brand");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const inStock = searchParams.get("inStock");
    const onSale = searchParams.get("onSale");
    const ratingFilter = searchParams.get("rating");

    if (mode === "autocomplete") {
      if (!query.trim()) {
        return NextResponse.json({ success: true, data: { products: [], categories: [], brands: [], suggestions: POPULAR_SEARCHES.slice(0, 5) } });
      }
      const autoLimit = Math.min(limit, 5);
      const [products, categories, brands] = await Promise.all([
        db.product.findMany({
          where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { shortDesc: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }] },
          take: autoLimit,
          select: { id: true, name: true, slug: true, price: true, originalPrice: true, images: true, stock: true, isOnSale: true, brand: { select: { name: true } }, category: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        }),
        db.category.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }], isActive: true }, take: 3, select: { id: true, name: true, slug: true, _count: { select: { products: true } } } }),
        db.brand.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { country: { contains: query, mode: "insensitive" } }], isActive: true }, take: 3, select: { id: true, name: true, slug: true, _count: { select: { products: true } } } }),
      ]);
      return NextResponse.json({ success: true, data: { products, categories, brands, suggestions: [] } });
    }

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: { products: [], categories: [], brands: [] }, suggestions: POPULAR_SEARCHES });
    }

    const productWhere: Record<string, unknown> = {
      OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { shortDesc: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }],
    };
    const andConditions: Record<string, unknown>[] = [productWhere];
    if (categoryFilter) andConditions.push({ categoryId: categoryFilter });
    if (brandFilter) andConditions.push({ brandId: brandFilter });
    if (priceMin || priceMax) {
      const priceCondition: Record<string, unknown> = {};
      if (priceMin) priceCondition.gte = parseFloat(priceMin);
      if (priceMax) priceCondition.lte = parseFloat(priceMax);
      andConditions.push({ price: priceCondition });
    }
    if (inStock === "true") andConditions.push({ stock: { gt: 0 } });
    if (onSale === "true") andConditions.push({ isOnSale: true });
    if (ratingFilter) andConditions.push({ rating: { gte: parseInt(ratingFilter) } });
    const finalWhere = andConditions.length > 1 ? { AND: andConditions } : productWhere;

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };

    const skip = (page - 1) * limit;
    const [products, categories, brands, total] = await Promise.all([
      db.product.findMany({ where: finalWhere, take: limit + 50, include: { category: { select: { name: true, slug: true } }, brand: { select: { name: true, slug: true } } }, orderBy }),
      db.category.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }], isActive: true }, take: 5, include: { _count: { select: { products: true } } } }),
      db.brand.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { country: { contains: query, mode: "insensitive" } }], isActive: true }, take: 5, include: { _count: { select: { products: true } } } }),
      db.product.count({ where: finalWhere }),
    ]);

    let sortedProducts = products;
    if (sort === "relevance") {
      sortedProducts = products
        .map((p) => ({ ...p, _relevance: calculateRelevance(p, query) }))
        .sort((a, b) => b._relevance - a._relevance)
        .map(({ _relevance, ...p }: any) => p);
    }
    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    let didYouMean: string[] = [];
    if (paginatedProducts.length === 0 && query.length >= 3) {
      const allProductNames = await db.product.findMany({ select: { name: true }, take: 500, orderBy: { createdAt: "desc" } });
      const queryLower = query.toLowerCase();
      didYouMean = allProductNames
        .map((p) => ({ name: p.name, dist: Math.min(...p.name.split(/\s+/).map((word) => levenshtein(queryLower, word.toLowerCase()))) }))
        .filter((m) => m.dist <= 3 && m.dist > 0)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
        .map((m) => m.name);
    }

    return NextResponse.json({
      success: true,
      data: { products: paginatedProducts, categories, brands, total, page, totalPages: Math.ceil(total / limit), didYouMean },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
