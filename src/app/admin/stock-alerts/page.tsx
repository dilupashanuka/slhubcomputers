// =============================================================================
// SL HUB COMPUTER - Admin Stock Alerts Page
// =============================================================================
// Purpose: Admin page showing products with back-in-stock alert subscriptions
// Features: List products with subscribers, manual notification, export
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  Bell,
  BellRing,
  Download,
  Loader2,
  RefreshCw,
  Package,
  Users,
  Mail,
  Send,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Stock Alert Product Type
// ---------------------------------------------------------------------------
interface StockAlertProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string | null;
  subscribersCount: number;
  lastNotificationSent: string | null;
  recentSubscribers: {
    id: string;
    email: string;
    notifiedAt: string | null;
    createdAt: string;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Admin Stock Alerts Page
// ---------------------------------------------------------------------------
export default function AdminStockAlertsPage() {
  const [products, setProducts] = useState<StockAlertProduct[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sendingNotif, setSendingNotif] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<StockAlertProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch products with stock alerts
  const fetchAlerts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/stock-alerts?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch stock alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAlerts(1);
  }, [fetchAlerts]);

  // Send manual notification
  const handleNotify = async (productId: string) => {
    setSendingNotif(productId);
    try {
      const res = await fetch("/api/admin/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchAlerts(pagination.page);
      } else {
        toast.error(data.error || "Failed to send notifications");
      }
    } catch {
      toast.error("Failed to send notifications");
    } finally {
      setSendingNotif(null);
    }
  };

  // Export subscribers
  const handleExport = () => {
    const rows: string[][] = [];
    for (const product of products) {
      for (const sub of product.recentSubscribers) {
        rows.push([
          product.name,
          sub.email,
          sub.notifiedAt ? "Notified" : "Pending",
          new Date(sub.createdAt).toLocaleString(),
        ]);
      }
    }

    if (rows.length === 0) {
      toast.error("No subscribers to export");
      return;
    }

    const headers = ["Product", "Email", "Status", "Subscribed Date"];
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stock-alert-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            Stock Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage back-in-stock alert subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={products.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Export Subscribers
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Products with Alerts
              </p>
              <p className="text-xl font-bold">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Subscribers</p>
              <p className="text-xl font-bold">
                {products.reduce((sum, p) => sum + p.subscribersCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Notifications Sent
              </p>
              <p className="text-xl font-bold">
                {products.filter((p) => p.lastNotificationSent).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAlerts(1)}
            className="h-9 gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No stock alert subscriptions yet</p>
            <p className="text-sm mt-1">
              Subscriptions will appear here when customers sign up for
              back-in-stock alerts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Last Notified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Rs. {product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                          {product.stock} in stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]">
                          Out of stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.category && (
                        <Badge variant="outline" className="text-[10px]">
                          {product.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {product.subscribersCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(product.lastNotificationSent)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => {
                            setSelectedProduct(product);
                            setDetailOpen(true);
                          }}
                        >
                          <Mail className="w-3 h-3" /> View
                        </Button>
                        {product.stock > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700"
                            disabled={sendingNotif === product.id}
                            onClick={() => handleNotify(product.id)}
                          >
                            {sendingNotif === product.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Notify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchAlerts(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchAlerts(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Subscriber Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Stock Alert Subscribers
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} - {selectedProduct?.subscribersCount}{" "}
              subscriber
              {selectedProduct?.subscribersCount !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              {/* Product info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {selectedProduct.price.toLocaleString()}
                      {selectedProduct.category &&
                        ` • ${selectedProduct.category}`}
                    </p>
                  </div>
                  <Badge
                    className={
                      selectedProduct.stock > 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} in stock`
                      : "Out of stock"}
                  </Badge>
                </div>
              </div>

              {/* Subscribers list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedProduct.recentSubscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No subscribers yet
                  </p>
                ) : (
                  selectedProduct.recentSubscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{sub.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.notifiedAt ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-600 border-emerald-300"
                          >
                            Notified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-600 border-amber-300"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              {selectedProduct.stock > 0 && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                  disabled={sendingNotif === selectedProduct.id}
                  onClick={() => {
                    handleNotify(selectedProduct.id);
                  }}
                >
                  {sendingNotif === selectedProduct.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Notification to All Pending Subscribers
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
