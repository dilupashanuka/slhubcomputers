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

import { useStore } from "@/store/use-store";
import { MessageCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// WhatsApp Configuration
// ---------------------------------------------------------------------------
const WHATSAPP_NUMBER = "94710678944"; // SL HUB COMPUTER WhatsApp (no + sign)
const DEFAULT_MESSAGE = "Hi SL HUB COMPUTER! I'm interested in your products. Can you help me?";

export function WhatsAppFloat() {
  const { isModuleEnabled } = useStore();

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank");
  };

  if (!isModuleEnabled("enableWhatsApp")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Main WhatsApp Button */}
      <button
        onClick={handleOpenWhatsApp}
        className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse Animation Ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />
      </button>

      {/* Label below button */}
      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 -mt-1">
        WhatsApp
      </span>
    </div>
  );
}
