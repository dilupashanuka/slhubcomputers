// =============================================================================
// SL HUB COMPUTER - Theme Provider Component
// =============================================================================
// Purpose: Client-side component that applies the theme on mount and listens
//          for theme changes in real-time
// Features:
//   - On mount, loads theme from localStorage (instant), then fetches from API
//   - Applies CSS variables to document root
//   - Listens for storage events (cross-tab sync)
//   - Dispatches custom event when theme changes
// =============================================================================

"use client";

import { useEffect, useCallback } from "react";
import { ThemeConfig, defaultTheme } from "@/lib/theme-config";
import { applyTheme, loadThemeFromStorage } from "@/lib/apply-theme";

// Custom event name for theme changes
export const THEME_CHANGE_EVENT = "slhub-theme-change";

// ---------------------------------------------------------------------------
// Dispatch theme change event
// ---------------------------------------------------------------------------
export function dispatchThemeChange(config: ThemeConfig): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: config }));
}

// ---------------------------------------------------------------------------
// ThemeProvider Component
// ---------------------------------------------------------------------------
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Apply theme on mount
  const initTheme = useCallback(async () => {
    // 1. Instant load from localStorage
    const stored = loadThemeFromStorage();
    if (stored) {
      applyTheme(stored);
    }

    // 2. Fetch from API for authoritative config
    try {
      const res = await fetch("/api/admin/theme");
      const data = await res.json();
      if (data.success && data.data) {
        const config: ThemeConfig = {
          primaryColor: data.data.primaryColor || defaultTheme.primaryColor,
          accentColor: data.data.accentColor || defaultTheme.accentColor,
          headerBgColor: data.data.headerBgColor || defaultTheme.headerBgColor,
          buttonRadius: data.data.buttonRadius ?? defaultTheme.buttonRadius,
          buttonStyle: data.data.buttonStyle || defaultTheme.buttonStyle,
          fontFamily: data.data.fontFamily || defaultTheme.fontFamily,
          cardStyle: data.data.cardStyle || defaultTheme.cardStyle,
        };
        applyTheme(config);
      }
    } catch (error) {
      console.error("Failed to fetch theme config:", error);
      // If API fails and no stored theme, apply default
      if (!stored) {
        applyTheme(defaultTheme);
      }
    }
  }, []);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Listen for cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "slhub-theme-config" && e.newValue) {
        try {
          const config = JSON.parse(e.newValue) as ThemeConfig;
          applyTheme(config);
        } catch {
          // Invalid JSON
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for custom theme change events (same tab)
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeConfig>;
      if (customEvent.detail) {
        applyTheme(customEvent.detail);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  return <>{children}</>;
}
