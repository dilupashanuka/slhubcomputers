// =============================================================================
// SL HUB COMPUTER - Supabase Storage Utility
// =============================================================================
// Purpose: Supabase Storage integration for image uploads with local fallback
// Features:
//   - Upload via Supabase Storage
//   - Image deletion from Supabase Storage
//   - Public URL generation
//   - Automatic fallback to local file upload when Supabase not configured
// =============================================================================

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Configuration - Check if Supabase is properly configured
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Using anon key because it's required to initialize the client, but for server-side uploads
// without Row Level Security bypassing, we might need a service role key.
// Assuming bucket is public and allows anon uploads if configured that way, 
// OR we use standard Next.js API route to upload.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET_NAME = "slhub-image";

const supabase = createClient(SUPABASE_URL || "https://placeholder.supabase.co", SUPABASE_KEY || "placeholder-key");

export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_KEY);
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StorageUploadResult {
  url: string;
  publicId: string;
  provider: "supabase" | "local";
}

// ---------------------------------------------------------------------------
// Server-side: Upload to Supabase Storage
// ---------------------------------------------------------------------------
export async function uploadImage(
  file: File | Buffer,
  filename: string,
  folder: string = "slhub",
  contentType: string = "image/jpeg"
): Promise<StorageUploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  // Construct a unique path
  const ext = filename.split('.').pop() || "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = `${folder}/${uniqueName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: contentType,
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    publicId: data.path,
    provider: "supabase"
  };
}

// ---------------------------------------------------------------------------
// Delete Image from Supabase Storage
// ---------------------------------------------------------------------------
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([publicId]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  return true;
}
