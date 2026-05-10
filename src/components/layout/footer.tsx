// =============================================================================
// SL HUB COMPUTER - Footer Component
// =============================================================================
// Purpose: 5-column footer with company info, quick links, policies, services,
//          and contact details for SL HUB COMPUTER
// Features: Responsive grid, social links, WhatsApp button, dark mode support
// =============================================================================

"use client";

import { useStore } from "@/store/use-store";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Cpu,
  Wrench,
  Laptop,
  Camera,
  Smartphone,
  Code,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import type { ViewType } from "@/types";

// Footer navigation helper
const nav = (view: ViewType) => {
  const { setCurrentView } = useStore.getState();
  setCurrentView(view);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Trust Badges - From TechZone */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-white">Free Shipping</div>
                <div className="text-xs text-gray-400">Orders over Rs. 25,000</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-white">Genuine Products</div>
                <div className="text-xs text-gray-400">100% authentic guarantee</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-white">Easy Returns</div>
                <div className="text-xs text-gray-400">7-day return policy</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-white">Flexible Payment</div>
                <div className="text-xs text-gray-400">COD & Bank Transfer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">SL HUB</h3>
                <p className="text-[10px] text-gray-400">COMPUTER</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your Trusted Tech Partner in Deiyandara, Sri Lanka. Premium computer parts,
              custom PCs, and expert repair services since day one.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=100063543731370"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/94710678944"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:slhubcomputer@gmail.com"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => nav("home")} className="hover:text-blue-400 transition-colors">Home</button></li>
              <li><button onClick={() => nav("prebuilt")} className="hover:text-blue-400 transition-colors">Pre-Built PCs</button></li>
              <li><button onClick={() => nav("pc-builder")} className="hover:text-blue-400 transition-colors">PC Builder</button></li>
              <li><button onClick={() => nav("gift-card")} className="hover:text-blue-400 transition-colors">Gift Cards</button></li>
              <li><button onClick={() => nav("about")} className="hover:text-blue-400 transition-colors">About Us</button></li>
              <li><button onClick={() => nav("contact")} className="hover:text-blue-400 transition-colors">Contact Us</button></li>
              <li><button onClick={() => nav("faq")} className="hover:text-blue-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => nav("affiliate")} className="hover:text-blue-400 transition-colors">Affiliate Program</button></li>
            </ul>
          </div>

          {/* Column 3: Company & Policies */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company & Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => nav("about")} className="hover:text-blue-400 transition-colors">About SL HUB</button></li>
              <li><button onClick={() => nav("shipping")} className="hover:text-blue-400 transition-colors">Shipping Policy</button></li>
              <li><button onClick={() => nav("returns")} className="hover:text-blue-400 transition-colors">Returns & Refunds</button></li>
              <li><button onClick={() => nav("terms")} className="hover:text-blue-400 transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => nav("faq")} className="hover:text-blue-400 transition-colors">FAQ</button></li>
            </ul>
          </div>

          {/* Column 4: Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Cpu className="w-3 h-3 text-blue-400" /> PC Parts & Repair</li>
              <li className="flex items-center gap-2"><Laptop className="w-3 h-3 text-blue-400" /> Laptop Repair</li>
              <li className="flex items-center gap-2"><Smartphone className="w-3 h-3 text-blue-400" /> Mobile Accessories</li>
              <li className="flex items-center gap-2"><Camera className="w-3 h-3 text-blue-400" /> CCTV (Tiandy)</li>
              <li className="flex items-center gap-2"><Wrench className="w-3 h-3 text-blue-400" /> Custom PC Building</li>
              <li className="flex items-center gap-2"><Code className="w-3 h-3 text-blue-400" /> Software Solutions</li>
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>Hakmana Road, Deiyandara, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:0710678944" className="hover:text-blue-400 transition-colors">071 067 8944</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:slhubcomputer@gmail.com" className="hover:text-blue-400 transition-colors text-xs">slhubcomputer@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Mon-Sat: 9AM-7PM<br />Sun: 10AM-5PM</span>
              </li>
            </ul>
            <a
              href="https://wa.me/94710678944"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-gray-700" />
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SL HUB COMPUTER. All rights reserved.</p>
          <p>Your Trusted Tech Partner - Deiyandara, Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
