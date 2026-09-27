import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authActions, db } from "@/api/base44Client";
import { doc, setDoc } from "firebase/firestore";
import { safeReturnTo, returnToParam } from "@/lib/returnTo";
import { friendlyAuthError, isCancelledAuthError } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNotice, AuthDivider } from "@/components/FormNotice";
import { UserPlus, Mail, Lock, Loader2, Building2, PenSquare, Check } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = [
  {
    value: "company",
    label: "Company",
    hint: "Find & hire creators",
    icon: Building2,
  },
  {
    value: "creator",
    label: "Creator",
    hint: "Get paid to post",
    icon: PenSquare,
  },
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [userType, setUserType] = useState("company");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();

  const returnTo = safeReturnTo();

  const persistProfile = async (user) => {
    await authActions.setDisplayName(user, fullName);
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      user_type: userType,
      full_name: fullName,
      company_name: userType === "company" ? companyName : "",
      created_at: new Date(),
      updated_at: new Date(),
    });
  };

  const validate = () => {
    if (!fullName.trim()) return "Please tell us your name.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    setPending("email");
    try {
      const userCredential = await authActions.createAccount(email, password);
      await persistProfile(userCredential.user);
      navigate(returnTo);
    } catch (err) {
      setError(friendlyAuthError(err, "Registration failed"));
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setPending("google");
    try {
      const result = await authActions.signInWithGoogle();
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        user_type: userType,
        full_name: fullName || user.displayName || "",
        company_name: userType === "company" ? companyName : "",
        created_at: new Date(),
        updated_at: new Date(),
      });
      navigate(returnTo);
    } catch (err) {
      if (!isCancelledAuthError(err)) {
        setError(friendlyAuthError(err, "Google sign-up failed"));
      }
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Start running creator campaigns in minutes"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/login${returnToParam(returnTo)}`}
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={busy}
        aria-busy={pending === "google"}
      >
        {pending === "google" ? (
          <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-5 w-5" />
        )}
        {pending === "google" ? "Connecting…" : "Continue with Google"}
      </Button>

      <AuthDivider />

      <FormNotice message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold leading-none">I am a…</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACCOUNT_TYPES.map(({ value, label, hint, icon: Icon }) => {
              const active = userType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUserType(value)}
                  aria-pressed={active}
                  className={cn(
                        "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-smooth",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/25"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <Icon
                      aria-hidden="true"
                      className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")}
                    />
                    {active && (
                      <span
                        aria-hidden="true"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={4} />
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold tracking-tight">{label}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="fullname">Full name</Label>
          <Input
            id="fullname"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {userType === "company" && (
          <div className="space-y-2">
            <Label htmlFor="company">
              Company name <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="company"
              name="organization"
              type="text"
              autoComplete="organization"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
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
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={busy} aria-busy={pending === "email"}>
          {pending === "email" ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to keep your content authentic and only accept
          campaigns you choose.
        </p>
      </form>
    </AuthLayout>
  );
}
