// =============================================================================
// SL HUB COMPUTER - Admin Gift Cards Management Page
// =============================================================================
// Purpose: Gift card list, create, view details, toggle status, bulk generate
// Features: Search/filter, create dialog, detail drawer, export, bulk actions
// =============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  Loader2,
  RefreshCw,
  PartyPopper,
  Heart,
  GraduationCap,
  TreePine,
  Sparkles,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GiftCardType {
  id: string;
  code: string;
  name: string;
  amount: number;
  balance: number;
  currency: string;
  purchaserName: string | null;
  purchaserEmail: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  message: string | null;
  occasion: string | null;
  isActive: boolean;
  isRedeemed: boolean;
  redeemedAt: string | null;
  redeemedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  transactions: GiftCardTransactionType[];
  _count?: { transactions: number };
}

interface GiftCardTransactionType {
  id: string;
  type: string;
  amount: number;
  orderId: string | null;
  description: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Occasion Config
// ---------------------------------------------------------------------------
const occasionConfig: Record<string, { label: string; icon: typeof Gift; color: string }> = {
  birthday: { label: "Birthday", icon: PartyPopper, color: "text-pink-600" },
  wedding: { label: "Wedding", icon: Heart, color: "text-rose-600" },
  graduation: { label: "Graduation", icon: GraduationCap, color: "text-blue-600" },
  holiday: { label: "Holiday", icon: TreePine, color: "text-green-600" },
  general: { label: "General", icon: Sparkles, color: "text-amber-600" },
  promotion: { label: "Promotion", icon: Package, color: "text-purple-600" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
}

function getStatusBadge(card: GiftCardType) {
  if (!card.isActive) return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
  if (card.isRedeemed) return <Badge className="bg-gray-500 text-xs">Redeemed</Badge>;
  if (card.expiresAt && new Date(card.expiresAt) < new Date())
    return <Badge variant="destructive" className="text-xs">Expired</Badge>;
  return <Badge className="bg-emerald-600 text-xs">Active</Badge>;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Detail sheet state
  const [selectedCard, setSelectedCard] = useState<GiftCardType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Form state for creating
  const [form, setForm] = useState({
    name: "",
    amount: "",
    purchaserName: "",
    purchaserEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    occasion: "general",
    expiresMonths: "12",
  });

  // Bulk form
  const [bulkForm, setBulkForm] = useState({
    name: "",
    amount: "",
    count: "10",
    occasion: "promotion",
    expiresMonths: "12",
  });

  // Fetch gift cards
  const fetchGiftCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter === "all" ? "" : statusFilter,
        occasion: occasionFilter === "all" ? "" : occasionFilter,
        page: page.toString(),
        limit: "20",
      });
      const res = await fetch(`/api/admin/gift-cards?${params}`);
      const data = await res.json();
      if (data.success) {
        setGiftCards(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Fetch gift cards error:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, occasionFilter, page]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  // Create single gift card
  const handleCreate = async () => {
    if (!form.name || !form.amount) {
      toast.error("Name and amount are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          expiresMonths: Number(form.expiresMonths),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gift card created successfully!");
        setCreateOpen(false);
        setForm({ name: "", amount: "", purchaserName: "", purchaserEmail: "", recipientName: "", recipientEmail: "", message: "", occasion: "general", expiresMonths: "12" });
        fetchGiftCards();
      } else {
        toast.error(data.error || "Failed to create gift card");
      }
    } catch {
      toast.error("Failed to create gift card");
    } finally {
      setCreating(false);
    }
  };

  // Bulk generate
  const handleBulkGenerate = async () => {
    if (!bulkForm.name || !bulkForm.amount || !bulkForm.count) {
      toast.error("All fields are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk",
          ...bulkForm,
          amount: Number(bulkForm.amount),
          count: Number(bulkForm.count),
          expiresMonths: Number(bulkForm.expiresMonths),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${bulkForm.count} gift cards generated successfully!`);
        setBulkOpen(false);
        setBulkForm({ name: "", amount: "", count: "10", occasion: "promotion", expiresMonths: "12" });
        fetchGiftCards();
      } else {
        toast.error(data.error || "Failed to generate gift cards");
      }
    } catch {
      toast.error("Failed to generate gift cards");
    } finally {
      setCreating(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gift-cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleActive" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated");
        fetchGiftCards();
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Delete gift card
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gift card?")) return;
    try {
      const res = await fetch(`/api/admin/gift-cards/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Gift card deleted");
        fetchGiftCards();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete gift card");
    }
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  // View detail
  const viewDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gift-cards/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCard(data.data);
        setDetailOpen(true);
      }
    } catch {
      toast.error("Failed to load gift card details");
    }
  };

  // Export
  const handleExport = () => {
    const csv = [
      ["Code", "Name", "Amount", "Balance", "Status", "Occasion", "Expires", "Created"].join(","),
      ...giftCards.map((c) =>
        [c.code, c.name, c.amount, c.balance, c.isActive ? "Active" : "Inactive", c.occasion || "", c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "", new Date(c.createdAt).toLocaleDateString()].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gift-cards-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Gift cards exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            Gift Cards
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage gift cards, create new ones, and track redemptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchGiftCards}>
            <RefreshCw className="size-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-3.5 mr-1.5" />
            Export
          </Button>
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="size-3.5 mr-1.5" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Generate Gift Cards</DialogTitle>
                <DialogDescription>
                  Generate multiple gift card codes at once with specified amount and occasion.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Base Name</Label>
                  <Input value={bulkForm.name} onChange={(e) => setBulkForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., New Year Promo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (LKR)</Label>
                    <Input type="number" value={bulkForm.amount} onChange={(e) => setBulkForm((p) => ({ ...p, amount: e.target.value }))} placeholder="5000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Count (max 100)</Label>
                    <Input type="number" value={bulkForm.count} onChange={(e) => setBulkForm((p) => ({ ...p, count: e.target.value }))} placeholder="10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Occasion</Label>
                    <Select value={bulkForm.occasion} onValueChange={(v) => setBulkForm((p) => ({ ...p, occasion: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expires In (months)</Label>
                    <Input type="number" value={bulkForm.expiresMonths} onChange={(e) => setBulkForm((p) => ({ ...p, expiresMonths: e.target.value }))} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleBulkGenerate} disabled={creating}>
                  {creating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Package className="size-4 mr-2" />}
                  Generate Cards
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Create Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Gift Card</DialogTitle>
                <DialogDescription>
                  Manually create a single gift card with custom details and recipient info.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Card Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Birthday Special" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Amount (LKR) *</Label>
                    <Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="5000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Occasion</Label>
                    <Select value={form.occasion} onValueChange={(v) => setForm((p) => ({ ...p, occasion: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Purchaser Name</Label>
                    <Input value={form.purchaserName} onChange={(e) => setForm((p) => ({ ...p, purchaserName: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Purchaser Email</Label>
                    <Input type="email" value={form.purchaserEmail} onChange={(e) => setForm((p) => ({ ...p, purchaserEmail: e.target.value }))} placeholder="john@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Recipient Name</Label>
                    <Input value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Recipient Email</Label>
                    <Input type="email" value={form.recipientEmail} onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))} placeholder="jane@email.com" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>Personal Message</Label>
                    <Textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Happy Birthday! Enjoy your gift!" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expires In (months)</Label>
                    <Select value={form.expiresMonths} onValueChange={(v) => setForm((p) => ({ ...p, expiresMonths: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">1 Year</SelectItem>
                        <SelectItem value="24">2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Gift className="size-4 mr-2" />}
                  Create Gift Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cards</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{giftCards.filter((c) => c.isActive && !c.isRedeemed).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold">{formatLKR(giftCards.reduce((s, c) => s + c.amount, 0))}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Redeemed</p>
              <p className="text-xl font-bold">{giftCards.filter((c) => c.isRedeemed).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by code, name..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="redeemed">Redeemed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={occasionFilter} onValueChange={(v) => { setOccasionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Occasion" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Occasions</SelectItem>
            <SelectItem value="birthday">Birthday</SelectItem>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="graduation">Graduation</SelectItem>
            <SelectItem value="holiday">Holiday</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="promotion">Promotion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gift Cards Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="size-8 animate-spin mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading gift cards...</p>
            </div>
          ) : giftCards.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="size-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No gift cards found</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first gift card to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Balance</th>
                    <th className="text-left p-3 font-medium">Occasion</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Expires</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {giftCards.map((card) => {
                    const occ = occasionConfig[card.occasion || "general"];
                    const OccIcon = occ?.icon || Sparkles;
                    return (
                      <tr key={card.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                              {card.code}
                            </code>
                            <button onClick={() => copyCode(card.code)} className="text-muted-foreground hover:text-foreground">
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-medium truncate max-w-[150px]">{card.name}</td>
                        <td className="p-3">{formatLKR(card.amount)}</td>
                        <td className="p-3">
                          <span className={card.balance < card.amount ? "text-amber-600 font-medium" : ""}>
                            {formatLKR(card.balance)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <OccIcon className={`size-3.5 ${occ?.color || "text-gray-500"}`} />
                            <span className="text-xs">{occ?.label || "General"}</span>
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(card)}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => viewDetail(card.id)} title="View Details">
                              <Eye className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleToggleActive(card.id)} title={card.isActive ? "Deactivate" : "Activate"}>
                              {card.isActive ? (
                                <ToggleRight className="size-4 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="size-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(card.id)} className="text-destructive hover:text-destructive" title="Delete">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Gift Card Details
            </SheetTitle>
            <SheetDescription>
              View balance, transaction history, and detailed information for this gift card.
            </SheetDescription>
          </SheetHeader>
          {selectedCard && (
            <div className="mt-6 space-y-6">
              {/* Code Display */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border">
                <p className="text-xs text-muted-foreground mb-1">Gift Card Code</p>
                <code className="text-2xl font-bold font-mono tracking-wider">{selectedCard.code}</code>
                <div className="mt-2">{getStatusBadge(selectedCard)}</div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedCard.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Occasion</p>
                  <p className="font-medium capitalize">{selectedCard.occasion || "General"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Original Amount</p>
                  <p className="font-medium">{formatLKR(selectedCard.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining Balance</p>
                  <p className="font-bold text-lg text-primary">{formatLKR(selectedCard.balance)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchaser</p>
                  <p className="font-medium">{selectedCard.purchaserName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="font-medium">{selectedCard.recipientName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="font-medium">{selectedCard.expiresAt ? new Date(selectedCard.expiresAt).toLocaleDateString() : "Never"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedCard.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedCard.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <div className="bg-muted/30 rounded-lg p-3 text-sm italic">
                    &ldquo;{selectedCard.message}&rdquo;
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  Transaction History
                </h3>
                {selectedCard.transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCard.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          tx.type === "purchase" ? "bg-emerald-500" :
                          tx.type === "redemption" ? "bg-amber-500" :
                          tx.type === "adjustment" ? "bg-blue-500" :
                          "bg-gray-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium capitalize">{tx.type}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{tx.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-bold ${
                            tx.type === "redemption" ? "text-red-600" : "text-emerald-600"
                          }`}>
                            {tx.type === "redemption" ? "-" : "+"}{formatLKR(tx.amount)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{timeAgo(tx.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
