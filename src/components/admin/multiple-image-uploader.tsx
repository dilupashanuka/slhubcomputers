"use client";

import { useState, useCallback, useRef } from "react";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ===========================================================================
// MultipleImageUploader Component - Drag & Drop with WebP Auto-Conversion
// ===========================================================================
// Purpose: Sub-component for uploading multiple product images with drag-and-drop
// Features:
//   - Drag and drop zone for images
//   - Click to browse local files
//   - Auto-converts to WebP on server via /api/admin/upload
//   - Shows upload progress indicator
//   - Preview thumbnails with remove button
//   - Supports PNG, JPG, GIF, BMP, WebP input formats
// ===========================================================================
export function MultipleImageUploader({
  images,
  onImagesChange,
  folder = "products",
}: {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------------
  // Upload files to server and get WebP URLs back
  // -----------------------------------------------------------------------
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (files.length === 0) return;

      // Validate file types before uploading
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/webp",
      ];
      const validFiles: File[] = [];

      for (const file of files) {
        if (!validTypes.includes(file.type)) {
          toast.error(`"${file.name}" is not a supported image format`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 10MB limit`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("folder", folder);
        validFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          // Add new WebP URLs to existing images
          onImagesChange([...images, ...data.urls]);
          toast.success(
            `${data.urls.length} image(s) uploaded successfully!`
          );
        } else {
          toast.error(data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images");
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, folder]
  );

  // -----------------------------------------------------------------------
  // Handle drag and drop events
  // -----------------------------------------------------------------------
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  // -----------------------------------------------------------------------
  // Handle file input change (click to browse)
  // -----------------------------------------------------------------------
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
        // Reset input so the same file can be re-selected
        e.target.value = "";
      }
    },
    [uploadFiles]
  );

  // -----------------------------------------------------------------------
  // Remove an image from the list
  // -----------------------------------------------------------------------
  const handleRemoveImage = useCallback(
    async (index: number) => {
      const url = images[index];
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      // Try to delete from server storage
      try {
        await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
          method: "DELETE",
        });
      } catch {
        // Silently fail - image removed from form either way
      }
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ImagePlus className="w-4 h-4" />
        Images (Auto-convert to WebP)
      </Label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp,image/tiff,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-blue-600">
              Uploading & converting to WebP...
            </p>
            <p className="text-xs text-muted-foreground">
              Please wait, this may take a moment
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, GIF, BMP, WebP • Max 10MB each • Auto-converts
              to WebP
            </p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={url + index}
              className="relative group rounded-lg overflow-hidden border bg-gray-50 dark:bg-gray-800"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-28 object-cover"
              />
              {/* Badge showing WebP format */}
              <div className="absolute top-1 left-1">
                <Badge className="bg-green-600 text-white text-[9px] px-1 py-0">
                  WebP
                </Badge>
              </div>
              {/* Image order badge */}
              <div className="absolute top-1 right-7">
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 bg-black/50 text-white"
                >
                  {index === 0 ? "Main" : `#${index + 1}`}
                </Badge>
              </div>
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image count info */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} image(s) selected • First image will be the main
          photo • All images are stored in WebP format for optimal
          performance
        </p>
      )}
    </div>
  );
}
