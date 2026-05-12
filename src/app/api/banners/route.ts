import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Banners GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const banner = await db.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        image: body.image,
        link: body.link,
        buttonText: body.buttonText,
        bgColor: body.bgColor,
        order: parseInt(body.order || "0"),
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Banners POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create banner" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const banner = await db.banner.update({
      where: { id },
      data: {
        ...data,
        order: data.order ? parseInt(data.order) : undefined,
      },
    });
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Banners PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    
    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Banners DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete banner" }, { status: 500 });
  }
}
