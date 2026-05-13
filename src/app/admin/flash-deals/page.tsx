// =============================================================================
// SL HUB COMPUTER - Admin Flash Deals Page
// =============================================================================
// Purpose: Manage products in the Flash Deals section and set expiry dates.
// Features: 
//   - List active deals
//   - Search and add products to deals
//   - Set end date/time for deals
//   - Remove products from deals
// =============================================================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Trash2, 
  Timer, 
  Loader2, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string;
  isDeal: boolean;
  dealEndDate: string | null;
}

export default function FlashDealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch active deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/admin/products?isDeal=true&limit=50");
        const data = await res.json();
        if (data.success) setDeals(data.data || []);
      } catch (error) {
        console.error("Fetch deals error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [refreshKey]);

  // Search products to add
  const handleSearch = async (term: string) => {
    setSearch(term);
    if (term.length < 2) {
      setAllProducts([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/products?limit=10&search=${term}`);
      const data = await res.json();
      if (data.success) {
        // Filter out already in deals
        const filtered = (data.data || []).filter((p: Product) => !p.isDeal);
        setAllProducts(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToDeals = async (productId: string) => {
    try {
      // Set default end date to midnight tonight
      const tonight = new Date();
      tonight.setHours(23, 59, 59, 999);

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeal: true, dealEndDate: tonight.toISOString() }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Product added to Flash Deals");
        setRefreshKey(k => k + 1);
        setSearch("");
        setAllProducts([]);
        setDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to add product to deals");
    }
  };

  const handleUpdateDate = async (productId: string, date: Date | undefined) => {
    if (!date) return;
    
    // Set time to end of day for the selected date
    const finalDate = new Date(date);
    finalDate.setHours(23, 59, 59, 999);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealEndDate: finalDate.toISOString() }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Deal end date updated");
        setRefreshKey(k => k + 1);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update date");
    }
  };

  const handleRemoveDeal = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeal: false, dealEndDate: null }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Removed from Flash Deals");
        setRefreshKey(k => k + 1);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to remove deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="w-6 h-6 text-red-600" /> Flash Deals Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage products and expiry dates for the homepage deals section.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Deal Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Flash Deals</CardTitle>
          <CardDescription>
            These products will appear with a countdown timer on the main site.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Original Price</TableHead>
                <TableHead>Ends At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No active flash deals found.
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-red-600 font-bold">
                      Rs. {product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground line-through">
                      {product.originalPrice ? `Rs. ${product.originalPrice.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal h-8 text-xs",
                              !product.dealEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {product.dealEndDate ? (
                              format(new Date(product.dealEndDate), "PPP HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={product.dealEndDate ? new Date(product.dealEndDate) : undefined}
                            onSelect={(date) => handleUpdateDate(product.id, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveDeal(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Product to Flash Deals</DialogTitle>
            <DialogDescription>
              Search for a product and add it to the flash deals list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                className="pl-8"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {searching ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Searching...</div>
              ) : allProducts.length > 0 ? (
                allProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Rs. {p.price.toLocaleString()}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddToDeals(p.id)}>
                      Add to Deals
                    </Button>
                  </div>
                ))
              ) : search.length >= 2 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">No products found or already in deals.</div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">Type at least 2 characters to search.</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
