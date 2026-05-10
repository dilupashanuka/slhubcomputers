// =============================================================================
// SL HUB COMPUTER - Admin Products Page
// =============================================================================
// Purpose: Full CRUD management page for products with table, create/edit
//          dialog, and delete confirmation.
// Features:
//   - Searchable products table with category, brand, price, stock, status
//   - Create/Edit dialog with all product fields
//   - Image upload from local PC with drag-and-drop
//   - Auto WebP conversion on upload for optimized file sizes
//   - Image preview with remove functionality
//   - Delete confirmation with AlertDialog
//   - Category and Brand dropdowns populated from API
//   - Stock status badges (in stock, low stock, out of stock)
//   - Featured/New/Sale flag badges
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Sparkles,
  BadgePercent,
  Upload,
  X,
  ImagePlus,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  price: number;
  originalPrice: number | null;
  images: string;
  specs: string;
  categoryId: string;
  brandId: string;
  stock: number;
  sku: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  warranty: string | null;
  category?: { name: string };
  brand?: { name: string };
  _count?: { reviews: number };
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Default empty form state for creating new products
// ---------------------------------------------------------------------------
const defaultForm = {
  name: "",
  slug: "",
  description: "",
  shortDesc: "",
  price: 0,
  originalPrice: 0,
  images: "[]",
  specs: "{}",
  categoryId: "",
  brandId: "",
  stock: 0,
  sku: "",
  isFeatured: false,
  isNew: false,
  isOnSale: false,
  warranty: "",
};

// ---------------------------------------------------------------------------
// Helper: Generate URL slug from product name
// ---------------------------------------------------------------------------
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Helper: Format currency in LKR
// ---------------------------------------------------------------------------
function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

// ===========================================================================
// ImageUploader Component - Drag & Drop with WebP Auto-Conversion
// ===========================================================================
// Purpose: Sub-component for uploading product images with drag-and-drop
// Features:
//   - Drag and drop zone for images
//   - Click to browse local files
//   - Auto-converts to WebP on server via /api/admin/upload
//   - Shows upload progress indicator
//   - Preview thumbnails with remove button
//   - Supports PNG, JPG, GIF, BMP, WebP input formats
// ===========================================================================
function ImageUploader({
  images,
  onImagesChange,
}: {
  images: string[];
  onImagesChange: (urls: string[]) => void;
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
        validFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          // Add new WebP URLs to existing images
          onImagesChange([...images, ...data.data]);
          toast.success(
            `${data.data.length} image(s) uploaded & converted to WebP!`
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
    [images, onImagesChange]
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
        await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
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
        Product Images (Auto-convert to WebP)
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
                alt={`Product image ${index + 1}`}
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
          product photo • All images are stored in WebP format for optimal
          performance
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Products Page Component
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  // State for products list, search, categories, and brands
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Parsed images array for the ImageUploader component
  const [formImages, setFormImages] = useState<string[]>([]);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch products, categories, and brands from API
  // Re-fetch when search term or refreshKey changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          fetch(`/api/admin/products?limit=100${search ? `&search=${search}` : ""}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();

        if (cancelled) return;
        if (productsData.success) setProducts(productsData.data || []);
        if (categoriesData.success) setCategories(categoriesData.data || []);
        if (brandsData.success) setBrands(brandsData.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [search, refreshKey]);

  // -------------------------------------------------------------------------
  // Sync formImages changes back to form.images JSON string
  // -------------------------------------------------------------------------
  const handleImagesChange = useCallback((urls: string[]) => {
    setFormImages(urls);
    setForm((prev) => ({ ...prev, images: JSON.stringify(urls) }));
  }, []);

  // -------------------------------------------------------------------------
  // Open dialog for creating a new product
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormImages([]);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing product
  // -------------------------------------------------------------------------
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDesc: product.shortDesc || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      images: product.images,
      specs: product.specs,
      categoryId: product.categoryId,
      brandId: product.brandId,
      stock: product.stock,
      sku: product.sku || "",
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      warranty: product.warranty || "",
    });
    // Parse existing images from JSON string
    try {
      const parsed = JSON.parse(product.images);
      setFormImages(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFormImages([]);
    }
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Handle form submission for both create and update
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      // Ensure images are synced to form before submitting
      const submitData = { ...form, images: JSON.stringify(formImages) };

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setRefreshKey((k) => k + 1); // Trigger re-fetch
        toast.success(
          editingId ? "Product updated!" : "Product created!"
        );
      } else {
        toast.error(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save product");
    }
  };

  // -------------------------------------------------------------------------
  // Handle product deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        setRefreshKey((k) => k + 1); // Trigger re-fetch
        toast.success("Product deleted");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header with search and create button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog • Images auto-convert to WebP
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-3.5 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    // Parse first image for thumbnail
                    let firstImage = "";
                    try {
                      const imgs = JSON.parse(product.images);
                      if (Array.isArray(imgs) && imgs.length > 0) {
                        firstImage = imgs[0];
                      }
                    } catch { /* no image */ }

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-10 h-10 rounded-md object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <ImagePlus className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {product.category?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {product.brand?.name || "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatLKR(product.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              product.stock === 0
                                ? "destructive"
                                : product.stock < 5
                                ? "outline"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {product.stock === 0
                              ? "Out"
                              : product.stock < 5
                              ? `Low: ${product.stock}`
                              : product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {product.isFeatured && (
                              <Star className="size-3 text-yellow-500" />
                            )}
                            {product.isNew && (
                              <Sparkles className="size-3 text-green-500" />
                            )}
                            {product.isOnSale && (
                              <BadgePercent className="size-3 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="size-3 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Image Upload Section - Placed first for easy access */}
            <ImageUploader
              images={formImages}
              onImagesChange={handleImagesChange}
            />

            {/* Name and Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="product-slug"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Input
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                placeholder="Brief description for cards"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full product description"
                rows={3}
              />
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price (LKR)</Label>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (LKR)</Label>
                <Input
                  type="number"
                  value={form.originalPrice || ""}
                  onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category and Brand Selects */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) => setForm({ ...form, categoryId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <Select
                  value={form.brandId}
                  onValueChange={(val) => setForm({ ...form, brandId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock and SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock || ""}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
            </div>

            {/* Warranty */}
            <div className="space-y-1.5">
              <Label>Warranty</Label>
              <Input
                value={form.warranty}
                onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                placeholder="e.g. 3 Years"
              />
            </div>

            {/* Flag Toggles */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(val) => setForm({ ...form, isFeatured: val })}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isNew}
                  onCheckedChange={(val) => setForm({ ...form, isNew: val })}
                />
                <Label>New</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isOnSale}
                  onCheckedChange={(val) => setForm({ ...form, isOnSale: val })}
                />
                <Label>On Sale</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {editingId ? "Update" : "Create"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone and will also remove all associated reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
