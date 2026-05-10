// =============================================================================
// SL HUB COMPUTER - Admin Price History Page
// =============================================================================
// Purpose: Admin page showing price change history across all products
// Features: Date range filter, product search, category filter, price change
//           indicators (green for drops, red for increases), CSV export
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Search,
  Calendar,
  Loader2,
  RefreshCw,
  Package,
} from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Price History Entry Type
// ---------------------------------------------------------------------------
interface PriceHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productSku: string | null;
  category: string | null;
  categoryId: string | null;
  price: number;
  originalPrice: number | null;
  previousPrice: number | null;
  changePercent: number | null;
  changeType: string;
  changedBy: string | null;
  date: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Admin Price History Page
// ---------------------------------------------------------------------------
export default function AdminPriceHistoryPage() {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch categories for filter
  useEffect(() => {
    fetch("/api/categories?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategories(
            data.data.map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch price history
  const fetchHistory = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (search) params.set("productId", search);
        if (categoryId) params.set("categoryId", categoryId);
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);

        const res = await fetch(`/api/admin/price-history?${params}`);
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch price history:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, categoryId, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Product",
      "SKU",
      "Category",
      "Previous Price",
      "New Price",
      "Change %",
      "Type",
      "Changed By",
      "Date",
    ];
    const rows = history.map((h) => [
      h.productName,
      h.productSku || "",
      h.category || "",
      h.previousPrice !== null ? h.previousPrice : "",
      h.price,
      h.changePercent !== null ? `${h.changePercent.toFixed(1)}%` : "",
      h.changeType,
      h.changedBy || "",
      new Date(h.date).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `price-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Price History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and analyze price changes across all products
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={history.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Product ID</Label>
            <Input
              placeholder="Search by product ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">From Date</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5 flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHistory(1)}
              className="h-9 gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.total} price change{pagination.total !== 1 ? "s" : ""}{" "}
          found
        </p>
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchHistory(pagination.page - 1)}
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
              onClick={() => fetchHistory(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No price history found</p>
            <p className="text-sm mt-1">
              Price changes will appear here when product prices are updated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price Change</TableHead>
                  <TableHead>Change %</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => {
                  const isPriceDrop =
                    entry.changePercent !== null && entry.changePercent < 0;
                  const isPriceIncrease =
                    entry.changePercent !== null && entry.changePercent > 0;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products`}
                              className="font-medium text-sm hover:text-primary truncate block max-w-[200px]"
                            >
                              {entry.productName}
                            </Link>
                            {entry.productSku && (
                              <p className="text-[10px] text-muted-foreground">
                                SKU: {entry.productSku}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.category && (
                          <Badge variant="outline" className="text-[10px]">
                            {entry.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          {entry.previousPrice !== null ? (
                            <>
                              <span className="text-muted-foreground line-through">
                                Rs. {entry.previousPrice.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span
                                className={
                                  isPriceDrop
                                    ? "text-emerald-600 font-semibold"
                                    : isPriceIncrease
                                    ? "text-red-600 font-semibold"
                                    : "font-semibold"
                                }
                              >
                                Rs. {entry.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold">
                              Rs. {entry.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {entry.originalPrice !== null && (
                          <p className="text-[10px] text-muted-foreground">
                            MRP: Rs. {entry.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.changePercent !== null ? (
                          <Badge
                            className={`gap-0.5 text-[10px] ${
                              isPriceDrop
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : isPriceIncrease
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {isPriceDrop ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : isPriceIncrease ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {Math.abs(entry.changePercent).toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Initial
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {entry.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {entry.changedBy || "System"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
