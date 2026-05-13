"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsappButton() {
  const phoneNumber = "94710678944"; // Developer number or client number
  const message = "Hello SL HUB! I'm interested in your services.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[60] bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
    >
      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 group-hover:hidden"></div>
      <MessageCircle className="w-6 h-6 fill-current" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border dark:border-gray-700">
        Chat with us on WhatsApp
      </span>
    </motion.a>
  );
}
