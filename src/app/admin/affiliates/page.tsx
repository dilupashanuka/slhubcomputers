// =============================================================================
// SL HUB COMPUTER - Admin Affiliates Management Page
// =============================================================================
// Purpose: Full admin page for managing affiliates, referrals, and payments
// Features:
//   - Affiliate list with stats (clicks, conversions, earnings)
//   - Approve/reject affiliates (toggle active)
//   - Edit commission rates
//   - View referral details
//   - Process payments (mark as paid)
//   - Export earnings report
//   - AI Settings section
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Eye,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  CheckCircle,
  XCircle,
  Edit3,
  CreditCard,
  Download,
  Plus,
  X,
  Save,
  ArrowRight,
  Sparkles,
  Settings2,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AffiliateData {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  bankDetails: string | null;
  commissionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  clicks: number;
  conversions: number;
  isActive: boolean;
  createdAt: string;
  _count?: { referrals: number; payments: number };
}

interface ReferralData {
  id: string;
  orderId: string | null;
  orderNumber: string | null;
  customerName: string | null;
  amount: number;
  commission: number;
  status: string;
  createdAt: string;
}

interface PaymentData {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface AISettingsData {
  enabled: boolean;
  model: string;
  temperature: number;
  welcomeMessage: string;
  fallbackMessage: string;
  maxMessagesPerDay: number;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------
function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateData | null>(null);
  const [affiliateReferrals, setAffiliateReferrals] = useState<ReferralData[]>([]);
  const [affiliatePayments, setAffiliatePayments] = useState<PaymentData[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit affiliate dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ commissionRate: 5, isActive: true });

  // Pay affiliate dialog
  const [payDialog, setPayDialog] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, method: "bank_transfer", reference: "" });

  // Create affiliate dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", commissionRate: 5 });

  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettingsData>({
    enabled: true,
    model: "glm-4-flash",
    temperature: 0.7,
    welcomeMessage: "Hi! I'm SL HUB's AI assistant. How can I help you today? 😊",
    fallbackMessage: "I'm not sure about that. Let me connect you with our support team for more help.",
    maxMessagesPerDay: 20,
  });
  const [aiSettingsLoading, setAiSettingsLoading] = useState(false);

  // Fetch affiliates
  const fetchAffiliates = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/admin/affiliates?${params}`);
      const data = await res.json();
      if (data.success) {
        setAffiliates(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch affiliates:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Fetch AI settings
  const fetchAISettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-settings");
      const data = await res.json();
      if (data.success) {
        setAiSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch AI settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchAffiliates();
    fetchAISettings();
  }, [fetchAffiliates, fetchAISettings]);

  // Fetch affiliate details
  const fetchAffiliateDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/admin/affiliates/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedAffiliate(data.data);
        setAffiliateReferrals(data.data.referrals || []);
        setAffiliatePayments(data.data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Update affiliate
  const handleUpdateAffiliate = async () => {
    if (!selectedAffiliate) return;
    try {
      const res = await fetch(`/api/admin/affiliates/${selectedAffiliate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditDialog(false);
        fetchAffiliates();
        fetchAffiliateDetails(selectedAffiliate.id);
      }
    } catch (error) {
      console.error("Failed to update affiliate:", error);
    }
  };

  // Process payment
  const handleProcessPayment = async () => {
    if (!selectedAffiliate) return;
    try {
      const res = await fetch(`/api/admin/affiliates/${selectedAffiliate.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payForm),
      });
      const data = await res.json();
      if (data.success) {
        setPayDialog(false);
        setPayForm({ amount: 0, method: "bank_transfer", reference: "" });
        fetchAffiliates();
        fetchAffiliateDetails(selectedAffiliate.id);
      }
    } catch (error) {
      console.error("Failed to process payment:", error);
    }
  };

  // Create affiliate
  const handleCreateAffiliate = async () => {
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setCreateDialog(false);
        setCreateForm({ name: "", email: "", phone: "", commissionRate: 5 });
        fetchAffiliates();
      }
    } catch (error) {
      console.error("Failed to create affiliate:", error);
    }
  };

  // Update AI settings
  const handleUpdateAISettings = async () => {
    try {
      setAiSettingsLoading(true);
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });
      const data = await res.json();
      if (data.success) {
        setAiSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to update AI settings:", error);
    } finally {
      setAiSettingsLoading(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = ["Code", "Name", "Email", "Commission Rate", "Clicks", "Conversions", "Total Earnings", "Pending", "Paid", "Status"];
    const rows = affiliates.map((a) => [
      a.code, a.name, a.email, `${a.commissionRate}%`,
      a.clicks, a.conversions,
      a.totalEarnings, a.pendingEarnings, a.paidEarnings,
      a.isActive ? "Active" : "Inactive",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliates-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculations
  const totalEarnings = affiliates.reduce((sum, a) => sum + a.totalEarnings, 0);
  const totalPending = affiliates.reduce((sum, a) => sum + a.pendingEarnings, 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + a.paidEarnings, 0);
  const totalClicks = affiliates.reduce((sum, a) => sum + a.clicks, 0);
  const totalConversions = affiliates.reduce((sum, a) => sum + a.conversions, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6" />
            Affiliates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage referral partners, track commissions, and process payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="size-3.5" />
            Export
          </Button>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Add Affiliate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Affiliate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Affiliate name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="affiliate@email.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="07X XXXX XXX"
                  />
                </div>
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={createForm.commissionRate}
                    onChange={(e) => setCreateForm({ ...createForm, commissionRate: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={handleCreateAffiliate} className="w-full gap-1.5">
                  <Save className="size-4" />
                  Create Affiliate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="size-3.5" /> Total Affiliates
            </div>
            <p className="text-xl font-bold">{affiliates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <MousePointerClick className="size-3.5" /> Total Clicks
            </div>
            <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="size-3.5" /> Conversions
            </div>
            <p className="text-xl font-bold">{totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="size-3.5" /> Pending
            </div>
            <p className="text-xl font-bold text-amber-600">{formatLKR(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="size-3.5" /> Total Paid
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatLKR(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Affiliates / AI Settings */}
      <Tabs defaultValue="affiliates">
        <TabsList>
          <TabsTrigger value="affiliates" className="gap-1.5">
            <Users className="size-3.5" />
            Affiliates
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="gap-1.5">
            <Sparkles className="size-3.5" />
            AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="mt-4 space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => fetchAffiliates()}>
              <RefreshCw className="size-4" />
            </Button>
          </div>

          {/* Affiliates Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : affiliates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="size-10 mx-auto mb-3 opacity-30" />
                  <p>No affiliates found</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Affiliate</th>
                        <th className="text-left p-3 font-medium">Code</th>
                        <th className="text-right p-3 font-medium">Rate</th>
                        <th className="text-right p-3 font-medium">Clicks</th>
                        <th className="text-right p-3 font-medium">Conversions</th>
                        <th className="text-right p-3 font-medium">Pending</th>
                        <th className="text-right p-3 font-medium">Paid</th>
                        <th className="text-center p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{affiliate.name}</p>
                              <p className="text-xs text-muted-foreground">{affiliate.email}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {affiliate.code}
                            </code>
                          </td>
                          <td className="p-3 text-right">{affiliate.commissionRate}%</td>
                          <td className="p-3 text-right">{affiliate.clicks}</td>
                          <td className="p-3 text-right">{affiliate.conversions}</td>
                          <td className="p-3 text-right text-amber-600">{formatLKR(affiliate.pendingEarnings)}</td>
                          <td className="p-3 text-right text-emerald-600">{formatLKR(affiliate.paidEarnings)}</td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={affiliate.isActive ? "default" : "secondary"}
                              className={affiliate.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                            >
                              {affiliate.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchAffiliateDetails(affiliate.id);
                                  setEditForm({
                                    commissionRate: affiliate.commissionRate,
                                    isActive: affiliate.isActive,
                                  });
                                }}
                                title="View details"
                              >
                                <Eye className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedAffiliate(affiliate);
                                  setEditForm({
                                    commissionRate: affiliate.commissionRate,
                                    isActive: affiliate.isActive,
                                  });
                                  setEditDialog(true);
                                }}
                                title="Edit"
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedAffiliate(affiliate);
                                  setPayForm({
                                    amount: affiliate.pendingEarnings,
                                    method: "bank_transfer",
                                    reference: "",
                                  });
                                  setPayDialog(true);
                                }}
                                title="Process payment"
                                disabled={affiliate.pendingEarnings <= 0}
                              >
                                <CreditCard className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Affiliate Detail Dialog */}
          {selectedAffiliate && (
            <Dialog open={!!selectedAffiliate && !editDialog && !payDialog} onOpenChange={() => setSelectedAffiliate(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    {selectedAffiliate.name}
                    <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {selectedAffiliate.code}
                    </code>
                  </DialogTitle>
                </DialogHeader>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6">
                      {/* Affiliate Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Total Earnings</p>
                          <p className="text-lg font-bold">{formatLKR(selectedAffiliate.totalEarnings)}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-lg font-bold text-amber-600">{formatLKR(selectedAffiliate.pendingEarnings)}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Paid</p>
                          <p className="text-lg font-bold text-emerald-600">{formatLKR(selectedAffiliate.paidEarnings)}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Recent Referrals */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Recent Referrals</h4>
                        {affiliateReferrals.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No referrals yet</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {affiliateReferrals.slice(0, 10).map((ref) => (
                              <div key={ref.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                                <div>
                                  <p className="font-medium">
                                    {ref.orderNumber || "Order"}
                                    {ref.customerName && ` - ${ref.customerName}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{formatDate(ref.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatLKR(ref.commission)}</p>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      ref.status === "pending" ? "border-amber-300 text-amber-600" :
                                      ref.status === "approved" ? "border-blue-300 text-blue-600" :
                                      ref.status === "paid" ? "border-emerald-300 text-emerald-600" :
                                      "border-red-300 text-red-600"
                                    }`}
                                  >
                                    {ref.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Recent Payments */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Recent Payments</h4>
                        {affiliatePayments.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {affiliatePayments.map((pay) => (
                              <div key={pay.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                                <div>
                                  <p className="font-medium">{formatLKR(pay.amount)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {pay.method} {pay.reference && `• Ref: ${pay.reference}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">{formatDate(pay.createdAt)}</p>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      pay.status === "completed" ? "border-emerald-300 text-emerald-600" :
                                      pay.status === "pending" ? "border-amber-300 text-amber-600" :
                                      "border-red-300 text-red-600"
                                    }`}
                                  >
                                    {pay.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Affiliate Dialog */}
          <Dialog open={editDialog} onOpenChange={setEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Affiliate - {selectedAffiliate?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm({ ...editForm, commissionRate: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editForm.isActive}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                  />
                  <Label>{editForm.isActive ? "Active" : "Inactive"}</Label>
                </div>
                <Button onClick={handleUpdateAffiliate} className="w-full gap-1.5">
                  <Save className="size-4" />
                  Update Affiliate
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Process Payment Dialog */}
          <Dialog open={payDialog} onOpenChange={setPayDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payment - {selectedAffiliate?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pending Earnings</p>
                  <p className="text-xl font-bold text-amber-600">
                    {formatLKR(selectedAffiliate?.pendingEarnings || 0)}
                  </p>
                </div>
                <div>
                  <Label>Payment Amount (LKR)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reference / Note</Label>
                  <Input
                    value={payForm.reference}
                    onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                    placeholder="Transaction reference"
                  />
                </div>
                <Button onClick={handleProcessPayment} className="w-full gap-1.5">
                  <CreditCard className="size-4" />
                  Process Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ai-settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                AI Chat Assistant Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable AI */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">AI Chat Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the AI-powered chat bot for customers
                  </p>
                </div>
                <Switch
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, enabled: checked })}
                />
              </div>

              <Separator />

              {/* Model Selection */}
              <div>
                <Label>AI Model</Label>
                <Select
                  value={aiSettings.model}
                  onValueChange={(v) => setAiSettings({ ...aiSettings, model: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glm-4-flash">GLM-4 Flash (Fast)</SelectItem>
                    <SelectItem value="glm-4-plus">GLM-4 Plus (Balanced)</SelectItem>
                    <SelectItem value="glm-4">GLM-4 (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div>
                <Label>Temperature: {aiSettings.temperature}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Higher = more creative, Lower = more focused
                </p>
                <Input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={aiSettings.temperature}
                  onChange={(e) => setAiSettings({ ...aiSettings, temperature: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Max messages per day */}
              <div>
                <Label>Max AI Messages Per Session Per Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={aiSettings.maxMessagesPerDay}
                  onChange={(e) => setAiSettings({ ...aiSettings, maxMessagesPerDay: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <Label>Welcome Message</Label>
                <Textarea
                  value={aiSettings.welcomeMessage}
                  onChange={(e) => setAiSettings({ ...aiSettings, welcomeMessage: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              {/* Fallback Message */}
              <div>
                <Label>Fallback Message (when AI can&apos;t answer)</Label>
                <Textarea
                  value={aiSettings.fallbackMessage}
                  onChange={(e) => setAiSettings({ ...aiSettings, fallbackMessage: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleUpdateAISettings}
                className="w-full gap-1.5"
                disabled={aiSettingsLoading}
              >
                {aiSettingsLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
