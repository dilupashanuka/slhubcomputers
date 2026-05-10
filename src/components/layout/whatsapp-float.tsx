// =============================================================================
// SL HUB COMPUTER - WhatsApp Floating Chat Button
// =============================================================================
// Purpose: Persistent floating WhatsApp button for instant customer contact
// Features: Animated pulse effect, tooltip on hover, opens WhatsApp chat,
//           responsive positioning, dark mode compatible
// Business: WhatsApp is the primary ordering channel in Sri Lanka
// Phone: 071 067 8944 (international: +94710678944)
// =============================================================================

"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

// ---------------------------------------------------------------------------
// WhatsApp Configuration
// ---------------------------------------------------------------------------
const WHATSAPP_NUMBER = "94710678944"; // SL HUB COMPUTER WhatsApp (no + sign)
const DEFAULT_MESSAGE = "Hi SL HUB COMPUTER! I'm interested in your products. Can you help me?";

export function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show tooltip after 5 seconds on first visit
  useState(() => {
    const timer = setTimeout(() => {
      const hasSeenTooltip = localStorage.getItem("slhub-wa-tooltip-seen");
      if (!hasSeenTooltip) {
        setShowTooltip(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  });

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank");
    setShowTooltip(false);
    localStorage.setItem("slhub-wa-tooltip-seen", "true");
  };

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    setDismissed(true);
    localStorage.setItem("slhub-wa-tooltip-seen", "true");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip Bubble */}
      {showTooltip && !dismissed && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-br-sm shadow-xl p-4 max-w-[240px] border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDismissTooltip}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            Need Help? 💬
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Chat with us on WhatsApp for quick assistance!
          </p>
          <button
            onClick={handleOpenWhatsApp}
            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            Start Chat
          </button>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <button
        onClick={handleOpenWhatsApp}
        onMouseEnter={() => setShowTooltip(false)}
        className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse Animation Ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />

        {/* Online Badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full">
          <span className="absolute inset-0 bg-green-400 rounded-full animate-pulse" />
        </span>
      </button>

      {/* Label below button */}
      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 -mt-1">
        WhatsApp
      </span>
    </div>
  );
}
