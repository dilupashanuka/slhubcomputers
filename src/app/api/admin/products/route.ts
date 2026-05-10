// =============================================================================
// SL HUB COMPUTER - Admin Products API
// =============================================================================
// Purpose: CRUD endpoints for product management
// GET: List all products with filters (admin view includes inactive)
// POST: Create new product
// Cache: Invalidates "products" cache on POST
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidate } from "@/lib/cache";

// GET - List all products (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: products, total, page, limit });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await db.product.create({ data: body });

    // Invalidate products cache
    invalidate("products");

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
