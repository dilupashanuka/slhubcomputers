import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isFeatured = searchParams.get("isFeatured");
    const isNew = searchParams.get("isNew");
    const isOnSale = searchParams.get("isOnSale");
    const isBestSeller = searchParams.get("isBestSeller");
    const isDeal = searchParams.get("isDeal");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isFeatured?.toLowerCase() === "true") where.isFeatured = true;
    if (isNew?.toLowerCase() === "true") where.isNew = true;
    if (isOnSale?.toLowerCase() === "true") where.isOnSale = true;
    if (isBestSeller?.toLowerCase() === "true") where.isBestSeller = true;
    if (isDeal?.toLowerCase() === "true") where.isDeal = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDesc: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "price-asc": orderBy = { price: "asc" }; break;
      case "price-desc": orderBy = { price: "desc" }; break;
      case "name-asc": orderBy = { name: "asc" }; break;
      case "name-desc": orderBy = { name: "desc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, slug: true, sku: true, shortDesc: true,
          price: true, originalPrice: true, images: true, stock: true,
          isFeatured: true, isNew: true, isOnSale: true, isBestSeller: true,
          isDeal: true, dealEndDate: true, categoryId: true, brandId: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    const productsWithParsedData = products.map((product: any) => {
      let parsedImages: any[] = [];
      let parsedSpecs: any = {};
      let parsedTags: any[] = [];
      try { parsedImages = typeof product.images === "string" ? JSON.parse(product.images || "[]") : (product.images || []); } catch (e) {}
      try { parsedSpecs = typeof product.specs === "string" ? JSON.parse(product.specs || "{}") : (product.specs || {}); } catch (e) {}
      try { parsedTags = typeof product.tags === "string" ? JSON.parse(product.tags || "[]") : (product.tags || []); } catch (e) {}
      return { ...product, images: parsedImages, specs: parsedSpecs, tags: parsedTags };
    });

    return NextResponse.json({
      success: true,
      data: productsWithParsedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products", message: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
