// =============================================================================
// SL HUB COMPUTER - Image Upload API (Supabase Storage)
// =============================================================================
// Purpose: Upload images to Supabase Storage
// Supports: "file" (single) and "files" (multiple) form fields
// Returns:  { success, url }  for single  |  { success, urls }  for multiple
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "slhub-image";

// ---------------------------------------------------------------------------
// POST - Upload one or more images
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "products";

    // Collect files from both "file" and "files" fields
    const multipleFiles = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const isMultiple = multipleFiles.length > 0;

    const filesToUpload: File[] = isMultiple
      ? multipleFiles
      : singleFile
      ? [singleFile]
      : [];

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `"${file.name}" exceeds 10 MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `"${file.name}" has unsupported type: ${file.type}` },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const filePath = `${folder}/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        console.error("Error details:", JSON.stringify(uploadError, null, 2));
        return NextResponse.json(
          { 
            success: false, 
            error: `Upload failed: ${uploadError.message}`,
            details: uploadError
          },
          { status: 500 }
        );
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    // Return format: single → { url }, multiple → { urls }
    if (isMultiple) {
      return NextResponse.json({ success: true, urls: uploadedUrls });
    }
    return NextResponse.json({ success: true, url: uploadedUrls[0] });

  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE - Remove an image from Supabase Storage
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "No URL provided" },
        { status: 400 }
      );
    }

    // Extract the storage path from the full public URL
    // URL format: .../storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const filePath = url.slice(idx + marker.length);
      const supabase = await createClient();
      const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
      if (error) console.error("Supabase delete error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete handler error:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
