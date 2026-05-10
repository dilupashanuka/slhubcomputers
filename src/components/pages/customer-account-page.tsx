// =============================================================================
// SL HUB COMPUTER - Customer Account Page
// =============================================================================
// Purpose: Customer account dashboard with profile, orders, wishlist, addresses
// Features: Profile editing, order history with status badges, wishlist section,
//           Saved addresses management, Loyalty points display, Logout button
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Star,
  Shield,
  LogOut,
  Edit3,
  Save,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Loader2,
  Gift,
  ShoppingBag,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import type { CustomerType, Order2Type } from "@/types";

// ---------------------------------------------------------------------------
// Order Status Badge Config
// ---------------------------------------------------------------------------
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-yellow-700 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: CheckCircle2 },
  processing: { label: "Processing", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30", icon: Package },
  shipped: { label: "Shipped", color: "text-indigo-700 dark:text-indigo-400", bgColor: "bg-indigo-100 dark:bg-indigo-900/30", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Customer Account Page Component
// ---------------------------------------------------------------------------
export function CustomerAccountPage() {
  const { customer, logoutCustomer, setCurrentView, wishlist, navigateToProduct } = useStore();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customer?.name || "");
  const [editPhone, setEditPhone] = useState(customer?.phone || "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address management state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", address: "", city: "", phone: "" });

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order2Type | null>(null);

  // Logout state
  const [loggingOut, setLoggingOut] = useState(false);

  // Load addresses from customer data
  useEffect(() => {
    if (customer?.addresses) {
      try {
        const parsed = JSON.parse(customer.addresses);
        setAddresses(Array.isArray(parsed) ? parsed : []);
      } catch {
        setAddresses([]);
      }
    }
  }, [customer?.addresses]);

  // Redirect if not logged in
  useEffect(() => {
    if (!customer) {
      setCurrentView("customer-login");
    }
  }, [customer, setCurrentView]);

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Handle profile save
  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const data = await res.json();
      if (data.success) {
        useStore.getState().setCustomer(data.data);
        setProfileMsg({ type: "success", text: "Profile updated successfully" });
        setEditing(false);
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle add address
  const handleAddAddress = async () => {
    if (!newAddress.address || !newAddress.city) return;
    const updated = [...addresses, { ...newAddress, id: Date.now().toString() }];
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updated }),
      });
      const data = await res.json();
      if (data.success) {
        useStore.getState().setCustomer(data.data);
        setNewAddress({ label: "", address: "", city: "", phone: "" });
        setShowAddAddress(false);
      }
    } catch {
      // Silent fail
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updated }),
      });
      const data = await res.json();
      if (data.success) {
        useStore.getState().setCustomer(data.data);
      }
    } catch {
      // Silent fail
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logoutCustomer();
    } catch {
      logoutCustomer();
    }
  };

  const orders = (customer as any)?.orders || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* =============================================================== */}
      {/* Account Header                                                   */}
      {/* =============================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Loyalty Points Badge */}
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-3 py-1">
            <Gift className="w-3.5 h-3.5 mr-1.5" />
            {customer.loyaltyPoints} Points
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-1.5" />
            )}
            Logout
          </Button>
        </div>
      </div>

      {/* =============================================================== */}
      {/* Quick Stats Row                                                  */}
      {/* =============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Orders</p>
              <p className="text-lg font-bold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Wishlist</p>
              <p className="text-lg font-bold">{wishlist.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Points</p>
              <p className="text-lg font-bold">{customer.loyaltyPoints}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Reviews</p>
              <p className="text-lg font-bold">{(customer as any)?.reviews?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =============================================================== */}
      {/* Tab Content                                                      */}
      {/* =============================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">
            <Package className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="text-xs sm:text-sm">
            <Heart className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-xs sm:text-sm">
            <MapPin className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Addresses
          </TabsTrigger>
        </TabsList>

        {/* ======================== */}
        {/* Profile Tab              */}
        {/* ======================== */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditName(customer.name); setEditPhone(customer.phone || ""); }}>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleProfileSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
                }`}>
                  {profileMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <p className={`text-sm ${
                    profileMsg.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                  }`}>
                    {profileMsg.text}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Full Name</Label>
                  {editing ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <p className="text-sm p-2 bg-muted/50 rounded-md">{customer.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm p-2 bg-muted/50 rounded-md flex items-center gap-2">
                    {customer.email}
                    <Badge variant="outline" className="text-[10px]">Verified</Badge>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                  {editing ? (
                    <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Enter phone number" />
                  ) : (
                    <p className="text-sm p-2 bg-muted/50 rounded-md">{customer.phone || "Not provided"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm p-2 bg-muted/50 rounded-md">{formatDate(customer.createdAt)}</p>
                </div>
              </div>

              {/* Loyalty Points Section */}
              <Separator />
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-300">
                        {customer.loyaltyPoints} Loyalty Points
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earn 1 point for every Rs. 100 spent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ≈ {formatLKR(customer.loyaltyPoints)} value
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================== */}
        {/* Orders Tab               */}
        {/* ======================== */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Order History
              </CardTitle>
              <CardDescription>View and track your orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setCurrentView("home")}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : selectedOrder ? (
                /* Order Detail View */
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="mb-4">
                    ← Back to Orders
                  </Button>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{selectedOrder.orderNumber}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      {(() => {
                        const cfg = statusConfig[selectedOrder.status] || statusConfig.pending;
                        const Icon = cfg.icon;
                        return (
                          <Badge className={`${cfg.bgColor} ${cfg.color}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold ml-4">{formatLKR(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatLKR(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{formatLKR(selectedOrder.shipping)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{formatLKR(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>{formatLKR(selectedOrder.total)}</span>
                      </div>
                    </div>
                    {/* Delivery Info */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium mb-1">Delivery Address</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedOrder.address || "N/A"}, {selectedOrder.city || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Phone: {selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {orders.map((order: Order2Type) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full text-left p-4 rounded-xl border hover:bg-muted/50 transition-colors flex items-center gap-4"
                      >
                        <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{order.orderNumber}</p>
                            <span className="text-sm font-bold">{formatLKR(order.total)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-muted-foreground">
                              {order.items?.length || 0} item(s) • {formatDate(order.createdAt)}
                            </p>
                            <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================== */}
        {/* Wishlist Tab             */}
        {/* ======================== */}
        <TabsContent value="wishlist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                My Wishlist
              </CardTitle>
              <CardDescription>Products you&apos;ve saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Your wishlist is empty</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setCurrentView("home")}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {wishlist.map((item) => (
                    <button
                      key={item.productId}
                      onClick={() => navigateToProduct(item.productId)}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm font-bold text-emerald-600">
                          {formatLKR(item.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================== */}
        {/* Addresses Tab            */}
        {/* ======================== */}
        <TabsContent value="addresses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Address Form */}
              {showAddAddress && (
                <div className="p-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 space-y-3">
                  <h4 className="font-medium text-sm">Add New Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label (e.g., Home, Office)</Label>
                      <Input
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Home"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="07X XXX XXXX"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Address</Label>
                      <Input
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        placeholder="Full address"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddAddress} className="bg-emerald-600 hover:bg-emerald-700">
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save Address
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddAddress(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 && !showAddAddress ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No saved addresses</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowAddAddress(true)}
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                addresses.map((addr: any) => (
                  <div key={addr.id} className="p-4 rounded-xl border flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{addr.label || "Address"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.address}</p>
                        <p className="text-xs text-muted-foreground">{addr.city}{addr.phone ? ` • ${addr.phone}` : ""}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
