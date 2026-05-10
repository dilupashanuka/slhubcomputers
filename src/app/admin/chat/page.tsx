// =============================================================================
// SL HUB COMPUTER - Admin Live Chat Management Page
// =============================================================================
// Purpose: Admin page to manage live chat conversations
// Features:
//   - Left panel: list of active chat sessions
//   - Right panel: selected conversation with message history and reply
//   - Quick reply templates
//   - Mark messages as read when opened
//   - Auto-refresh every 5 seconds
// =============================================================================

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Clock,
  Search,
  RefreshCw,
  Circle,
  MessageSquare,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatSession {
  sessionId: string;
  name: string;
  email: string | null;
  lastMessage: {
    id: string;
    message: string;
    sender: string;
    createdAt: string;
  } | null;
  messageCount: number;
  unreadCount: number;
  isOnline: boolean;
  firstActivity: string | null;
  lastActivity: string | null;
}

interface ChatMessageData {
  id: string;
  sessionId: string;
  name: string | null;
  email: string | null;
  message: string;
  sender: string;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Quick Reply Templates
// ---------------------------------------------------------------------------
const quickReplies = [
  "Thank you for contacting SL HUB!",
  "Let me check that for you.",
  "Could you provide more details?",
  "I'll look into this right away.",
  "Is there anything else I can help with?",
  "Our typical response time is within 24 hours.",
  "Please visit our store for the best deals!",
  "Let me transfer you to a specialist.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Admin Chat Page Component
// ---------------------------------------------------------------------------
export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Fetch sessions
  // -------------------------------------------------------------------------
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat");
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch messages for selected session
  // -------------------------------------------------------------------------
  const fetchMessages = useCallback(async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(`/api/admin/chat/${encodeURIComponent(selectedSessionId)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch {
      // Silent fail
    }
  }, [selectedSessionId]);

  // -------------------------------------------------------------------------
  // Mark messages as read when selecting a session
  // -------------------------------------------------------------------------
  const markAsRead = useCallback(async (sessionId: string) => {
    try {
      await fetch(`/api/admin/chat/${encodeURIComponent(sessionId)}`, {
        method: "PUT",
      });
    } catch {
      // Silent fail
    }
  }, []);

  // -------------------------------------------------------------------------
  // Select a session
  // -------------------------------------------------------------------------
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSelectedSessionId(sessionId);
      markAsRead(sessionId);
      // Update local unread count immediately
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId ? { ...s, unreadCount: 0 } : s
        )
      );
    },
    [markAsRead]
  );

  // -------------------------------------------------------------------------
  // Send reply
  // -------------------------------------------------------------------------
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedSessionId || isSending) return;

    setIsSending(true);
    const text = replyText.trim();
    setReplyText("");

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchMessages();
      }
    } catch {
      setReplyText(text);
    } finally {
      setIsSending(false);
      replyInputRef.current?.focus();
    }
  };

  // -------------------------------------------------------------------------
  // Quick reply
  // -------------------------------------------------------------------------
  const handleQuickReply = (text: string) => {
    setReplyText(text);
    replyInputRef.current?.focus();
  };

  // -------------------------------------------------------------------------
  // Refresh all data
  // -------------------------------------------------------------------------
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSessions(), fetchMessages()]);
    setIsRefreshing(false);
  }, [fetchSessions, fetchMessages]);

  // -------------------------------------------------------------------------
  // Auto-refresh every 5 seconds
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
      if (selectedSessionId) fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchMessages, selectedSessionId]);

  // -------------------------------------------------------------------------
  // Fetch messages when session changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages();
    }
  }, [selectedSessionId, fetchMessages]);

  // -------------------------------------------------------------------------
  // Scroll to bottom on new messages
  // -------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------------------------------------------------
  // Filter sessions by search
  // -------------------------------------------------------------------------
  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get total unread count across all sessions
  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0);

  // Selected session data
  const selectedSession = sessions.find((s) => s.sessionId === selectedSessionId);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="size-6 text-primary" />
            Live Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer support conversations
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px]">
                {totalUnread} unread
              </Badge>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Main Layout: Session List + Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Left Panel: Session List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="p-3 pb-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1 min-h-0">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-[11px] mt-0.5">
                  Customer chats will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredSessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => handleSelectSession(session.sessionId)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                      selectedSessionId === session.sessionId
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="size-4 text-primary" />
                        </div>
                        {session.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-medium truncate">
                            {session.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                            {session.lastMessage
                              ? timeAgo(session.lastMessage.createdAt)
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] text-muted-foreground truncate">
                            {session.lastMessage
                              ? `${
                                  session.lastMessage.sender === "admin"
                                    ? "You: "
                                    : ""
                                }${session.lastMessage.message}`
                              : "No messages yet"}
                          </p>
                          {session.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-[9px] h-4 min-w-[16px] px-1 flex items-center justify-center shrink-0"
                            >
                              {session.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {session.email && (
                          <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                            {session.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Right Panel: Chat Conversation */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedSessionId && selectedSession ? (
            <>
              {/* Chat Header */}
              <CardHeader className="p-3 pb-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-5 text-primary" />
                      </div>
                      {selectedSession.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {selectedSession.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        {selectedSession.isOnline ? (
                          <>
                            <Circle className="size-2 fill-green-500 text-green-500" />
                            Online
                          </>
                        ) : (
                          <>
                            <Circle className="size-2 text-muted-foreground/40" />
                            Offline
                          </>
                        )}
                        {selectedSession.email && (
                          <span className="ml-1.5">
                            &middot; {selectedSession.email}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {messages.length} messages
                  </Badge>
                </div>
              </CardHeader>
              <Separator />

              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No messages in this conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${
                          msg.sender === "admin" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            msg.sender === "admin"
                              ? "bg-primary/10"
                              : "bg-muted"
                          }`}
                        >
                          {msg.sender === "admin" ? (
                            <Bot className="size-3.5 text-primary" />
                          ) : (
                            <User className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 max-w-[75%] ${
                            msg.sender === "admin"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              msg.sender === "admin"
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Clock className="size-2.5" />
                            <span className="text-[10px]">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Quick Replies */}
              <div className="px-3 pt-2 shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="size-3 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-muted-foreground font-medium shrink-0">
                    Quick replies:
                  </p>
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {quickReplies.slice(0, 4).map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(reply)}
                        className="text-[10px] px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors whitespace-nowrap shrink-0"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              <div className="p-3 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    ref={replyInputRef}
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    disabled={isSending}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSending}
                    className="h-9 w-9 shrink-0"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No session selected */
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No conversation selected</p>
                <p className="text-[11px] mt-0.5">
                  Choose a chat from the left to start responding
                </p>
                {sessions.length === 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 max-w-xs mx-auto">
                    <p className="text-[11px]">
                      When customers start a chat on the website, their
                      conversations will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
