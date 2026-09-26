import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNotice } from "@/components/FormNotice";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { base44 } from "@/api/base44Client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setSent(true);
    } catch (err) {
      // Deliberately stay vague: revealing which emails exist would leak accounts.
      console.warn("ForgotPassword: reset request failed", err);
      setError("We couldn't send that email right now. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      icon={sent ? CheckCircle2 : Mail}
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? "If that email has an account, a reset link is on its way"
          : "We'll email you a secure link to choose a new password"
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-5 text-center">
          <FormNotice
            tone="success"
            message={`If an account exists for ${email}, you'll get a reset link shortly. It expires in 60 minutes.`}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Send to a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormNotice message={error} />

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
            {pending ? (
              <>
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
