// =============================================================================
// SL HUB COMPUTER - Admin Banners Page
// =============================================================================
// Purpose: Full CRUD management page for homepage promotional banners with
//          table, create/edit dialog, and delete confirmation.
// Features:
//   - Banners table with title, subtitle, link, order, active status
//   - Create/Edit dialog with title, subtitle, description, image URL,
//     link, button text, background color, order, and active toggle
//   - Active/inactive status badges
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  bgColor: string | null;
  order: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------
const defaultForm = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  link: "",
  buttonText: "",
  bgColor: "",
  order: 0,
  isActive: true,
};

// ---------------------------------------------------------------------------
// Banners Page Component
// ---------------------------------------------------------------------------
export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Preview dialog state
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch banners from API
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/banners");
        const data = await res.json();
        if (!cancelled && data.success) setBanners(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // -------------------------------------------------------------------------
  // Open dialog for creating a new banner
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing banner
  // -------------------------------------------------------------------------
  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      image: banner.image || "",
      link: banner.link || "",
      buttonText: banner.buttonText || "",
      bgColor: banner.bgColor || "",
      order: banner.order,
      isActive: banner.isActive,
    });
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Handle form submission (create or update)
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        subtitle: form.subtitle || null,
        description: form.description || null,
        image: form.image || null,
        link: form.link || null,
        buttonText: form.buttonText || null,
        bgColor: form.bgColor || null,
      };

      const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
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
        alert(data.error || "Failed to save banner");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle banner deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/banners/${deleteId}`, { method: "DELETE" });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage banners
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-3.5 mr-1" />
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Link</TableHead>
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
                ) : banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No banners found. Create your first banner!
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {/* Thumbnail preview */}
                          {banner.image && (
                            <img
                              src={banner.image}
                              alt=""
                              className="w-8 h-5 object-cover rounded"
                            />
                          )}
                          {banner.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {banner.subtitle || "—"}
                      </TableCell>
                      <TableCell className="text-sm max-w-[120px] truncate">
                        {banner.link ? (
                          <span className="text-primary">{banner.link}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {banner.order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={banner.isActive ? "default" : "outline"}
                          className="text-xs"
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setPreviewBanner(banner)}
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(banner)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(banner.id)}>
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

      {/* Banner Preview Dialog */}
      <Dialog open={!!previewBanner} onOpenChange={(open) => !open && setPreviewBanner(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>
          {previewBanner && (
            <div className="space-y-3 py-2">
              {/* Banner preview card */}
              <div
                className={`rounded-lg p-6 text-white ${
                  previewBanner.bgColor || "bg-primary"
                }`}
              >
                {previewBanner.image && (
                  <img
                    src={previewBanner.image}
                    alt={previewBanner.title}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <h3 className="text-lg font-bold">{previewBanner.title}</h3>
                {previewBanner.subtitle && (
                  <p className="text-sm opacity-90">{previewBanner.subtitle}</p>
                )}
                {previewBanner.description && (
                  <p className="text-xs opacity-75 mt-1">{previewBanner.description}</p>
                )}
                {previewBanner.buttonText && (
                  <div className="mt-3">
                    <span className="inline-block px-4 py-1.5 bg-white/20 rounded text-sm">
                      {previewBanner.buttonText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Banner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Banner title"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Banner subtitle"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Banner description"
                rows={2}
              />
            </div>

            {/* Image Upload with WebP conversion */}
            <SingleImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="banners"
            />

            {/* Link and Button Text */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Link URL</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/category/gpus"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Button Text</Label>
                <Input
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
            </div>

            {/* Background Color and Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Background Color</Label>
                <Input
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  placeholder="e.g. bg-blue-600"
                />
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
              {editingId ? "Update" : "Create"} Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner?
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
