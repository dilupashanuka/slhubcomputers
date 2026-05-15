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
//   - 2FA verification step after password login
//   - Backup code option
// =============================================================================

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Monitor,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Smartphone,
  Copy,
} from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/admin";

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    console.log("Attempting login for:", username);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Login response status:", res.status);

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      const data = await res.json();
      console.log("Login response data:", data);

      if (data.success) {
        if (data.requires2FA) {
          // 2FA is required - show verification step
          setPendingToken(data.pendingToken);
          setRequires2FA(true);
        } else {
          // No 2FA - redirect to admin dashboard
          console.log("Login successful, redirecting to:", redirectPath);
          router.push(redirectPath);
        }
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login submission error:", err);
      setError(
        err.message?.includes("non-JSON") 
          ? `Server Error: ${err.message}`
          : "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handle2FAVerify(e: FormEvent) {
    e.preventDefault();
    setError("");

    const code = useBackupCode ? backupCode.trim() : twoFACode.trim();

    if (!code) {
      setError(useBackupCode ? "Please enter your backup code" : "Please enter the 6-digit code");
      return;
    }

    if (!useBackupCode && code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: useBackupCode ? undefined : code,
          backupCode: useBackupCode ? code : undefined,
          pendingToken,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(redirectPath);
      } else {
        setError(data.error || "Verification failed. Please try again.");
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
            {!requires2FA ? (
              <>
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
              </>
            ) : (
              <>
                {/* 2FA Verification */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                  <KeyRound className="size-4 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    Two-Factor Authentication
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
                    <Smartphone className="size-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {useBackupCode
                      ? "Enter one of your backup codes to sign in"
                      : "Enter the 6-digit code from your authenticator app"}
                  </p>
                </div>

                <form onSubmit={handle2FAVerify} className="space-y-4">
                  {!useBackupCode ? (
                    <div className="space-y-2">
                      <Label htmlFor="2fa-code" className="text-sm font-medium">
                        Authentication Code
                      </Label>
                      <Input
                        id="2fa-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="000000"
                        value={twoFACode}
                        onChange={(e) => {
                          setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          if (error) setError("");
                        }}
                        disabled={loading}
                        autoComplete="one-time-code"
                        className="h-12 text-center text-xl tracking-[0.5em] font-mono"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="backup-code" className="text-sm font-medium">
                        Backup Code
                      </Label>
                      <Input
                        id="backup-code"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={backupCode}
                        onChange={(e) => {
                          setBackupCode(e.target.value.toUpperCase());
                          if (error) setError("");
                        }}
                        disabled={loading}
                        className="h-12 text-center text-lg tracking-wider font-mono"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        Verify & Sign In
                      </>
                    )}
                  </Button>

                  {/* Toggle backup code */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setError("");
                      setTwoFACode("");
                      setBackupCode("");
                    }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {useBackupCode ? (
                      <>
                        <KeyRound className="size-3.5 inline mr-1.5" />
                        Use authenticator code instead
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 inline mr-1.5" />
                        Use a backup code instead
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

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
