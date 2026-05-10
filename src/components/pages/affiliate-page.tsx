// =============================================================================
// SL HUB COMPUTER - Affiliate / Referral Page (Storefront)
// =============================================================================
// Purpose: Public affiliate page for customers to join the referral program
// Features:
//   - "Become an Affiliate" hero section with benefits
//   - Application form (name, email, phone)
//   - Already an affiliate? Enter code to see dashboard
//   - Dashboard: clicks, conversions, earnings, referral link
//   - Referral history and payment history
// =============================================================================

"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Share2,
  MousePointerClick,
  Award,
  BarChart3,
  Wallet,
  Link2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/use-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AffiliateDashboardData {
  affiliate: {
    id: string;
    code: string;
    name: string;
    email: string;
    commissionRate: number;
    clicks: number;
    conversions: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    isActive: boolean;
  };
  stats: {
    totalCommission: number;
    pendingCommission: number;
    conversionCount: number;
    clickCount: number;
    conversionRate: string;
  };
  referrals: Array<{
    id: string;
    orderNumber: string | null;
    customerName: string | null;
    amount: number;
    commission: number;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function AffiliatePage() {
  const [mode, setMode] = useState<"landing" | "apply" | "dashboard">("landing");
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "" });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<AffiliateDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  // Handle apply
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError("");
    setApplySuccess("");

    try {
      const res = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });

      const data = await res.json();
      if (data.success) {
        setApplySuccess(
          `Your affiliate code is: ${data.data.code}. Share your referral link to start earning!`
        );
        setAffiliateCode(data.data.code);
        // Auto-load dashboard
        loadDashboard(data.data.code);
      } else {
        setApplyError(data.error || "Failed to submit application");
      }
    } catch {
      setApplyError("Something went wrong. Please try again.");
    } finally {
      setApplyLoading(false);
    }
  };

  // Load dashboard
  const loadDashboard = async (code: string) => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const res = await fetch(`/api/affiliates/dashboard?code=${code}`);
      const data = await res.json();

      if (data.success) {
        setDashboardData(data.data);
        setMode("dashboard");
      } else {
        setDashboardError(data.error || "Failed to load dashboard");
      }
    } catch {
      setDashboardError("Failed to load dashboard. Please try again.");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Handle dashboard lookup
  const handleDashboardLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (affiliateCode.trim()) {
      loadDashboard(affiliateCode.trim().toUpperCase());
    }
  };

  // Copy referral link
  const copyReferralLink = () => {
    if (!dashboardData) return;
    const link = `${window.location.origin}?ref=${dashboardData.affiliate.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Landing Page View
  if (mode === "landing") {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="size-4" />
            Earn While You Refer
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Become an SL HUB Affiliate
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our referral program and earn commissions on every sale you bring in.
            Share your unique link with friends, family, and followers.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="size-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-1">Earn Commission</h3>
              <p className="text-sm text-muted-foreground">
                Earn up to 5% commission on every referred sale
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="size-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Track Referrals</h3>
              <p className="text-sm text-muted-foreground">
                Real-time dashboard to track clicks, conversions, and earnings
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Wallet className="size-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-1">Monthly Payouts</h3>
              <p className="text-sm text-muted-foreground">
                Get paid monthly via bank transfer, cash, or check
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                <Share2 className="size-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Easy Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral link anywhere - social media, messages, blogs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-1">Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  Fill out the application form and get your unique referral code (SLHUB-XXXXX)
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-1">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Share your referral link with friends, on social media, or anywhere online
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-1">Earn Commission</h4>
                <p className="text-sm text-muted-foreground">
                  When someone makes a purchase through your link, you earn a commission automatically
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Apply Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5 text-primary" />
                Become an Affiliate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                  <Input
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <Input
                    type="email"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    placeholder="07X XXXX XXX"
                  />
                </div>
                {applyError && (
                  <p className="text-sm text-destructive">{applyError}</p>
                )}
                {applySuccess && (
                  <p className="text-sm text-emerald-600">{applySuccess}</p>
                )}
                <Button type="submit" className="w-full gap-1.5" disabled={applyLoading}>
                  {applyLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Apply Now
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Already an Affiliate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="size-5 text-primary" />
                Already an Affiliate?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your affiliate code to access your dashboard, view your referral stats,
                and track your earnings.
              </p>
              <form onSubmit={handleDashboardLookup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Affiliate Code</label>
                  <Input
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    placeholder="SLHUB-XXXXX"
                    className="font-mono uppercase"
                  />
                </div>
                {dashboardError && (
                  <p className="text-sm text-destructive">{dashboardError}</p>
                )}
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full gap-1.5"
                  disabled={dashboardLoading || !affiliateCode.trim()}
                >
                  {dashboardLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <TrendingUp className="size-4" />
                  )}
                  View Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (mode === "dashboard" && dashboardData) {
    const { affiliate, stats, referrals, payments } = dashboardData;
    const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${affiliate.code}`;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="size-6" />
              Affiliate Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {affiliate.name}!
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setMode("landing")}>
            Back
          </Button>
        </div>

        {/* Referral Link Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="size-5 text-primary" />
              <h3 className="font-semibold">Your Referral Link</h3>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background px-3 py-2 rounded-lg text-sm border break-all">
                {referralLink}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyReferralLink}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this link with friends. When they make a purchase, you earn {affiliate.commissionRate}% commission!
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <MousePointerClick className="size-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.clickCount}</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="size-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.conversionCount}</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <DollarSign className="size-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{formatLKR(stats.pendingCommission)}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Wallet className="size-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{formatLKR(affiliate.paidEarnings)}</p>
              <p className="text-xs text-muted-foreground">Paid Out</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="font-semibold">{stats.conversionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min(parseFloat(stats.conversionRate), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No referrals yet. Share your link to get started!
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {referrals.slice(0, 10).map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-xs">{ref.orderNumber || "Order"}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(ref.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-xs">{formatLKR(ref.commission)}</p>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            ref.status === "pending" ? "border-amber-300 text-amber-600" :
                            ref.status === "approved" ? "border-blue-300 text-blue-600" :
                            ref.status === "paid" ? "border-emerald-300 text-emerald-600" :
                            "border-red-300 text-red-600"
                          }`}
                        >
                          {ref.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payments yet. Commissions will be paid monthly.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {payments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-xs">{formatLKR(pay.amount)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {pay.method} {pay.reference && `• ${pay.reference}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">{formatDate(pay.createdAt)}</p>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            pay.status === "completed" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600"
                          }`}
                        >
                          {pay.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state for dashboard
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
