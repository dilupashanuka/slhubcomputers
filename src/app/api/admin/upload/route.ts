// =============================================================================
// SL HUB COMPUTER - Image Upload API
// =============================================================================
// Purpose: Handle image uploads with Supabase support and local fallback
// Features:
//   - Supabase upload when configured
//   - Local file upload fallback when Supabase not configured
//   - File validation (type, size)
//   - Returns URL and publicId for Supabase images
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { uploadImage, isSupabaseConfigured } from "@/lib/supabase-storage";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

// ---------------------------------------------------------------------------
// POST - Upload image
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "slhub";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 10MB`,
        },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let fileName = file.name;
    let mimeType = file.type;

    // Convert to WebP using sharp if it's an image (and not already svg/gif which might lose animation/vector)
    if (file.type !== "image/svg+xml" && file.type !== "image/gif") {
      buffer = await sharp(buffer as any)
        .webp({ quality: 80 })
        .toBuffer();
      // Replace extension with .webp
      fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
      mimeType = "image/webp";
    }

    // ---------------------------------------------------------------
    // Try Supabase upload if configured
    // ---------------------------------------------------------------
    if (isSupabaseConfigured()) {
      try {
        const result = await uploadImage(buffer, fileName, folder, mimeType);
        return NextResponse.json({
          success: true,
          url: result.url,
          publicId: result.publicId,
          provider: "supabase",
        });
      } catch (supabaseError) {
        console.error("Supabase upload failed, falling back to local:", supabaseError);
        // Fall through to local upload
      }
    }

    // ---------------------------------------------------------------
    // Local file upload fallback
    // ---------------------------------------------------------------
    // Generate unique filename
    const ext = path.extname(fileName) || ".png";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return URL path (relative to public)
    const url = `/uploads/${folder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url,
      publicId: null,
      provider: "local",
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE - Remove image
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const url = searchParams.get("url");

    // If Supabase image with publicId, delete from Supabase
    if (publicId && isSupabaseConfigured()) {
      const { deleteImage } = await import("@/lib/supabase-storage");
      await deleteImage(publicId);
      return NextResponse.json({ success: true, message: "Image deleted from Supabase" });
    }

    // If local file, delete from filesystem
    if (url && url.startsWith("/uploads/")) {
      const { unlink } = await import("fs/promises");
      const filePath = path.join(process.cwd(), "public", url);
      try {
        await unlink(filePath);
      } catch {
        // File might not exist, that's OK
      }
      return NextResponse.json({ success: true, message: "Local file deleted" });
    }

    return NextResponse.json(
      { success: false, error: "No valid image identifier provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
