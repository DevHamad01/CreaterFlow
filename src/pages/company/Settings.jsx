import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Settings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setCompanyName(user.company_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName, company_name: companyName, phone });
      setSaved(true);
      toast({ title: "Settings saved" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Settings: save failed", err);
      toast({
        title: "We couldn't save your settings",
        description: err.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        icon={SettingsIcon}
        description="Manage your account and company profile"
      />

      <div className="surface-card space-y-5 p-6">
        <h2 className="font-semibold tracking-tight">Account</h2>

        <div className="space-y-1.5">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            value={user?.email || ""}
            readOnly
            disabled
            aria-describedby="settings-email-hint"
          />
          <p id="settings-email-hint" className="text-xs text-muted-foreground">
            Your sign-in email can't be changed here.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="settings-full-name">Full name</Label>
          <Input
            id="settings-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="settings-company">Company name</Label>
          <Input
            id="settings-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            autoComplete="organization"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="settings-phone">Phone</Label>
          <Input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            autoComplete="tel"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check aria-hidden="true" className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
            {saved ? "Your profile is up to date." : ""}
          </span>
        </div>
      </div>

      <div className="surface-card p-6">
        <h2 className="mb-4 font-semibold tracking-tight">Plan</h2>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/60 p-4">
          <div>
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
              Free plan
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Self-serve marketplace access</p>
          </div>
          <StatusBadge status="active" />
        </div>
      </div>
    </div>
  );
}
