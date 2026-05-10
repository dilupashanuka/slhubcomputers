// =============================================================================
// Chat Summary Widget - Unread chat messages
// =============================================================================

"use client";

import { WidgetWrapper } from "./widget-wrapper";
import { MessageCircle } from "lucide-react";

interface ChatSummaryWidgetProps {
  unreadCount: number;
  activeSessions: number;
  loading?: boolean;
  isEditing?: boolean;
  onRemove?: () => void;
}

export function ChatSummaryWidget({ unreadCount, activeSessions, loading, isEditing, onRemove }: ChatSummaryWidgetProps) {
  return (
    <WidgetWrapper
      title="Chat Summary"
      description="Unread messages and active sessions"
      icon={<MessageCircle className="size-4 text-green-600" />}
      size="small"
      isEditing={isEditing}
      onRemove={onRemove}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            unreadCount > 0 ? "bg-rose-100 dark:bg-rose-900/30" : "bg-green-100 dark:bg-green-900/30"
          }`}>
            <MessageCircle className={`w-5 h-5 ${unreadCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-green-600 dark:text-green-400"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unread Messages</p>
            <p className="text-xl font-bold">{unreadCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
            <p className="text-xl font-bold">{activeSessions}</p>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
