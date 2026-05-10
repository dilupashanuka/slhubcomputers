// =============================================================================
// SL HUB COMPUTER - Admin 2FA Settings Page
// =============================================================================
// Purpose: Setup and manage Two-Factor Authentication for admin
// Features:
//   - Show QR code to scan with authenticator app
//   - Verify setup with test code
//   - Show backup codes (with "Copy All" and "Download" buttons)
//   - Enable/disable 2FA toggle
//   - Regenerate backup codes button
//   - Professional dark theme
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  KeyRound,
  Copy,
  Download,
  RefreshCw,
  Check,
  AlertTriangle,
  Loader2,
  QrCode,
  Eye,
  EyeOff,
} from "lucide-react";

interface TwoFactorData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  isEnabled: boolean;
  verifiedAt: string | null;
}

export default function Admin2FASettingsPage() {
  // 2FA state
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<TwoFactorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Fetch current 2FA status
  const fetch2FAStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/2fa/status");
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch2FAStatus();
  }, [fetch2FAStatus]);

  // Setup 2FA - generate secret and QR code
  async function handleSetup() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/auth/2fa/setup", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setSetupData(data.data);
        setShowBackupCodes(true);
        setSuccess("Scan the QR code with your authenticator app, then verify below.");
      } else {
        setError(data.error || "Failed to setup 2FA");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Verify and enable 2FA
  async function handleVerify() {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: verifyCode,
          action: "enable",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("2FA has been enabled successfully!");
        setSetupData(null);
        setVerifyCode("");
        await fetch2FAStatus();
      } else {
        setError(data.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Disable 2FA
  async function handleDisable() {
    if (!confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/auth/2fa/setup", {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("2FA has been disabled.");
        await fetch2FAStatus();
      } else {
        setError(data.error || "Failed to disable 2FA");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Regenerate backup codes
  async function handleRegenerateBackupCodes() {
    if (!confirm("This will invalidate all existing backup codes. Are you sure?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/auth/2fa/backup-codes", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setSetupData((prev) =>
          prev ? { ...prev, backupCodes: data.data.backupCodes } : prev
        );
        setShowBackupCodes(true);
        setSuccess("New backup codes generated. Save them in a secure location.");
      } else {
        setError(data.error || "Failed to regenerate backup codes");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Copy backup codes to clipboard
  async function copyBackupCodes() {
    if (!setupData?.backupCodes) return;
    const text = setupData.backupCodes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Backup codes copied to clipboard!");
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setSuccess("Backup codes copied to clipboard!");
    }
  }

  // Download backup codes as text file
  function downloadBackupCodes() {
    if (!setupData?.backupCodes) return;
    const text = [
      "SL HUB COMPUTER - Admin 2FA Backup Codes",
      "==========================================",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "IMPORTANT: Store these codes in a secure location.",
      "Each code can only be used once.",
      "",
      ...setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`),
      "",
      "If you lose your authenticator device,",
      "use one of these codes to sign in.",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slhub-2fa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Copy secret to clipboard
  async function copySecret() {
    if (!setupData?.secret) return;
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setSuccess("Secret key copied to clipboard!");
    } catch {
      // Fallback
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="size-6 text-primary" />
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage Two-Factor Authentication and security settings for your admin account
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          <Check className="size-4 shrink-0" />
          {success}
        </div>
      )}

      {/* 2FA Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status?.isEnabled ? "bg-emerald-500/10" : "bg-muted"}`}>
                {status?.isEnabled ? (
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldOff className="size-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your admin account
                </CardDescription>
              </div>
            </div>
            <Badge variant={status?.isEnabled ? "default" : "secondary"}>
              {status?.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {status?.isEnabled ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">2FA is active</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your account is protected with two-factor authentication.
                      {status.verifiedAt && (
                        <> Enabled on {new Date(status.verifiedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable}
                  disabled={loading}
                >
                  <ShieldOff className="size-3.5 mr-1.5" />
                  Disable 2FA
                </Button>
              </div>

              {/* Show regenerated backup codes */}
              {setupData?.backupCodes && showBackupCodes && (
                <BackupCodesDisplay
                  codes={setupData.backupCodes}
                  onCopy={copyBackupCodes}
                  onDownload={downloadBackupCodes}
                  onClose={() => setShowBackupCodes(false)}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">2FA is not enabled</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable two-factor authentication to protect your admin account from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>

              {!setupData ? (
                <Button onClick={handleSetup} disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin mr-1.5" />
                  ) : (
                    <Shield className="size-4 mr-1.5" />
                  )}
                  Setup 2FA
                </Button>
              ) : (
                <div className="space-y-6">
                  <Separator />

                  {/* Step 1: QR Code */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </div>
                      <h3 className="font-semibold">Scan QR Code</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>

                    {/* QR Code placeholder - since we can't generate actual QR images server-side,
                        we provide the manual entry key */}
                    <div className="flex flex-col items-center gap-4 pl-8">
                      <div className="p-4 bg-white rounded-xl border">
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-center space-y-2">
                            <QrCode className="size-12 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-500 font-medium">
                              QR Code
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Manual entry */}
                      <div className="w-full space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Manual Entry Key
                        </Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                            {showSecret ? setupData.secret : "••••••••••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSecret(!showSecret)}
                            title={showSecret ? "Hide secret" : "Show secret"}
                          >
                            {showSecret ? (
                              <EyeOff className="size-3.5" />
                            ) : (
                              <Eye className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={copySecret}
                            title="Copy secret"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Authenticator URL for QR generation */}
                      <p className="text-[11px] text-muted-foreground text-center">
                        QR code URL (for authenticator apps):<br />
                        <code className="text-[10px] break-all">{setupData.qrCodeUrl}</code>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Step 2: Backup Codes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </div>
                      <h3 className="font-semibold">Save Backup Codes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">
                      Save these backup codes in a secure location. Each code can only be used once.
                    </p>

                    <div className="pl-8">
                      <BackupCodesDisplay
                        codes={setupData.backupCodes}
                        onCopy={copyBackupCodes}
                        onDownload={downloadBackupCodes}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Step 3: Verify */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </div>
                      <h3 className="font-semibold">Verify Setup</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">
                      Enter the 6-digit code from your authenticator app to verify and enable 2FA
                    </p>

                    <div className="pl-8 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="000000"
                          value={verifyCode}
                          onChange={(e) => {
                            setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                            if (error) setError("");
                          }}
                          className="w-40 h-12 text-center text-xl tracking-[0.5em] font-mono"
                        />
                        <Button
                          onClick={handleVerify}
                          disabled={loading || verifyCode.length !== 6}
                        >
                          {loading ? (
                            <Loader2 className="size-4 animate-spin mr-1.5" />
                          ) : (
                            <ShieldCheck className="size-4 mr-1.5" />
                          )}
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cancel */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSetupData(null);
                        setVerifyCode("");
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Cancel Setup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="size-5 text-primary" />
            How 2FA Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <KeyRound className="size-4 text-primary" />
                </div>
                <h4 className="font-medium text-sm">Password</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                First, enter your username and password as usual.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Smartphone className="size-4 text-primary" />
                </div>
                <h4 className="font-medium text-sm">Authenticator</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Then, enter the 6-digit code from your authenticator app.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <ShieldCheck className="size-4 text-primary" />
                </div>
                <h4 className="font-medium text-sm">Secure Access</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Your account is protected even if your password is compromised.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Backup Codes Display Component
// ---------------------------------------------------------------------------
function BackupCodesDisplay({
  codes,
  onCopy,
  onDownload,
  onClose,
}: {
  codes: string[];
  onCopy: () => void;
  onDownload: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border">
        {codes.map((code, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 bg-background rounded border font-mono text-sm"
          >
            <span className="text-muted-foreground text-xs w-4">{index + 1}.</span>
            <span>{code}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="size-3.5 mr-1.5" />
          Copy All
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="size-3.5 mr-1.5" />
          Download
        </Button>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hide Codes
          </Button>
        )}
      </div>

      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
        <AlertTriangle className="size-3" />
        Store these codes securely. Each code can only be used once.
      </p>
    </div>
  );
}
