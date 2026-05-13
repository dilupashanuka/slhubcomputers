"use client";

import { useEffect } from "react";
import { useStore } from "@/store/use-store";

/**
 * SiteSettingsLoader Component
 * Purpose: Fetches site settings from the API and updates the global store.
 * This ensures that settings (like enabled modules, site name, etc.) 
 * are available across all pages and components.
 */
export function SiteSettingsLoader() {
  const { setSiteSettings, siteSettings } = useStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setSiteSettings(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };

    // Fetch on mount
    fetchSettings();
    
    // Optional: Re-fetch periodically or on visibility change
    const handleFocus = () => fetchSettings();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [setSiteSettings]);

  return null; // This component doesn't render anything
}
