// =============================================================================
// SL HUB COMPUTER - Image Upload API
// =============================================================================
// Purpose: Handle image uploads with Cloudinary support and local fallback
// Features:
//   - Cloudinary upload when configured (server-side signed upload)
//   - Local file upload fallback when Cloudinary not configured
//   - File validation (type, size)
//   - Returns URL and publicId for Cloudinary images
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 5MB`,
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------
    // Try Cloudinary upload if configured
    // ---------------------------------------------------------------
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadImage(file, folder);
        return NextResponse.json({
          success: true,
          url: result.url,
          publicId: result.publicId,
          provider: "cloudinary",
          width: result.width,
          height: result.height,
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, falling back to local:", cloudinaryError);
        // Fall through to local upload
      }
    }

    // ---------------------------------------------------------------
    // Local file upload fallback
    // ---------------------------------------------------------------
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
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

    // If Cloudinary image with publicId, delete from Cloudinary
    if (publicId && isCloudinaryConfigured()) {
      const { deleteImage } = await import("@/lib/cloudinary");
      await deleteImage(publicId);
      return NextResponse.json({ success: true, message: "Image deleted from Cloudinary" });
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
