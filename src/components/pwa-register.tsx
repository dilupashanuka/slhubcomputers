// =============================================================================
// SL HUB COMPUTER - PWA Registration Component
// =============================================================================
// Purpose: Registers the service worker and handles "Install App" prompt
// Features: Service worker registration, beforeinstallprompt handler,
//           install banner/toast, install status tracking
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

// ---------------------------------------------------------------------------
// BeforeInstallPromptEvent type (not in standard TS types)
// ---------------------------------------------------------------------------
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ---------------------------------------------------------------------------
// PWA Register Component
// ---------------------------------------------------------------------------
export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // ---- Register Service Worker ----
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(() => {
              // Silently fail update checks
            });
          }, 60 * 60 * 1000); // Every hour
        })
        .catch((error) => {
          console.warn("[PWA] Service Worker registration failed:", error);
        });
    }

    // ---- Handle beforeinstallprompt ----
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show the install banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    // ---- Handle appinstalled ----
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log("[PWA] App installed successfully");
    };

    // ---- Check if already in standalone mode (installed) ----
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // ---- Handle Install Click ----
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }
    } catch (error) {
      console.warn("[PWA] Install prompt error:", error);
    } finally {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  // ---- Dismiss Banner ----
  const handleDismiss = () => {
    setShowBanner(false);
  };

  // Don't render anything if already installed or no prompt available
  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-4 shadow-2xl shadow-emerald-900/20">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white">Install SL HUB</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Add to your home screen for quick access and offline browsing.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4 mr-1.5" /> Install App
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}
