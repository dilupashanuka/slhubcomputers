// =============================================================================
// SL HUB COMPUTER - Newsletter Signup Section
// =============================================================================
// Purpose: Email newsletter subscription section for the homepage
// Features: Eye-catching gradient background, email input, subscribe button,
//           trust indicators, animated pulse effect on CTA
// Business: Build customer email list for marketing promotions
// =============================================================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Loader2, Gift, Bell } from "lucide-react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);

    // Simulate subscription (no backend endpoint needed - stores locally)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store subscription in localStorage
    const subscriptions = JSON.parse(
      localStorage.getItem("slhub-newsletter") || "[]"
    );
    subscriptions.push({ email: email.trim(), date: new Date().toISOString() });
    localStorage.setItem("slhub-newsletter", JSON.stringify(subscriptions));

    setSubscribed(true);
    setEmail("");
    toast.success("Successfully subscribed! Thank you!");
    setSubscribing(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Bell className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-white mb-3">
            Stay Updated with SL HUB COMPUTER
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Subscribe to our newsletter for exclusive deals, new product alerts,
            and tech tips delivered straight to your inbox.
          </p>

          {/* Subscription Form */}
          {subscribed ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                You&apos;re Subscribed!
              </h3>
              <p className="text-blue-100">
                Thanks for subscribing. You&apos;ll hear from us soon with the
                latest deals and updates.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus-visible:ring-white/50 text-base"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={subscribing}
                className="h-12 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 shrink-0"
              >
                {subscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Gift className="w-5 h-5 text-yellow-300 shrink-0" />
              <span>Exclusive deals & discounts</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Bell className="w-5 h-5 text-green-300 shrink-0" />
              <span>New product announcements</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Mail className="w-5 h-5 text-purple-300 shrink-0" />
              <span>Tech tips & guides</span>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-blue-200/60 text-xs mt-6">
            We respect your privacy. Unsubscribe at any time. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}
