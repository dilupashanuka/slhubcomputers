// =============================================================================
// SL HUB COMPUTER - Admin Login Page
// =============================================================================
// Purpose: Professional dark-themed login page with SL HUB branding
// Features:
//   - Centered card with SL HUB COMPUTER branding
//   - Username and password input fields
//   - Login button with loading spinner state
//   - Error message display with animation
//   - Emerald/green accent matching admin theme
//   - Responsive design for all screen sizes
//   - Keyboard shortcut (Enter) to submit
// =============================================================================

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Monitor, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Successful login - redirect to intended page or admin dashboard
        router.push(redirectPath);
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Store link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" />
          Back to Store
        </Link>

        {/* Login Card */}
        <Card className="border-border/50 shadow-2xl shadow-black/20 dark:shadow-black/40 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
                SL
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">SL HUB COMPUTER</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Admin Panel</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted/50 mb-6">
              <ShieldCheck className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Secure Admin Access
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  autoComplete="username"
                  className="h-10"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-10 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Monitor className="size-4" />
                    Sign In to Admin
                  </>
                )}
              </Button>
            </form>

            {/* Footer info */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-[11px] text-muted-foreground">
                SL HUB COMPUTER &middot; Deiyandara, Sri Lanka
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hotline: 071 067 8944
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 animate-pulse">
            SL
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
