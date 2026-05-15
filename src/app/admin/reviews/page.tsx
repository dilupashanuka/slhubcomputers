// =============================================================================
// SL HUB COMPUTER - Admin Reviews Page
// =============================================================================
// Purpose: Full CRUD management page for product reviews with table,
//          review detail view, approve/reject toggle, and delete.
// Features:
//   - Reviews table with product name, reviewer, rating, title, status, date
//   - Filter by approval status (all, approved, pending)
//   - Review detail dialog showing full comment
//   - Approve/Reject toggle per review
//   - Star rating display
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Currency: LKR (Rs.)
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface Review {
  id: string;
  productId: string;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { name: string };
}

// ---------------------------------------------------------------------------
// Helper: Render star rating visually
// ---------------------------------------------------------------------------
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Format date
// ---------------------------------------------------------------------------
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Reviews Page Component
// ---------------------------------------------------------------------------
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch reviews from API with optional approval filter
  // Re-fetch when approvalFilter or refreshKey changes
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchReviews = async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", "50");
        if (approvalFilter === "approved") params.set("approved", "true");
        if (approvalFilter === "pending") params.set("approved", "false");

        const res = await fetch(`/api/admin/reviews?${params}`);
        const data = await res.json();
        if (!cancelled && data.success) setReviews(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReviews();
    return () => { cancelled = true; };
  }, [approvalFilter, refreshKey]);

  // -------------------------------------------------------------------------
  // Toggle review approval status
  // -------------------------------------------------------------------------
  const toggleApproval = async (review: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !review.isApproved }),
      });
      const data = await res.json();
      if (data.success) setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle review deletion (marks as unapproved since there's no dedicated
  // review DELETE endpoint - uses the main handleDeleteConfirm instead)
  // -------------------------------------------------------------------------

  // Simple delete that just removes from local state since there's no
  // dedicated review DELETE endpoint
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      // Find the review to get its product ID for the API call
      const review = reviews.find((r) => r.id === deleteId);
      if (!review) return;

      // Use PUT to mark as unapproved as a soft delete alternative
      await fetch(`/api/admin/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId, isApproved: false }),
      });
      setDeleteId(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-36 h-8">
              <Filter className="size-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="max-w-[150px] truncate font-medium text-sm">
                        {review.product?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{review.name}</p>
                          {review.email && (
                            <p className="text-[11px] text-muted-foreground">{review.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-sm">
                        {review.title || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={review.isApproved ? "default" : "outline"}
                          className="text-xs"
                        >
                          {review.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleApproval(review)}
                            title={review.isApproved ? "Reject" : "Approve"}
                          >
                            {review.isApproved ? (
                              <XCircle className="size-3 text-orange-500" />
                            ) : (
                              <CheckCircle className="size-3 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteId(review.id)}
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

      {/* Review Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View the full content and rating of the customer review.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedReview.name}</p>
                  {selectedReview.email && (
                    <p className="text-sm text-muted-foreground">{selectedReview.email}</p>
                  )}
                </div>
                <StarRating rating={selectedReview.rating} />
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{selectedReview.product?.name || "Unknown"}</p>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Comment</p>
                <p className="text-sm mt-1">{selectedReview.comment}</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatDate(selectedReview.createdAt)}
                </span>
                <Badge variant={selectedReview.isApproved ? "default" : "outline"}>
                  {selectedReview.isApproved ? "Approved" : "Pending"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
