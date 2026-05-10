import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const pages = await db.pageContent.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = await db.pageContent.create({ data: { slug: body.slug, title: body.title, content: body.content, metaTitle: body.metaTitle || null, metaDescription: body.metaDescription || null, isActive: body.isActive !== false } });
    return NextResponse.json({ success: true, data: page });
  } catch (error) { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
