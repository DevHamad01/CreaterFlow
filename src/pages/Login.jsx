import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authActions } from "@/api/base44Client";
import { safeReturnTo } from "@/lib/returnTo";
import { friendlyAuthError, isCancelledAuthError } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNotice, AuthDivider } from "@/components/FormNotice";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pendingProvider, setPendingProvider] = useState(null);
  const navigate = useNavigate();

  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPendingProvider("email");
    try {
      await authActions.signInWithEmail(email, password);
      navigate(returnTo);
    } catch (err) {
      setError(friendlyAuthError(err, "Invalid email or password"));
    } finally {
      setPendingProvider(null);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setPendingProvider("google");
    try {
      await authActions.signInWithGoogle();
      navigate(returnTo);
    } catch (err) {
      if (!isCancelledAuthError(err)) {
        setError(friendlyAuthError(err, "Google sign-in failed"));
      }
    } finally {
      setPendingProvider(null);
    }
  };

  const busy = pendingProvider !== null;

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={busy}
        aria-busy={pendingProvider === "google"}
      >
        {pendingProvider === "google" ? (
          <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-5 w-5" />
        )}
        {pendingProvider === "google" ? "Connecting…" : "Continue with Google"}
      </Button>

      <AuthDivider />

      <FormNotice message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              name="email"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={busy}
          aria-busy={pendingProvider === "email"}
        >
          {pendingProvider === "email" ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
