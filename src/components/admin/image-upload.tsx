"use client";

import { useState, useRef } from "react";
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
// SingleImageUploader - Enhanced with progress + preview
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
    "supabase" | "local" | null
  >(null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Check if current value is a Supabase Storage URL
  const isSupabaseUrl = value?.includes("supabase.co/storage") ?? false;

  // -----------------------------------------------------------------------
  // Upload via server API (handles Supabase and local fallback)
  // -----------------------------------------------------------------------
  const handleUpload = async (file: File) => {
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
        provider: "supabase" | "local";
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
    // Try to delete from Supabase or Local
    if (currentPublicId || isSupabaseUrl || value?.startsWith("/uploads/")) {
      try {
        const publicId = currentPublicId || extractPublicIdFromUrl(value);
        let endpoint = `/api/admin/upload?url=${encodeURIComponent(value)}`;
        if (publicId) {
          endpoint += `&publicId=${encodeURIComponent(publicId)}`;
        }

        await fetch(endpoint, { method: "DELETE" });
      } catch {
        // Silently fail deletion if there's an error
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
              unoptimized={isSupabaseUrl}
            />
            {/* Provider badge */}
            {uploadProvider && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium">
                {uploadProvider === "supabase" ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Supabase</span>
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
                PNG, JPG, WebP up to 10MB
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
// Helper: Extract public_id from Supabase Storage URL
// ---------------------------------------------------------------------------
function extractPublicIdFromUrl(url: string | undefined): string | null {
  if (!url || !url.includes("supabase.co/storage")) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.indexOf("slhub-image");
    
    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) return null;
    
    // Everything after the bucket name is the path inside the bucket
    return pathParts.slice(bucketIndex + 1).join("/");
  } catch {
    return null;
  }
}
