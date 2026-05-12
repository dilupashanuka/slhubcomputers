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
import { useRouter } from "next/navigation";
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
  DialogDescription,
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
import { MultipleImageUploader } from "@/components/admin/multiple-image-uploader";

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

// Used to be inline ImageUploader here, now imported

// ---------------------------------------------------------------------------
// Products Page Component
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  const router = useRouter();
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
      const parsed = typeof product.images === "string" ? JSON.parse(product.images || "[]") : (product.images || []);
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
        router.refresh();
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
      // Optimistic update
      const idToDelete = deleteId;
      setProducts((prev) => prev.filter((p) => p.id !== idToDelete));
      setDeleteId(null);

      const res = await fetch(`/api/admin/products/${idToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted");
        setRefreshKey((k) => k + 1); // Final sync
        router.refresh();
      } else {
        // Rollback if failed
        setRefreshKey((k) => k + 1);
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
      setRefreshKey((k) => k + 1);
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
                      const imgs = typeof product.images === "string" ? JSON.parse(product.images || "[]") : (product.images || []);
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
            <DialogDescription>
              {editingId 
                ? "Update the product details, images, and inventory information." 
                : "Fill in the details below to add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <MultipleImageUploader
              images={formImages}
              onImagesChange={handleImagesChange}
              folder="products"
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
