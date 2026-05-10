// =============================================================================
// SL HUB COMPUTER - Cloudinary Image Upload Utility
// =============================================================================
// Purpose: Cloudinary integration for image uploads with local fallback
// Features:
//   - Server-side signed upload via Cloudinary API
//   - Client-side unsigned upload via upload preset
//   - Image deletion from Cloudinary
//   - Thumbnail URL generation with transformations
//   - Automatic fallback to local file upload when Cloudinary not configured
// =============================================================================

// ---------------------------------------------------------------------------
// Configuration - Check if Cloudinary is properly configured
// ---------------------------------------------------------------------------
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "slhub_uploads";

export const isCloudinaryConfigured = (): boolean => {
  return !!(CLOUD_NAME && API_KEY && API_SECRET);
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface CloudinaryDeleteResult {
  result: string;
}

// ---------------------------------------------------------------------------
// Server-side: Signed Upload to Cloudinary
// ---------------------------------------------------------------------------
export async function uploadImage(
  file: File | Buffer,
  folder: string = "slhub"
): Promise<CloudinaryUploadResult> {
  // If Cloudinary not configured, this shouldn't be called
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Generate signature string
  const paramsToSign: Record<string, string> = {
    timestamp: timestamp.toString(),
    folder,
  };

  // Sort params alphabetically and create signature string
  const signatureString = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  // Create signature using Web Crypto API (no external deps needed)
  const signature = await generateSignature(signatureString, API_SECRET);

  // Prepare form data
  const formData = new FormData();
  const fileToUpload = file instanceof Buffer ? new Blob([file as any]) : file;
  formData.append("file", fileToUpload as any);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", folder);
  formData.append("signature", signature);

  // Upload to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Cloudinary upload failed: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

// ---------------------------------------------------------------------------
// Client-side: Unsigned Upload to Cloudinary (via upload preset)
// ---------------------------------------------------------------------------
export async function uploadImageUnsigned(
  file: File,
  folder: string = "slhub",
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    );
    xhr.send(formData);
  });
}

// ---------------------------------------------------------------------------
// Delete Image from Cloudinary
// ---------------------------------------------------------------------------
export async function deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Generate signature for deletion
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = await generateSignature(paramsToSign, API_SECRET);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete image from Cloudinary");
  }

  const data = await response.json();
  return { result: data.result };
}

// ---------------------------------------------------------------------------
// Generate Thumbnail URL with Cloudinary Transformations
// ---------------------------------------------------------------------------
export function generateThumbnail(
  url: string,
  width: number = 300,
  height: number = 300
): string {
  if (!CLOUD_NAME || !url.includes(CLOUD_NAME)) {
    // Not a Cloudinary URL, return as-is
    return url;
  }

  // Insert transformation into Cloudinary URL
  // Original: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}
  // With transform: https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_300,h_300/v{version}/{public_id}
  const transformPart = `c_fill,w_${width},h_${height},q_auto,f_auto`;

  return url.replace(
    `/image/upload/`,
    `/image/upload/${transformPart}/`
  );
}

// ---------------------------------------------------------------------------
// Generate various transformation URLs
// ---------------------------------------------------------------------------
export function getOptimizedUrl(url: string): string {
  if (!CLOUD_NAME || !url.includes(CLOUD_NAME)) return url;
  return url.replace(`/image/upload/`, `/image/upload/q_auto,f_auto/`);
}

export function getPlaceholderUrl(url: string): string {
  if (!CLOUD_NAME || !url.includes(CLOUD_NAME)) return url;
  return url.replace(
    `/image/upload/`,
    `/image/upload/c_fill,w_20,h_20,q_auto,f_auto,e_blur:1000/`
  );
}

// ---------------------------------------------------------------------------
// Extract public_id from Cloudinary URL
// ---------------------------------------------------------------------------
export function extractPublicId(url: string): string | null {
  if (!CLOUD_NAME || !url.includes(CLOUD_NAME)) return null;

  try {
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}
    // or: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/v{version}/{folder}/{filename}
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Skip version number (v1234567890) and get the rest as public_id
    let parts = pathParts.slice(uploadIndex + 1);

    // Filter out transformation parts (they don't start with 'v' followed by digits)
    parts = parts.filter((part) => !part.match(/^v\d+$/));

    // Remove file extension
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      parts[parts.length - 1] = lastPart.replace(/\.[^.]+$/, "");
    }

    return parts.join("/");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: Generate HMAC-SHA1 signature using Web Crypto API
// ---------------------------------------------------------------------------
async function generateSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
