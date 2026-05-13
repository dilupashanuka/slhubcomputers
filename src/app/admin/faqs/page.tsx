// =============================================================================
// SL HUB COMPUTER - Admin FAQs Management Page
// =============================================================================
// Purpose: Management dashboard for FAQs.
// Features: 
//   - List all FAQs from database
//   - Add new FAQs with category assignment
//   - Edit existing questions and answers
//   - Delete FAQs with confirmation
//   - Toggle active status
// =============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  HelpCircle, 
  Save, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const FAQ_CATEGORIES = [
  "General",
  "Products & Orders",
  "Repair & Services",
  "CCTV & Security",
  "Warranty & Returns",
  "Affiliate & Partner"
];

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true
  });

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      order: faqs.length,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) return;

    try {
      setActionLoading(true);
      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : "/api/admin/faqs";
      const method = editingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsDialogOpen(false);
        fetchFaqs();
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchFaqs();
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions displayed on the site.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New FAQ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{faqs.filter(f => f.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{new Set(faqs.map(f => f.category)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & List */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by question, answer or category..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Loading FAQs...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {/* Group by Category */}
              {Array.from(new Set(filteredFaqs.map(f => f.category))).map(cat => (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-6 first:mt-0 flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50/50 border-blue-200 text-blue-600">
                      {cat}
                    </Badge>
                  </h3>
                  <div className="grid gap-4">
                    {filteredFaqs.filter(f => f.category === cat).sort((a, b) => a.order - b.order).map(faq => (
                      <div 
                        key={faq.id} 
                        className="group relative flex flex-col p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-500/50 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-blue-500" />
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{faq.question}</h4>
                              {!faq.isActive && (
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(faq)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDelete(faq.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
              <HelpCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No FAQs found</p>
              <p className="text-sm">Try adjusting your search or add a new FAQ.</p>
              <Button onClick={handleOpenAdd} variant="outline" className="mt-4">
                Add New FAQ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            <DialogDescription>
              {editingFaq ? "Update the question, answer and category details." : "Create a new frequently asked question for your users."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question" 
                placeholder="e.g., What is your return policy?" 
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer" 
                placeholder="Provide a detailed answer here..." 
                className="min-h-[150px]"
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input 
                  id="order" 
                  type="number" 
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">This FAQ will be visible to customers when active.</p>
              </div>
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={(val) => setFormData({...formData, isActive: val})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={actionLoading || !formData.question || !formData.answer}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingFaq ? "Save Changes" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
