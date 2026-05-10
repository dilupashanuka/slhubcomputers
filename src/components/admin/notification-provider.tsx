// =============================================================================
// SL HUB COMPUTER - Browser Push Notification Provider
// =============================================================================
// Purpose: Client-side component that manages browser notification permissions
//          and polls for new notifications, showing browser Notification popups
// Features:
//   - Request browser notification permission on admin panel load
//   - Poll /api/admin/notifications every 30 seconds for new notifications
//   - Show browser Notification API popup for new orders, messages, etc.
//   - Track which notifications have been shown (Set in state)
//   - Optional notification sound
// =============================================================================

"use client";

import { useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Icon map for notification types
// ---------------------------------------------------------------------------
const NOTIFICATION_ICONS: Record<string, string> = {
  order: "🛒",
  message: "💬",
  review: "⭐",
  stock: "📦",
  coupon: "🎟️",
  system: "🔔",
};

// ---------------------------------------------------------------------------
// NotificationProvider - Wraps admin layout, manages browser notifications
// ---------------------------------------------------------------------------
export default function NotificationProvider({ children }: NotificationProviderProps) {
  const shownIds = useRef<Set<string>>(new Set());
  const permissionRequested = useRef(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------------------
  // Request browser notification permission
  // -------------------------------------------------------------------------
  const requestPermission = useCallback(async () => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;

    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    try {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        console.log("🔔 Notification permission:", permission);
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Play notification sound
  // -------------------------------------------------------------------------
  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Sound not available, skip silently
    }
  }, []);

  // -------------------------------------------------------------------------
  // Show a browser notification
  // -------------------------------------------------------------------------
  const showBrowserNotification = useCallback(
    (notification: NotificationItem) => {
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      // Skip if already shown
      if (shownIds.current.has(notification.id)) return;
      shownIds.current.add(notification.id);

      const icon = NOTIFICATION_ICONS[notification.type] || "🔔";

      try {
        const browserNotif = new Notification(`${icon} ${notification.title}`, {
          body: notification.message,
          tag: notification.id,
          icon: "/favicon.ico",
          silent: false,
        });

        // Play sound
        playNotificationSound();

        // Click handler - navigate to relevant page
        browserNotif.onclick = () => {
          window.focus();
          if (notification.link) {
            window.location.href = notification.link;
          }
          browserNotif.close();
        };

        // Auto-close after 8 seconds
        setTimeout(() => browserNotif.close(), 8000);
      } catch (error) {
        console.error("Browser notification error:", error);
      }
    },
    [playNotificationSound]
  );

  // -------------------------------------------------------------------------
  // Poll for new notifications
  // -------------------------------------------------------------------------
  const pollNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?unread=true&includeCount=true&limit=10");
      const data = await res.json();

      if (data.success && data.data.notifications) {
        const unreadNotifications: NotificationItem[] = data.data.notifications;

        // Show browser notifications for any new unread items
        for (const notification of unreadNotifications) {
          if (!shownIds.current.has(notification.id)) {
            showBrowserNotification(notification);
          }
        }
      }
    } catch (error) {
      // Silently fail - polling will retry
      console.error("Notification poll error:", error);
    }
  }, [showBrowserNotification]);

  // -------------------------------------------------------------------------
  // Initialize on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Request permission
    requestPermission();

    // Initial poll
    pollNotifications();

    // Set up polling every 30 seconds
    pollingInterval.current = setInterval(pollNotifications, 30000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [requestPermission, pollNotifications]);

  // -------------------------------------------------------------------------
  // Listen for visibility change - poll when tab becomes visible
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pollNotifications]);

  return <>{children}</>;
}
