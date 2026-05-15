// =============================================================================
// SL HUB COMPUTER - Admin Messages Page
// =============================================================================
// Purpose: Full management page for contact form messages with table,
//          message detail view, mark as read/replied, and delete.
// Features:
//   - Messages table with sender name, email, subject, read status, date
//   - Filter by read/unread status
//   - Message detail dialog showing full message with reply info
//   - Mark as read / Mark as replied actions
//   - Unread message indicator badge
//   - Delete confirmation with AlertDialog
// Client: SL HUB COMPUTER, Deiyandara | Hotline: 071 067 8944
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  Mail,
  MailOpen,
  CheckCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
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
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helper: Format date
// ---------------------------------------------------------------------------
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Messages Page Component
// ---------------------------------------------------------------------------
export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [readFilter, setReadFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch messages from API with optional read filter
  // Re-fetch when readFilter or refreshKey changes
  // -------------------------------------------------------------------------
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchMessages = async () => {
      try {
        const params = new URLSearchParams();
        if (readFilter === "unread") params.set("unread", "true");

        const res = await fetch(`/api/admin/messages?${params}`);
        const data = await res.json();
        if (!cancelled && data.success) setMessages(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMessages();
    return () => { cancelled = true; };
  }, [readFilter, refreshKey]);

  // -------------------------------------------------------------------------
  // View message detail (also marks as read via API)
  // -------------------------------------------------------------------------
  const handleViewDetail = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setDetailOpen(true);

    // Mark as read if unread
    if (!message.isRead) {
      try {
        await fetch(`/api/admin/messages/${message.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        setRefreshKey((k) => k + 1); // Refresh to update read status
      } catch (error) {
        console.error("Mark read error:", error);
      }
    }
  };

  // -------------------------------------------------------------------------
  // Toggle replied status
  // -------------------------------------------------------------------------
  const toggleReplied = async (message: ContactMessage) => {
    try {
      await fetch(`/api/admin/messages/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReplied: !message.isReplied }),
      });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Toggle replied error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Handle message deletion
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        setRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Count unread messages for the header badge
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage contact form messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={readFilter} onValueChange={(val) => setReadFilter(val as string)}>
            <SelectTrigger className="w-36 h-8">
              <Filter className="size-3 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Phone</TableHead>
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
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => (
                    <TableRow
                      key={msg.id}
                      className={msg.isRead ? "" : "bg-primary/5 font-medium"}
                    >
                      {/* Read/Unread icon indicator */}
                      <TableCell>
                        {msg.isRead ? (
                          <MailOpen className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Mail className="size-3.5 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={msg.isRead ? "" : "font-semibold"}>
                            {msg.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {msg.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {msg.subject}
                      </TableCell>
                      <TableCell className="text-sm">
                        {msg.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!msg.isRead && (
                            <Badge variant="destructive" className="text-[10px]">
                              New
                            </Badge>
                          )}
                          {msg.isReplied && (
                            <Badge variant="outline" className="text-[10px]">
                              <CheckCircle className="size-2.5 mr-0.5" />
                              Replied
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(msg.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleViewDetail(msg)}
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleReplied(msg)}
                            title={msg.isReplied ? "Mark Unreplied" : "Mark Replied"}
                          >
                            <CheckCircle
                              className={`size-3 ${msg.isReplied ? "text-green-500" : "text-muted-foreground"}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteId(msg.id)}
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

      {/* Message Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View the full content of the message and its sender information.
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-3 py-2">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedMessage.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              <Separator />

              {/* Subject */}
              <div>
                <p className="text-muted-foreground text-sm">Subject</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>

              {/* Message Body */}
              <div>
                <p className="text-muted-foreground text-sm">Message</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <Separator />

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!selectedMessage.isRead && (
                    <Badge variant="destructive" className="text-xs">Unread</Badge>
                  )}
                  {selectedMessage.isReplied ? (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="size-3 mr-1" /> Replied
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not Replied</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleReplied(selectedMessage);
                    setDetailOpen(false);
                  }}
                >
                  {selectedMessage.isReplied ? "Mark Unreplied" : "Mark as Replied"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This cannot be undone.
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
