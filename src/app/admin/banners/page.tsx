"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Layout, ExternalLink, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SingleImageUploader } from "@/components/admin/image-upload";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  bgColor: string | null;
  order: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    link: "",
    buttonText: "Shop Now",
    bgColor: "bg-blue-600",
    order: "0",
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch (error) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setSelectedBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        image: banner.image || "",
        link: banner.link || "",
        buttonText: banner.buttonText || "Shop Now",
        bgColor: banner.bgColor || "bg-blue-600",
        order: banner.order.toString(),
        isActive: banner.isActive,
      });
    } else {
      setSelectedBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        image: "",
        link: "",
        buttonText: "Shop Now",
        bgColor: "bg-blue-600",
        order: "0",
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = selectedBanner ? "PUT" : "POST";
      const body = selectedBanner ? { ...formData, id: selectedBanner.id } : formData;

      const res = await fetch("/api/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedBanner ? "Banner updated" : "Banner created");
        setDialogOpen(false);
        fetchBanners();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    try {
      const res = await fetch(`/api/banners?id=${selectedBanner.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Banner deleted");
        setDeleteDialogOpen(false);
        fetchBanners();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage homepage hero banners and promotions</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>Banners are displayed in the homepage carousel sorted by order.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Preview</TableHead>
                  <TableHead>Banner Info</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative w-16 h-10 rounded overflow-hidden border bg-muted">
                        {banner.image ? (
                          <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layout className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{banner.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{banner.subtitle}</div>
                    </TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(banner)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedBanner(banner); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No banners found. Create your first banner to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the homepage banner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Banner Title *</Label>
                <Input 
                  id="title" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Extreme Gaming PCs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input 
                  id="subtitle" 
                  value={formData.subtitle} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="e.g. Powered by RTX 4090"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input 
                  id="buttonText" 
                  value={formData.buttonText} 
                  onChange={e => setFormData({...formData, buttonText: e.target.value})}
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed offer or info..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input 
                  id="link" 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  placeholder="/shop/gaming-pcs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  onChange={e => setFormData({...formData, order: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <SingleImageUploader 
                  value={formData.image}
                  onChange={url => setFormData({...formData, image: url})}
                  folder="banners"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Theme (Tailwind class)</Label>
                <Input 
                  id="bgColor" 
                  value={formData.bgColor} 
                  onChange={e => setFormData({...formData, bgColor: e.target.value})}
                  placeholder="bg-blue-600 or bg-[#121212]"
                />
                <p className="text-[10px] text-muted-foreground">Default: bg-blue-600</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch 
                  id="isActive" 
                  checked={formData.isActive}
                  onCheckedChange={val => setFormData({...formData, isActive: val})}
                />
                <Label htmlFor="isActive">Active (Visible on Homepage)</Label>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This banner will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
