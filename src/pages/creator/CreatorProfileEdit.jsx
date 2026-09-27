import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, BadgeCheck, UserRound, AlertTriangle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NICHES = [
  "AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering",
  "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation",
  "Data & Analytics", "Cybersecurity",
];

const AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "booked", label: "Booked" },
];

export default function CreatorProfileEdit() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const uid = useId();

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // Try to find existing creator profile by name
    base44.entities.Creator.filter({ name: user.full_name })
      .then((creators) => {
        if (creators.length > 0) {
          setProfile(creators[0]);
        } else {
          // Create a new profile
          setProfile({
            name: user.full_name || "",
            headline: "",
            bio: "",
            niche: "AI & SaaS",
            sub_niches: [],
            country: "",
            city: "",
            linkedin_followers: 0,
            engagement_rate: 0,
            audience_type: "",
            audience_industries: [],
            audience_geography: [],
            price_per_post: 500,
            availability: "available",
            rating: 5,
            reviews_count: 0,
            avg_impressions: 0,
            avg_clicks: 0,
            avg_leads: 0,
            languages: ["English"],
            verified: false,
            total_campaigns: 0,
          });
        }
      })
      .catch((err) => {
        console.error("CreatorProfileEdit: load failed", err);
        setError("We couldn't load your profile. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile.id) {
        await base44.entities.Creator.update(profile.id, profile);
      } else {
        await base44.entities.Creator.create(profile);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Profile saved", description: "Brands will see your latest details." });
    } catch (err) {
      console.error("CreatorProfileEdit: save failed", err);
      toast({
        title: "Failed to save",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your profile</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your profile"
          description={error}
          action={
            <Button onClick={load}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8">
        <EmptyState
          icon={UserRound}
          title="Sign in to edit your profile"
          description="Add your name and audience details so brands can find you in the marketplace."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="My profile"
        icon={UserRound}
        description="This is how brands see you in the marketplace"
      />

      {/* Profile preview */}
        <div className="rounded-2xl border border-border bg-primary/[0.03] p-5">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=2563eb`}
            alt=""
            className="h-16 w-16 rounded-2xl bg-muted object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-semibold tracking-tight">{profile.name || "Your name"}</h2>
              {profile.verified && (
                <BadgeCheck aria-label="Verified creator" className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">{profile.headline || "Add a headline"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.niche} · €{profile.price_per_post}/post
            </p>
          </div>
        </div>
      </div>

      <section className="surface-card space-y-4 p-6" aria-labelledby={`${uid}-details`}>
        <h2 id={`${uid}-details`} className="font-semibold tracking-tight">Profile information</h2>

        <div>
          <Label htmlFor={`${uid}-headline`}>Headline</Label>
          <Input
            id={`${uid}-headline`}
            value={profile.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="B2B & AI Creator · Sales workflows"
          />
        </div>

        <div>
          <Label htmlFor={`${uid}-bio`}>Bio</Label>
          <Textarea
            id={`${uid}-bio`}
            rows={3}
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell brands about your content and audience..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${uid}-niche`}>Niche</Label>
            <Select value={profile.niche} onValueChange={(v) => update("niche", v)}>
              <SelectTrigger id={`${uid}-niche`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`${uid}-price`}>Price per post (€)</Label>
            <Input
              id={`${uid}-price`}
              type="number"
              min={0}
              value={profile.price_per_post}
              onChange={(e) => update("price_per_post", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${uid}-country`}>Country</Label>
            <Input
              id={`${uid}-country`}
              value={profile.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="France"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-city`}>City</Label>
            <Input
              id={`${uid}-city`}
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Paris"
            />
          </div>
        </div>
      </section>

      <section className="surface-card space-y-4 p-6" aria-labelledby={`${uid}-audience`}>
        <h2 id={`${uid}-audience`} className="font-semibold tracking-tight">Audience</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${uid}-followers`}>LinkedIn followers</Label>
            <Input
              id={`${uid}-followers`}
              type="number"
              min={0}
              value={profile.linkedin_followers}
              onChange={(e) => update("linkedin_followers", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-engagement`}>Engagement rate (%)</Label>
            <Input
              id={`${uid}-engagement`}
              type="number"
              step="0.1"
              min={0}
              value={profile.engagement_rate}
              onChange={(e) => update("engagement_rate", Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`${uid}-audience-type`}>Audience type</Label>
          <Input
            id={`${uid}-audience-type`}
            value={profile.audience_type}
            onChange={(e) => update("audience_type", e.target.value)}
            placeholder="Founders & Sales Leaders"
          />
        </div>

        <div>
          <Label htmlFor={`${uid}-availability`}>Availability</Label>
          <Select
            value={profile.availability}
            onValueChange={(v) => update("availability", v)}
          >
            <SelectTrigger id={`${uid}-availability`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY.map((a) => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

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
              Saved!
            </>
          ) : (
            "Save profile"
          )}
        </Button>
        <span className="sr-only" role="status" aria-live="polite">
          {saving ? "Saving your profile" : saved ? "Profile saved" : ""}
        </span>
      </div>
    </div>
  );
}
