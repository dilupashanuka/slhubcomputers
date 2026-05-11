"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Cloud, Loader2 } from "lucide-react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

// ---------------------------------------------------------------------------
// SingleImageUploader — uploads to Supabase Storage via /api/admin/upload
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
  const [dragOver, setDragOver] = useState(false);

  // -----------------------------------------------------------------------
  // Upload via server API
  // -----------------------------------------------------------------------
  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const result = await new Promise<{ success: boolean; url?: string; error?: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 90));
            }
          });

          xhr.addEventListener("load", () => {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response from server"));
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

          xhr.open("POST", "/api/admin/upload");
          xhr.send(formData);
        }
      );

      if (result.success && result.url) {
        setProgress(100);
        onChange(result.url);
      } else {
        setError(result.error || "Upload failed: no URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // -----------------------------------------------------------------------
  // Delete image from Supabase Storage
  // -----------------------------------------------------------------------
  const handleRemove = async () => {
    if (value) {
      try {
        await fetch(`/api/admin/upload?url=${encodeURIComponent(value)}`, {
          method: "DELETE",
        });
      } catch {
        // Silently fail — removing from UI regardless
      }
    }
    onChange("");
    setError(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleUpload(file);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-muted/20">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-contain p-2"
              unoptimized
            />
            {/* Supabase badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium">
              <Cloud className="w-3 h-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Supabase</span>
            </div>
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
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
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
              <span className="text-xs text-muted-foreground">Uploading... {progress}%</span>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Click or drag to upload</span>
              <span className="text-[11px] text-muted-foreground/60 mt-1">PNG, JPG, WebP up to 10MB</span>
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
          onChange={(e) => { onChange(e.target.value); setError(null); }}
          placeholder="Or paste image URL"
          className="text-xs"
        />
        {value && (
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={handleRemove}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
