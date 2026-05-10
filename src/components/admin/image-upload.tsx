"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Cloud, HardDrive, Loader2 } from "lucide-react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
}

// ---------------------------------------------------------------------------
// Check if Cloudinary is available (client-side)
// ---------------------------------------------------------------------------
function useCloudinaryStatus() {
  const [isCloudinary, setIsCloudinary] = useState<boolean | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/upload", { method: "HEAD" }).catch(
        () => null
      );
      // If we can reach the upload endpoint, check via a simple flag
      // We'll determine Cloudinary availability from the upload response instead
      return null;
    } catch {
      return null;
    }
  }, []);

  return { checkStatus };
}

// ---------------------------------------------------------------------------
// SingleImageUploader - Enhanced with Cloudinary + progress + preview
// ---------------------------------------------------------------------------
export function SingleImageUploader({
  value,
  onChange,
  folder = "slhub",
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadProvider, setUploadProvider] = useState<
    "cloudinary" | "local" | null
  >(null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Check if current value is a Cloudinary URL
  const isCloudinaryUrl = value?.includes("res.cloudinary.com") ?? false;

  // -----------------------------------------------------------------------
  // Upload via server API (handles both Cloudinary and local)
  // -----------------------------------------------------------------------
  const uploadViaServer = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<{
        success: boolean;
        url: string;
        publicId: string | null;
        provider: "cloudinary" | "local";
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setProgress(pct);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", "/api/admin/upload");
        xhr.send(formData);
      });

      if (result.success && result.url) {
        onChange(result.url, result.publicId || undefined);
        setUploadProvider(result.provider);
        setCurrentPublicId(result.publicId);
      } else {
        setError("Upload failed: No URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // -----------------------------------------------------------------------
  // Try Cloudinary unsigned upload (direct from browser), fallback to server
  // -----------------------------------------------------------------------
  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // First, try direct Cloudinary unsigned upload
      const cloudName = await getCloudName();
      if (cloudName) {
        try {
          const result = await uploadToCloudinaryUnsigned(
            file,
            cloudName,
            folder,
            (p) => setProgress(p)
          );
          onChange(result.url, result.publicId);
          setUploadProvider("cloudinary");
          setCurrentPublicId(result.publicId);
          return;
        } catch {
          // Cloudinary unsigned upload failed, fall back to server upload
        }
      }

      // Fallback: upload via server API
      await uploadViaServer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // -----------------------------------------------------------------------
  // File input change handler
  // -----------------------------------------------------------------------
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUpload(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // -----------------------------------------------------------------------
  // Drag & drop handlers
  // -----------------------------------------------------------------------
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  // -----------------------------------------------------------------------
  // Remove image handler
  // -----------------------------------------------------------------------
  const handleRemove = async () => {
    // If Cloudinary image, try to delete from Cloudinary
    if (currentPublicId || isCloudinaryUrl) {
      try {
        const publicId = currentPublicId || extractPublicIdFromUrl(value);
        if (publicId) {
          await fetch(
            `/api/admin/upload?publicId=${encodeURIComponent(publicId)}&url=${encodeURIComponent(value)}`,
            { method: "DELETE" }
          );
        }
      } catch {
        // Silently fail deletion from Cloudinary
      }
    } else if (value?.startsWith("/uploads/")) {
      // Delete local file
      try {
        await fetch(
          `/api/admin/upload?url=${encodeURIComponent(value)}`,
          { method: "DELETE" }
        );
      } catch {
        // Silently fail
      }
    }

    onChange("", undefined);
    setCurrentPublicId(null);
    setUploadProvider(null);
    setError(null);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          {/* Image Preview */}
          <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-muted/20">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-contain p-2"
              unoptimized={isCloudinaryUrl}
            />
            {/* Provider badge */}
            {uploadProvider && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium">
                {uploadProvider === "cloudinary" ? (
                  <>
                    <Cloud className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400">Cloud</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Local</span>
                  </>
                )}
              </div>
            )}
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
            cursor-pointer transition-all duration-200
            ${dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            }
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 px-6 w-full max-w-[200px]">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">
                Uploading... {progress}%
              </span>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">
                Click or drag to upload
              </span>
              <span className="text-[11px] text-muted-foreground/60 mt-1">
                PNG, JPG, WebP up to 5MB
              </span>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* URL input as alternative */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setError(null);
          }}
          placeholder="Or paste image URL"
          className="text-xs"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={handleRemove}
            title="Clear"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Get Cloudinary cloud name (client-side)
// ---------------------------------------------------------------------------
let cachedCloudName: string | null = null;

async function getCloudName(): Promise<string | null> {
  if (cachedCloudName !== undefined) return cachedCloudName;

  try {
    // The cloud name is embedded in env vars on the server.
    // Client can try to detect it by making a test request.
    // For simplicity, we'll just use the server upload route.
    cachedCloudName = null;
    return null;
  } catch {
    cachedCloudName = null;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: Cloudinary unsigned upload (direct browser → Cloudinary)
// ---------------------------------------------------------------------------
interface UnsignedUploadResult {
  url: string;
  publicId: string;
}

async function uploadToCloudinaryUnsigned(
  file: File,
  cloudName: string,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<UnsignedUploadResult> {
  const uploadPreset = "slhub_uploads";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
          });
        } catch {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );
    xhr.send(formData);
  });
}

// ---------------------------------------------------------------------------
// Helper: Extract public_id from Cloudinary URL
// ---------------------------------------------------------------------------
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    let parts = pathParts.slice(uploadIndex + 1);
    parts = parts.filter((part) => !part.match(/^v\d+$/));

    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      parts[parts.length - 1] = lastPart.replace(/\.[^.]+$/, "");
    }

    return parts.join("/");
  } catch {
    return null;
  }
}
