// =============================================================================
// SL HUB COMPUTER - Gift Card Purchase Page
// =============================================================================
// Purpose: Beautiful gift card purchase form for the storefront
// Features: Amount presets, occasion selector, purchaser & recipient details,
//           personal message, preview, professional dark themed design
// =============================================================================

"use client";

import { useState } from "react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Gift,
  PartyPopper,
  Heart,
  GraduationCap,
  TreePine,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Amount Presets
// ---------------------------------------------------------------------------
const AMOUNT_PRESETS = [
  { value: 1000, label: "Rs. 1,000" },
  { value: 2500, label: "Rs. 2,500" },
  { value: 5000, label: "Rs. 5,000" },
  { value: 10000, label: "Rs. 10,000" },
  { value: 25000, label: "Rs. 25,000" },
];

// ---------------------------------------------------------------------------
// Occasion Config
// ---------------------------------------------------------------------------
const OCCASIONS = [
  { value: "birthday", label: "Birthday", icon: PartyPopper, color: "from-pink-500 to-rose-500", emoji: "🎂" },
  { value: "wedding", label: "Wedding", icon: Heart, color: "from-rose-500 to-red-500", emoji: "💒" },
  { value: "graduation", label: "Graduation", icon: GraduationCap, color: "from-blue-500 to-cyan-500", emoji: "🎓" },
  { value: "holiday", label: "Holiday", icon: TreePine, color: "from-green-500 to-emerald-500", emoji: "🎄" },
  { value: "general", label: "General", icon: Sparkles, color: "from-amber-500 to-orange-500", emoji: "✨" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function GiftCardPage() {
  const { setCurrentView } = useStore();

  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [occasion, setOccasion] = useState("general");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedOccasion = OCCASIONS.find((o) => o.value === occasion) || OCCASIONS[4];
  const finalAmount = amount || (customAmount ? Number(customAmount) : 0);
  const OccIcon = selectedOccasion.icon;

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount < 500) {
      toast.error("Please select an amount (minimum Rs. 500)");
      return;
    }
    if (!purchaserName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!purchaserEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedOccasion.label} Gift Card`,
          amount: finalAmount,
          purchaserName: purchaserName.trim(),
          purchaserEmail: purchaserEmail.trim(),
          recipientName: recipientName.trim() || null,
          recipientEmail: recipientEmail.trim() || null,
          message: message.trim() || null,
          occasion,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGiftCardCode(data.data.code);
        setSuccess(true);
        toast.success("Gift card purchased successfully!");
      } else {
        toast.error(data.error || "Failed to purchase gift card");
      }
    } catch {
      toast.error("Failed to purchase gift card");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(giftCardCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---- Success State ----
  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-800/50">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Gift Card Purchased!</h2>
          <p className="text-muted-foreground mb-6">
            Your gift card has been created successfully. Share the code below with the recipient.
          </p>

          {/* Gift Card Code Display */}
          <div className={`bg-gradient-to-br ${selectedOccasion.color} rounded-xl p-6 text-white mb-6 shadow-lg`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <OccIcon className="w-5 h-5" />
              <span className="font-medium">{selectedOccasion.label} Gift Card</span>
            </div>
            <p className="text-3xl font-bold mb-1">Rs. {finalAmount.toLocaleString()}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-4">
              <p className="text-xs opacity-80 mb-1">Gift Card Code</p>
              <p className="text-2xl font-mono font-bold tracking-widest">{giftCardCode}</p>
            </div>
          </div>

          {/* Copy Button */}
          <Button onClick={copyCode} variant="outline" className="mb-4 w-full" size="lg">
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Code"}
          </Button>

          {recipientEmail && (
            <p className="text-xs text-muted-foreground mb-4">
              The gift card code will also be sent to {recipientEmail}
            </p>
          )}

          <div className="space-y-2">
            <Button onClick={() => setCurrentView("home")} className="w-full" size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("home")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Gift Cards
          </h1>
          <p className="text-sm text-muted-foreground">
            Give the perfect gift — let them choose what they love
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">1</span>
                Choose Amount
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => { setAmount(preset.value); setCustomAmount(""); }}
                    className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
                      amount === preset.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                  >
                    <p className="font-bold text-sm">{preset.label}</p>
                  </button>
                ))}
                <button
                  onClick={() => setAmount(null)}
                  className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
                    !amount && customAmount
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <p className="font-bold text-sm">Custom</p>
                  <p className="text-[11px] text-muted-foreground">Any amount</p>
                </button>
              </div>
              {!amount && (
                <div className="space-y-1.5">
                  <Label>Custom Amount (LKR)</Label>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (min Rs. 500)"
                    min={500}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Occasion Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">2</span>
                Select Occasion
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {OCCASIONS.map((occ) => {
                  const Icon = occ.icon;
                  return (
                    <button
                      key={occ.value}
                      onClick={() => setOccasion(occ.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        occasion === occ.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{occ.emoji}</span>
                      <Icon className={`w-4 h-4 ${occasion === occ.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-[11px] font-medium">{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Purchaser & Recipient Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">3</span>
                Your Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Your Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} placeholder="Your full name" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Your Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} placeholder="your@email.com" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="mt-6 mb-4">
                <h3 className="font-medium text-sm mb-3">Recipient Details (Optional)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Recipient Name</Label>
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient's name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Recipient Email</Label>
                  <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="recipient@email.com" />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <Label>Personal Message</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a personal message..." rows={3} className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview & Submit */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            {/* Gift Card Preview */}
            <div className={`bg-gradient-to-br ${selectedOccasion.color} rounded-2xl p-6 text-white shadow-xl`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="font-bold">SL HUB</span>
                </div>
                <span className="text-xs opacity-80">COMPUTER</span>
              </div>
              <div className="mb-6">
                <p className="text-xs opacity-80 mb-1">Gift Card Amount</p>
                <p className="text-4xl font-bold">
                  {finalAmount > 0 ? `Rs. ${finalAmount.toLocaleString()}` : "Rs. —"}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
                <p className="text-xs opacity-80 mb-1">Gift Card Code</p>
                <p className="text-lg font-mono font-bold tracking-wider">SLHUB-XXXX-XXXX</p>
              </div>
              {message && (
                <div className="bg-white/10 rounded-lg p-3 mt-3">
                  <p className="text-xs italic opacity-90">&ldquo;{message.slice(0, 100)}{message.length > 100 ? "..." : ""}&rdquo;</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 text-xs opacity-80">
                <span>{selectedOccasion.emoji} {selectedOccasion.label}</span>
                <span>Valid for 1 year</span>
              </div>
            </div>

            {/* Summary & Submit */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{selectedOccasion.label} Gift Card</span>
                    <span>{finalAmount > 0 ? `Rs. ${finalAmount.toLocaleString()}` : "—"}</span>
                  </div>
                  {recipientName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient</span>
                      <span>{recipientName}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{finalAmount > 0 ? `Rs. ${finalAmount.toLocaleString()}` : "—"}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={submitting || finalAmount < 500}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Gift Card...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Purchase Gift Card
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Gift card code will be generated instantly. Share it with the recipient.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
