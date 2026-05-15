// =============================================================================
// SL HUB COMPUTER - Admin Pre-Built PCs Page ⭐ KEY NEW FEATURE
// =============================================================================
// Purpose: Full CRUD management page for Pre-Built PC packages with table,
//          comprehensive create/edit dialog with specs builder, feature tags,
//          category badges, preview card, and delete confirmation.
// Features:
//   - Pre-Built PCs table with name, category badge, price, availability, featured
//   - Create/Edit dialog with:
//     • Name, slug (auto-generated), description
//     • Category select (budget/gaming/office/workstation) with color badges
//     • Price, original price (LKR)
//     • Image URL
//     • Specs builder (CPU, GPU, RAM, Storage, PSU, Case, Cooler, Motherboard)
//     • Features tag input (type + Enter to add)
//     • Available toggle, Featured toggle, Display order
//   - Category badges with distinct colors
//   - Preview card showing how it looks on the site
//   - Full CRUD via /api/admin/prebuilt-pcs endpoints
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  X,
  Monitor,
  Gamepad2,
  Briefcase,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MultipleImageUploader } from "@/components/admin/multiple-image-uploader";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "budget" | "gaming" | "office" | "workstation";
  price: number;
  originalPrice: number | null;
  image: string;
  additionalImages: string | null;
  specs: string; // JSON: { cpu, gpu, ram, storage, psu, case, cooler, motherboard }
  features: string | null; // JSON array of feature strings
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Category configuration with colors, icons, and labels
// ---------------------------------------------------------------------------
const categoryConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  budget: {
    label: "Budget",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: Monitor,
  },
  gaming: {
    label: "Gaming",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: Gamepad2,
  },
  office: {
    label: "Office",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Briefcase,
  },
  workstation: {
    label: "Workstation",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Cpu,
  },
};

// ---------------------------------------------------------------------------
// Spec field definitions for the specs builder
// ---------------------------------------------------------------------------
const specFields = [
  { key: "cpu", label: "CPU", placeholder: "e.g. Intel Core i5-14400F" },
  { key: "gpu", label: "GPU", placeholder: "e.g. NVIDIA RTX 4060 8GB" },
  { key: "ram", label: "RAM", placeholder: "e.g. 16GB DDR5 5600MHz" },
  { key: "storage", label: "Storage", placeholder: "e.g. 512GB NVMe SSD" },
  { key: "psu", label: "PSU", placeholder: "e.g. 650W 80+ Bronze" },
  { key: "case", label: "Case", placeholder: "e.g. Cooler Master Q300L" },
  { key: "cooler", label: "Cooler", placeholder: "e.g. Deepcool AK400" },
  { key: "motherboard", label: "Motherboard", placeholder: "e.g. B760M DDR5" },
];

// ---------------------------------------------------------------------------
// Default form state for new pre-built PC
// ---------------------------------------------------------------------------
const defaultForm = {
  name: "",
  slug: "",
  description: "",
  category: "budget" as "budget" | "gaming" | "office" | "workstation",
  price: 0,
  originalPrice: 0,
  images: [] as string[],
  specs: {} as Record<string, string>,
  features: [] as string[],
  isAvailable: true,
  isFeatured: false,
  order: 0,
};

// ---------------------------------------------------------------------------
// Helper: Generate URL slug from name
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

// ---------------------------------------------------------------------------
// Helper: Parse specs JSON to object
// ---------------------------------------------------------------------------
function parseSpecs(specsJson: string): Record<string, string> {
  try {
    return JSON.parse(specsJson);
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Helper: Parse features JSON to array
// ---------------------------------------------------------------------------
function parseFeatures(featuresJson: string | null): string[] {
  if (!featuresJson) return [];
  try {
    return JSON.parse(featuresJson);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Category Badge Component
// ---------------------------------------------------------------------------
function CategoryBadge({ category }: { category: string }) {
  const config = categoryConfig[category];
  if (!config) return <Badge variant="outline">{category}</Badge>;
  const Icon = config.icon;
  return (
    <Badge className={`${config.bgColor} ${config.color} border-0 text-xs gap-1`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Preview card component - Shows how the PC looks on the storefront
// Defined OUTSIDE the main component to avoid recreating on each render
// ---------------------------------------------------------------------------
function PreviewCard({ pc }: { pc: PrebuiltPC | null }) {
  if (!pc) return null;
  const specs = parseSpecs(pc.specs);
  const features = parseFeatures(pc.features);
  const config = categoryConfig[pc.category];
  const discount =
    pc.originalPrice && pc.originalPrice > pc.price
      ? Math.round(((pc.originalPrice - pc.price) / pc.originalPrice) * 100)
      : 0;

  return (
    <Card className="overflow-hidden">
      {/* Image Section */}
      {pc.image && (
        <div className="relative">
          <img
            src={pc.image}
            alt={pc.name}
            className="w-full h-40 object-cover"
          />
          {/* Category badge overlay */}
          {config && (
            <div className="absolute top-2 left-2">
              <CategoryBadge category={pc.category} />
            </div>
          )}
          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{pc.name}</CardTitle>
          {pc.isFeatured && (
            <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px]">
              ⭐ Featured
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {pc.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Price Display */}
        <div>
          <span className="text-lg font-bold text-primary">
            {formatLKR(pc.price)}
          </span>
          {pc.originalPrice && pc.originalPrice > pc.price && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              {formatLKR(pc.originalPrice)}
            </span>
          )}
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {Object.entries(specs).map(([key, value]) => {
            if (!value) return null;
            const specDef = specFields.find((s) => s.key === key);
            return (
              <div key={key} className="flex flex-col">
                <span className="text-muted-foreground uppercase text-[10px]">
                  {specDef?.label || key}
                </span>
                <span className="font-medium truncate">{value}</span>
              </div>
            );
          })}
        </div>

        {/* Features Tags */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {f}
              </Badge>
            ))}
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center justify-between text-xs">
          <Badge
            variant={pc.isAvailable ? "default" : "outline"}
            className="text-[10px]"
          >
            {pc.isAvailable ? "Available" : "Unavailable"}
          </Badge>
          <span className="text-muted-foreground">Order: {pc.order}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pre-Built PCs Page Component
// ---------------------------------------------------------------------------
export default function PrebuiltPCsPage() {
  const router = useRouter();
  const [pcs, setPCs] = useState<PrebuiltPC[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Feature tag input state
  const [featureInput, setFeatureInput] = useState("");

  // Preview dialog state
  const [previewPC, setPreviewPC] = useState<PrebuiltPC | null>(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch all pre-built PCs from API
  // Re-fetch when refreshKey changes
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchPCs = async () => {
      try {
        const res = await fetch("/api/admin/prebuilt-pcs");
        const data = await res.json();
        if (!cancelled && data.success) setPCs(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPCs();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Filter PCs by search term
  const filtered = pcs.filter(
    (pc) =>
      pc.name.toLowerCase().includes(search.toLowerCase()) ||
      pc.category.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------------------------------------------------------------
  // Open dialog for creating a new pre-built PC
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFeatureInput("");
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing pre-built PC
  // -------------------------------------------------------------------------
  const handleEdit = (pc: PrebuiltPC) => {
    setEditingId(pc.id);
    
    let parsedAdditionalImages: string[] = [];
    try {
      parsedAdditionalImages = JSON.parse(pc.additionalImages || "[]");
    } catch {}
    
    const allImages = pc.image ? [pc.image, ...parsedAdditionalImages] : [];

    setForm({
      name: pc.name,
      slug: pc.slug,
      description: pc.description,
      category: pc.category as "budget" | "gaming" | "office" | "workstation",
      price: pc.price,
      originalPrice: pc.originalPrice || 0,
      images: allImages,
      specs: parseSpecs(pc.specs),
      features: parseFeatures(pc.features),
      isAvailable: pc.isAvailable,
      isFeatured: pc.isFeatured,
      order: pc.order,
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
  // Update a spec field value
  // -------------------------------------------------------------------------
  const updateSpec = (key: string, value: string) => {
    setForm({
      ...form,
      specs: { ...form.specs, [key]: value },
    });
  };

  // -------------------------------------------------------------------------
  // Handle form submission (create or update)
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        price: form.price,
        originalPrice: form.originalPrice > 0 ? form.originalPrice : null,
        images: form.images,
        specs: JSON.stringify(form.specs),
        features: form.features.length > 0 ? JSON.stringify(form.features) : null,
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        order: form.order,
      };

      const url = editingId
        ? `/api/admin/prebuilt-pcs/${editingId}`
        : "/api/admin/prebuilt-pcs";
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
        router.refresh();
      } else {
        alert(data.error || "Failed to save pre-built PC");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle pre-built PC deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/prebuilt-pcs/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        setRefreshKey((k) => k + 1);
        router.refresh();
      } else {
        alert(data.error || "Failed to delete pre-built PC");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pre-Built PCs</h1>
          <p className="text-sm text-muted-foreground">
            Manage pre-built PC packages
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search pre-built PCs..."
              className="pl-8 h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-3.5 mr-1" />
            Add PC
          </Button>
        </div>
      </div>

      {/* Pre-Built PCs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No pre-built PCs found. Create your first package!
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pc) => (
                    <TableRow key={pc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Thumbnail */}
                          {pc.image ? (
                            <img
                              src={pc.image}
                              alt=""
                              className="w-10 h-7 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-7 bg-muted rounded flex items-center justify-center">
                              <Monitor className="size-3 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {pc.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {pc.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={pc.category} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium text-sm">
                            {formatLKR(pc.price)}
                          </p>
                          {pc.originalPrice && pc.originalPrice > pc.price && (
                            <p className="text-[11px] text-muted-foreground line-through">
                              {formatLKR(pc.originalPrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={pc.isAvailable ? "default" : "outline"}
                          className="text-xs"
                        >
                          {pc.isAvailable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {pc.isFeatured ? (
                          <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                            ⭐ Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {pc.order}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setPreviewPC(pc)}
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(pc)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteId(pc.id)}
                          >
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

      {/* Preview Card Dialog */}
      <Dialog open={!!previewPC} onOpenChange={(open) => !open && setPreviewPC(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Store Preview</DialogTitle>
            <DialogDescription>
              This is how the PC package will appear on the storefront.
            </DialogDescription>
          </DialogHeader>
          <PreviewCard pc={previewPC} />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Pre-Built PC Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Pre-Built PC" : "Add New Pre-Built PC"}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? "Modify the configuration, specifications, and images for this PC package." 
                : "Create a new pre-built PC package with full specifications and features."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* ------------------------------------------------------------- */}
            {/* Basic Information Section                                      */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Basic Information
              </h3>
              <div className="grid gap-3">
                {/* Name and Slug */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }
                      placeholder="e.g. Gaming Beast RTX 4060"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="gaming-beast-rtx-4060"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this pre-built PC package..."
                    rows={3}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) =>
                      setForm({
                        ...form,
                        category: val as "budget" | "gaming" | "office" | "workstation",
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="size-3.5" />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {/* Category badge preview */}
                  <div className="mt-1">
                    <CategoryBadge category={form.category} />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* ------------------------------------------------------------- */}
            {/* Pricing Section                                                */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Pricing
              </h3>
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
                    placeholder="0 (optional, for discount display)"
                  />
                </div>
              </div>
              {/* Discount preview */}
              {form.originalPrice > 0 && form.price > 0 && form.originalPrice > form.price && (
                <p className="text-xs text-green-600 mt-1.5">
                  Discount: {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% off
                  (Save {formatLKR(form.originalPrice - form.price)})
                </p>
              )}
            </div>

            <Separator />

            {/* ------------------------------------------------------------- */}
            {/* Images Section - Upload from PC with WebP conversion           */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Images
              </h3>
              <MultipleImageUploader
                images={form.images}
                onImagesChange={(urls) => setForm({ ...form, images: urls })}
                folder="prebuilt-pcs"
              />
            </div>

            <Separator />

            {/* ------------------------------------------------------------- */}
            {/* Specs Builder Section                                          */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {specFields.map((spec) => (
                  <div key={spec.key} className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide">
                      {spec.label}
                    </Label>
                    <Input
                      value={form.specs[spec.key] || ""}
                      onChange={(e) => updateSpec(spec.key, e.target.value)}
                      placeholder={spec.placeholder}
                      className="h-7 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* ------------------------------------------------------------- */}
            {/* Features Tag Input Section                                     */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Features
              </h3>
              <div className="space-y-1.5">
                <Label>Type a feature and press Enter</Label>
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={addFeature}
                  placeholder="e.g. Free Assembly, 1 Year Warranty"
                />
                {/* Feature tags display */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {form.features.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No features added yet
                    </p>
                  ) : (
                    form.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs gap-1"
                      >
                        {feature}
                        <button
                          onClick={() => removeFeature(idx)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* ------------------------------------------------------------- */}
            {/* Display Settings Section                                       */}
            {/* ------------------------------------------------------------- */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Display Settings
              </h3>
              <div className="space-y-3">
                {/* Available Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isAvailable}
                      onCheckedChange={(val) =>
                        setForm({ ...form, isAvailable: val })
                      }
                    />
                    <Label>Available for Purchase</Label>
                  </div>
                  <Badge
                    variant={form.isAvailable ? "default" : "outline"}
                    className="text-xs"
                  >
                    {form.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isFeatured}
                      onCheckedChange={(val) =>
                        setForm({ ...form, isFeatured: val })
                      }
                    />
                    <Label>Featured on Homepage</Label>
                  </div>
                  <Badge
                    variant={form.isFeatured ? "default" : "outline"}
                    className="text-xs"
                  >
                    {form.isFeatured ? "Featured" : "Not Featured"}
                  </Badge>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-32"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {editingId ? "Update" : "Create"} Pre-Built PC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pre-Built PC</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pre-built PC package? This
              action cannot be undone and will remove it from the storefront.
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
