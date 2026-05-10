// =============================================================================
// SL HUB COMPUTER - Customer Live Chat Widget
// =============================================================================
// Purpose: Floating chat bubble with expandable chat window for customer support
// Features:
//   - Floating chat bubble in bottom-left corner
//   - Click to expand chat window
//   - Header: "SL HUB Support" with online/offline indicator
//   - Messages area with scroll
//   - Input field + send button
//   - Auto-greeting message from admin
//   - Name/email form before first message
//   - Unique sessionId per visitor (stored in localStorage)
//   - Poll for new messages every 5 seconds
//   - Professional dark theme matching site aesthetic
//   - Minimize/close button
//   - Unread message count badge on chat bubble
// =============================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Minus,
  Send,
  Bot,
  User,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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
// Helpers
// ---------------------------------------------------------------------------
function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();
  const stored = localStorage.getItem("slhub-chat-session");
  if (stored) return stored;
  const newId = generateSessionId();
  localStorage.setItem("slhub-chat-session", newId);
  return newId;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// ChatWidget Component
// ---------------------------------------------------------------------------
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pre-chat form state
  const [showPreChat, setShowPreChat] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [formError, setFormError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if customer info is already saved
  useEffect(() => {
    const savedName = localStorage.getItem("slhub-chat-name");
    const savedEmail = localStorage.getItem("slhub-chat-email");
    if (savedName) {
      setCustomerName(savedName);
      setCustomerEmail(savedEmail || "");
      setShowPreChat(false);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages);
        // Update unread count when chat is closed
        if (!isOpen) {
          setUnreadCount(data.data.unreadCount);
        } else {
          setUnreadCount(0);
        }
      }
    } catch {
      // Silent fail
    }
  }, [sessionId, isOpen]);

  // Initial fetch and polling
  useEffect(() => {
    if (!sessionId) return;
    fetchMessages();
    pollIntervalRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [sessionId, fetchMessages]);

  // Handle pre-chat form submission
  const handlePreChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError("Please enter your name");
      return;
    }
    // Save customer info
    localStorage.setItem("slhub-chat-name", customerName.trim());
    if (customerEmail.trim()) {
      localStorage.setItem("slhub-chat-email", customerEmail.trim());
    }
    setShowPreChat(false);
    setFormError("");
    // Focus on input after form submission
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: customerName,
          email: customerEmail,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Immediately refresh messages
        await fetchMessages();
      }
    } catch {
      // Restore message on error
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle chat open/close
  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
      return;
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Minimize chat
  const minimizeChat = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  // Close chat completely
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Auto-greeting message (virtual - displayed client-side)
  const hasAutoGreeting = messages.some((m) => m.sender === "admin");

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        aria-label="Open chat support"
      >
        {isOpen && !isMinimized ? (
          <X className="size-6" />
        ) : (
          <>
            <MessageCircle className="size-6 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {(isOpen || isMinimized) && (
        <div
          className={`fixed bottom-24 left-6 z-50 transition-all duration-300 ${
            isMinimized
              ? "opacity-0 pointer-events-none scale-95 translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
          }`}
          style={{ width: "380px", maxWidth: "calc(100vw - 48px)" }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="size-5" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">SL HUB Support</h3>
                  <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={minimizeChat}
                  className="p-1.5 hover:bg-primary-foreground/15 rounded-lg transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-1.5 hover:bg-primary-foreground/15 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              {/* Auto-greeting */}
              {!hasAutoGreeting && !showPreChat && (
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
                    <p className="text-sm">
                      Hi! How can we help you today? 😊
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      <Clock className="size-2.5 inline mr-0.5" />
                      Just now
                    </p>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 mb-3 ${
                    msg.sender === "customer" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === "customer"
                        ? "bg-primary/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {msg.sender === "customer" ? (
                      <User className="size-3.5 text-primary" />
                    ) : (
                      <Bot className="size-3.5 text-primary" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[80%] ${
                      msg.sender === "customer"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === "customer"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pre-chat form */}
              {showPreChat && (
                <div className="mt-2">
                  <div className="flex items-start gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm">
                        Hi! How can we help you today? 😊
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        <Clock className="size-2.5 inline mr-0.5" />
                        Just now
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePreChatSubmit}
                    className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border/50"
                  >
                    <p className="text-sm font-medium">
                      Before we start, please tell us your name:
                    </p>
                    <Input
                      placeholder="Your name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9 text-sm bg-background"
                      autoFocus
                    />
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="h-9 text-sm bg-background"
                    />
                    {formError && (
                      <p className="text-xs text-destructive">{formError}</p>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full gap-1.5"
                    >
                      Start Chat
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </form>
                </div>
              )}

              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            {!showPreChat && (
              <div className="p-3 border-t bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="h-9 w-9 shrink-0"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
