// =============================================================================
// SL HUB COMPUTER - Admin Categories Page
// =============================================================================
// Purpose: Full CRUD management page for product categories with table,
//          create/edit dialog, and delete confirmation.
// Features:
//   - Categories table with name, slug, product count, order, active status
//   - Create/Edit dialog with name, slug (auto-generated), description,
//     image URL, icon, parent category, order, and active toggle
//   - Hierarchical category support (parent/child)
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, ImageIcon } from "lucide-react";
import { SingleImageUploader } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
  children?: Category[];
}

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------
const defaultForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  icon: "",
  parentId: "",
  order: 0,
  isActive: true,
};

// ---------------------------------------------------------------------------
// Helper: Generate slug from name
// ---------------------------------------------------------------------------
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Categories Page Component
// ---------------------------------------------------------------------------
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch categories from API
  // Re-fetch when refreshKey changes
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (!cancelled && data.success) setCategories(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Filter categories by search term
  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------------------------------------------------------------
  // Open dialog for creating a new category
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing category
  // -------------------------------------------------------------------------
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      icon: category.icon || "",
      parentId: category.parentId || "",
      order: category.order,
      isActive: category.isActive,
    });
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Handle form submission (create or update)
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      // Prepare data, converting empty parentId to null
      const payload = {
        ...form,
        parentId: form.parentId || null,
        image: form.image || null,
        icon: form.icon || null,
        description: form.description || null,
      };

      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        alert(data.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle category deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        setRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8 h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-3.5 mr-1" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {/* Show parent indicator if it's a sub-category */}
                        {category.parentId && (
                          <span className="text-muted-foreground mr-1">↳</span>
                        )}
                        {category.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {category._count?.products || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {category.order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={category.isActive ? "default" : "outline"}
                          className="text-xs"
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(category)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(category.id)}>
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name and Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })
                  }
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Category description"
                rows={2}
              />
            </div>

            {/* Image and Icon URLs */}
            <div className="grid grid-cols-1 gap-3 border p-3 rounded-lg bg-muted/10">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="size-3.5" />
                  Category Image (Drag & Drop)
                </Label>
                <SingleImageUploader
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  folder="categories"
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <Label>Icon Name (Lucide)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.target (e.g. laptop, smartphone)"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Parent Category and Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Parent Category</Label>
                <Select
                  value={form.parentId}
                  onValueChange={(val) => setForm({ ...form, parentId: val as string })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None (Top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only show categories that aren't the one being edited */}
                    {categories
                      .filter((c) => c.id !== editingId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) => setForm({ ...form, isActive: val })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {editingId ? "Update" : "Create"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Deleting a category may affect products assigned to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
