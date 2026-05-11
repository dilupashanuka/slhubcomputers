// =============================================================================
// SL HUB COMPUTER - Admin Services Page
// =============================================================================
// Purpose: Full CRUD management page for SL HUB COMPUTER services with
//          table, create/edit dialog, and delete confirmation.
// Features:
//   - Services table with name, slug, icon, price, order, active status
//   - Create/Edit dialog with name, slug (auto-generated), description,
//     icon name, image URL, features (tag input), price range, order, active toggle
//   - Features tag input: type and press Enter to add tags
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { Plus, Pencil, Trash2, X, ImageIcon } from "lucide-react";
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
interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  features: string | null; // JSON array of feature strings
  price: string | null; // Price range text
  order: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------
const defaultForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  image: "",
  features: [] as string[], // Parsed from JSON for editing
  price: "",
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
// Services Page Component
// ---------------------------------------------------------------------------
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Feature tag input state
  const [featureInput, setFeatureInput] = useState("");

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch services from API
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/services");
        const data = await res.json();
        if (!cancelled && data.success) setServices(data.data || []);
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
  // Parse features JSON string to array for display
  // -------------------------------------------------------------------------
  const parseFeatures = (featuresJson: string | null): string[] => {
    if (!featuresJson) return [];
    try {
      return JSON.parse(featuresJson);
    } catch {
      return [];
    }
  };

  // -------------------------------------------------------------------------
  // Open dialog for creating a new service
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFeatureInput("");
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing service
  // -------------------------------------------------------------------------
  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      slug: service.slug,
      description: service.description,
      icon: service.icon || "",
      image: service.image || "",
      features: parseFeatures(service.features),
      price: service.price || "",
      order: service.order,
      isActive: service.isActive,
    });
    setFeatureInput("");
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Add a feature tag when Enter is pressed
  // -------------------------------------------------------------------------
  const addFeature = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && featureInput.trim()) {
      e.preventDefault();
      if (!form.features.includes(featureInput.trim())) {
        setForm({ ...form, features: [...form.features, featureInput.trim()] });
      }
      setFeatureInput("");
    }
  };

  // -------------------------------------------------------------------------
  // Remove a feature tag
  // -------------------------------------------------------------------------
  const removeFeature = (index: number) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== index),
    });
  };

  // -------------------------------------------------------------------------
  // Handle form submission (create or update)
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        icon: form.icon || null,
        image: form.image || null,
        features: form.features.length > 0 ? JSON.stringify(form.features) : null,
        price: form.price || null,
      };

      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
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
        alert(data.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle service deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/services/${deleteId}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage SL HUB services
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-3.5 mr-1" />
          Add Service
        </Button>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Features</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Status</TableHead>
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
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No services found. Add your first service!
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {service.slug}
                      </TableCell>
                      <TableCell className="text-sm">
                        {service.icon || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {service.price || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {parseFeatures(service.features).length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {service.order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={service.isActive ? "default" : "outline"}
                          className="text-xs"
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(service)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(service.id)}>
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

      {/* Create/Edit Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Service" : "Add New Service"}
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
                  placeholder="Service name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="service-slug"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Service description"
                rows={3}
              />
            </div>

            {/* Icon and Image URLs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Icon Name</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="Lucide icon name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="size-3.5" />
                  Service Image (Drag & Drop)
                </Label>
                <SingleImageUploader
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  folder="services"
                />
              </div>
            </div>

            {/* Features Tag Input */}
            <div className="space-y-1.5">
              <Label>Features (press Enter to add)</Label>
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={addFeature}
                placeholder="Type a feature and press Enter"
              />
              {/* Display current feature tags */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1">
                    {feature}
                    <button
                      onClick={() => removeFeature(idx)}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price and Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price Range</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder='e.g. From Rs. 2,500'
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
              {editingId ? "Update" : "Create"} Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service?
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
