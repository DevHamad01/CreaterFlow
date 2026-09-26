import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNotice } from "@/components/FormNotice";
import { Lock, Loader2, AlertTriangle, ArrowRight, KeyRound } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { base44 } from "@/api/base44Client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login?password=reset";
    } catch (err) {
      setError(
        /expired|invalid/i.test(err?.message || "")
          ? "This reset link has expired. Request a new one and try again."
          : err?.message || "We couldn't reset your password. Please try again."
      );
    } finally {
      setPending(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Invalid reset link"
        subtitle="This password reset link is missing or incomplete"
        footer={
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Request a new link
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The link you followed appears to be cut off. Reset links expire after 60 minutes —
            request a fresh one and you'll be back in a minute.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={KeyRound}
      title="Choose a new password"
      subtitle="Then you can log in with it right away"
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <FormNotice message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
