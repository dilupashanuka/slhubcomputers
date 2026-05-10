import { createClient } from "../../utils/supabase/client";

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "slhub-image";

export interface StorageUploadResult {
  url: string;
  path: string;
}

export async function uploadImage(
  file: File,
  path: string = "products"
): Promise<StorageUploadResult> {
  const supabase = createClient();
  
  // Generate a unique filename to avoid collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath
  };
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Supabase storage deletion failed: ${error.message}`);
  }
}

export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return publicUrl;
}
