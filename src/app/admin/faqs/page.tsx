// =============================================================================
// SL HUB COMPUTER - Admin FAQs Page
// =============================================================================
// Purpose: Full CRUD management page for FAQs with category filtering,
//          table view, create/edit dialog, and delete confirmation.
// Features:
//   - FAQ table with question (truncated), category (color-coded badge),
//     order, active status, actions (edit/delete)
//   - Category filter tabs: All, General, Products & Orders, Repair & Services, CCTV & Security
//   - Create/Edit dialog with question, answer, category select, order, active toggle
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------
const CATEGORIES = ["General", "Products & Orders", "Repair & Services", "CCTV & Security"];

// ---------------------------------------------------------------------------
// Category configuration with colors
// ---------------------------------------------------------------------------
const categoryColors: Record<string, string> = {
  "General": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Products & Orders": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Repair & Services": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "CCTV & Security": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function getCategoryColor(category: string) {
  return categoryColors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------
const defaultForm = {
  question: "",
  answer: "",
  category: "General",
  order: 0,
  isActive: true,
};

// ---------------------------------------------------------------------------
// FAQs Page Component
// ---------------------------------------------------------------------------
export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Refresh key
  const [refreshKey, setRefreshKey] = useState(0);

  // -------------------------------------------------------------------------
  // Fetch FAQs from API
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const url = activeCategory !== "all" ? `/api/admin/faqs?category=${encodeURIComponent(activeCategory)}` : "/api/admin/faqs";
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setFaqs(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey, activeCategory]);

  // -------------------------------------------------------------------------
  // Open dialog for creating a new FAQ
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Open dialog for editing an existing FAQ
  // -------------------------------------------------------------------------
  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
    });
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Handle form submission (create or update)
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        alert(data.error || "Failed to save FAQ");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle FAQ deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deleteId}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-sm text-muted-foreground">
            Manage frequently asked questions
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-3.5 mr-1" />
          Add FAQ
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...CATEGORIES].map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
      </div>

      {/* FAQs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No FAQs found. Add your first FAQ!
                    </TableCell>
                  </TableRow>
                ) : (
                  faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {faq.question}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(faq.category)}`}>
                          {faq.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {faq.order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={faq.isActive ? "default" : "outline"}
                          className="text-xs"
                        >
                          {faq.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(faq)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(faq.id)}>
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

      {/* Create/Edit FAQ Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Question */}
            <div className="space-y-1.5">
              <Label>Question</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Enter the question"
              />
            </div>

            {/* Answer */}
            <div className="space-y-1.5">
              <Label>Answer</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
              />
            </div>

            {/* Category and Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
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
              {editingId ? "Update" : "Create"} FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
