// =============================================================================
// SL HUB COMPUTER - Admin Affiliates API Route
// =============================================================================
// Purpose: Admin management of affiliates
// Features:
//   - GET: List all affiliates with stats
//   - POST: Create a new affiliate manually
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeForStorage, validateEmail } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/admin/affiliates - List all affiliates
// Query params: ?search=xxx&status=active/inactive&page=1&limit=20
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const [affiliates, total] = await Promise.all([
      db.affiliate.findMany({
        where,
        include: {
          _count: { select: { referrals: true, payments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.affiliate.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: affiliates,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin affiliates GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/affiliates - Create affiliate manually
// Body: { name, email, phone?, commissionRate?, code? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, commissionRate, code } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = await db.affiliate.findFirst({
      where: { email: sanitizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Affiliate with this email already exists" },
        { status: 409 }
      );
    }

    // Generate code if not provided
    let affiliateCode = code?.trim()
      ? sanitizeForStorage(code.trim().toUpperCase())
      : `SLHUB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Ensure code uniqueness
    const existingCode = await db.affiliate.findUnique({
      where: { code: affiliateCode },
    });
    if (existingCode) {
      affiliateCode = `SLHUB-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    }

    const affiliate = await db.affiliate.create({
      data: {
        code: affiliateCode,
        name: sanitizeForStorage(name.trim()),
        email: sanitizedEmail,
        phone: phone?.trim() ? sanitizeForStorage(phone.trim()) : null,
        commissionRate: typeof commissionRate === "number" ? commissionRate : 5,
      },
    });

    return NextResponse.json(
      { success: true, data: affiliate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin affiliates POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create affiliate" },
      { status: 500 }
    );
  }
}
