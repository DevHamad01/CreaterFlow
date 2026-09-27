import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  MapPin, BadgeCheck, Star, TrendingUp, MousePointerClick,
  Target, ArrowLeft, Heart, Award, UserX, AlertTriangle, RefreshCw, Rocket
} from "lucide-react";

const formatNum = (n) => {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
};

const AVAILABILITY = {
  available: {
    label: "Available",
    dot: "bg-success",
    text: "text-success",
    note: "Ready to take on new campaigns",
  },
  limited: {
    label: "Limited",
    dot: "bg-warning",
    text: "text-warning",
    note: "Few slots remaining this month",
  },
  booked: {
    label: "Fully booked",
    dot: "bg-danger",
    text: "text-danger",
    note: "Fully booked this month",
  },
};

function DetailSkeleton() {
  return (
    <div className="container-page pb-16 pt-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading creator profile</span>
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="surface-card-strong mb-6 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Skeleton className="h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="w-full space-y-3 sm:w-44">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-card p-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-11/12" />
              <Skeleton className="mt-2 h-3 w-8/12" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="surface-card p-6">
              <Skeleton className="mb-5 h-5 w-32" />
              <div className="space-y-3">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  );
}

export default function CreatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const loadCreator = useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    base44.entities.Creator.get(id)
      .then((data) => {
        if (data) setCreator(data);
        else setNotFound(true);
      })
      .catch((err) => {
        console.error("CreatorDetail: load failed", err);
        setError(
          "We couldn't reach the marketplace. The profile may have been removed, or the connection dropped."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    base44.entities.Favorite.filter({ created_by_id: user.id, creator_id: id })
      .then((favs) => setSaved((favs || []).length > 0))
      .catch(() => {});
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!creator) return;

    const wasSaved = saved;
    setPendingSave(true);
    try {
      if (wasSaved) {
        const favs = await base44.entities.Favorite.filter({
          created_by_id: user.id,
          creator_id: id,
        });
        if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
        setSaved(false);
        toast({ title: "Removed from saved", description: creator.name });
      } else {
        await base44.entities.Favorite.create({
          creator_id: id,
          creator_name: creator.name,
          creator_avatar: creator.avatar_url,
          creator_niche: creator.niche,
          creator_headline: creator.headline,
          creator_followers: creator.linkedin_followers,
          creator_price: creator.price_per_post,
        });
        setSaved(true);
        toast({ title: "Saved to your shortlist", description: creator.name });
      }
    } catch (err) {
      console.error("CreatorDetail: save toggle failed", err);
      toast({
        title: "Couldn't update your shortlist",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingSave(false);
    }
  };

  const startCampaign = () => {
    if (user) navigate("/app/campaigns/new");
    else navigate("/signup");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />

      {loading ? (
        <DetailSkeleton />
      ) : error ? (
        <div className="container-page flex-1 py-16">
          <div
            role="alert"
            className="surface-card mx-auto max-w-lg p-8 text-center ring-danger/20"
          >
            <EmptyState
              icon={AlertTriangle}
              title="We couldn't load this profile"
              description={error}
              action={
                <>
                  <Button onClick={loadCreator}>
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Try again
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/marketplace")}>
                    Back to marketplace
                  </Button>
                </>
              }
            />
          </div>
        </div>
      ) : notFound || !creator ? (
        <div className="container-page flex-1 py-16">
          <div className="surface-card mx-auto max-w-lg p-8">
            <EmptyState
              icon={UserX}
              size="lg"
              title="Creator not found"
              description="This profile may have been removed or the link is incorrect. Browse the marketplace to find creators in the same niche."
              action={
                <>
                  <Button onClick={() => navigate("/marketplace")}>
                    Browse the marketplace
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/for-companies")}>
                    How it works
                  </Button>
                </>
              }
            />
          </div>
        </div>
      ) : (
        <main className="flex-1 pb-16">
          <div className="container-page pt-6">
            <Link
              to="/marketplace"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to marketplace
            </Link>

            {/* Header card */}
            <header className="surface-card-strong mb-6 overflow-hidden">
                <div className="h-1 bg-primary" aria-hidden="true" />
              <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start">
                <img
                  src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(creator.name || "creator")}&backgroundColor=2563eb,0ea5e9,6366f1`}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-2xl border border-border/60 bg-muted object-cover shadow-xs sm:h-24 sm:w-24"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{creator.name}</h1>
                    {creator.verified && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <BadgeCheck aria-hidden="true" className="h-5 w-5" />
                        <span className="sr-only">Verified creator</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{creator.headline}</p>

                  <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {(creator.city || creator.country) && (
                      <li className="flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        {[creator.city, creator.country].filter(Boolean).join(", ")}
                      </li>
                    )}
                    {creator.rating != null && (
                      <li className="flex items-center gap-1.5">
                        <Star aria-hidden="true" className="h-3.5 w-3.5 text-warning" fill="currentColor" />
                        <span className="font-medium text-foreground">{creator.rating}</span>
                        {creator.reviews_count != null && <span>({creator.reviews_count} reviews)</span>}
                      </li>
                    )}
                    {creator.total_campaigns != null && (
                      <li className="flex items-center gap-1.5">
                        <Award aria-hidden="true" className="h-3.5 w-3.5" />
                        {creator.total_campaigns} campaigns
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-56">
                  <div className="surface-card p-4 text-center">
                    <p className="font-display text-2xl font-semibold tracking-tight">
                      €{creator.price_per_post ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">per sponsored post</p>
                  </div>
                  <Button onClick={toggleSave} disabled={pendingSave} aria-busy={pendingSave} className="w-full">
                    <Heart
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill={saved ? "currentColor" : "none"}
                    />
                    {pendingSave ? "Saving…" : saved ? "Saved" : "Save"}
                  </Button>
                  <Button onClick={startCampaign} className="w-full">
                    <Rocket aria-hidden="true" className="h-4 w-4" />
                    Start campaign
                  </Button>
                </div>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: bio & performance */}
              <div className="space-y-6 lg:col-span-2">
                <section className="surface-card p-6">
                  <h2 className="tracking-tight">About</h2>
                  {creator.bio ? (
                    <p className="mt-3 leading-relaxed text-muted-foreground">{creator.bio}</p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      This creator hasn't added a bio yet.
                    </p>
                  )}
                </section>

                <section className="surface-card p-6">
                  <h2 className="tracking-tight">Average performance per post</h2>
                  <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { icon: TrendingUp, tone: "text-primary", label: "Impressions", value: formatNum(creator.avg_impressions) },
                      { icon: MousePointerClick, tone: "text-success", label: "Clicks", value: formatNum(creator.avg_clicks) },
                      { icon: Target, tone: "text-iris", label: "Leads", value: formatNum(creator.avg_leads) },
                    ].map(({ icon: Icon, tone, label, value }) => (
                      <li key={label} className="rounded-xl bg-muted/70 p-5 text-center">
                        <span
                          className="mx-auto mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card ring-1 ring-inset ring-border/60"
                        >
                          <Icon aria-hidden="true" className={`h-5 w-5 ${tone}`} />
                        </span>
                        <p className="font-display text-xl font-semibold tracking-tight">{value}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                {creator.sub_niches?.length > 0 && (
                  <section className="surface-card p-6">
                    <h2 className="tracking-tight">Sub-niches &amp; expertise</h2>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {creator.sub_niches.map((s) => (
                        <li
                          key={s}
                          className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Right: audience info */}
              <aside className="space-y-6">
                <section className="surface-card p-6">
                  <h2 className="tracking-tight">Audience</h2>
                  <dl className="mt-5 space-y-4">
                    <DetailRow label="Audience type">{creator.audience_type || "—"}</DetailRow>
                    <DetailRow label="Followers">
                      {formatNum(creator.linkedin_followers)} on LinkedIn
                    </DetailRow>
                    <DetailRow label="Engagement rate">
                      {creator.engagement_rate != null ? `${creator.engagement_rate}%` : "—"}
                    </DetailRow>

                    {creator.audience_industries?.length > 0 && (
                      <div>
                        <dt className="eyebrow">Audience industries</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {creator.audience_industries.map((ind) => (
                            <span
                              key={ind}
                              className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                            >
                              {ind}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {creator.audience_geography?.length > 0 && (
                      <div>
                        <dt className="eyebrow">Geography</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {creator.audience_geography.map((geo) => (
                            <span
                              key={geo}
                              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {geo}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {creator.languages?.length > 0 && (
                      <div>
                        <dt className="eyebrow">Languages</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {creator.languages.map((lang) => (
                            <span
                              key={lang}
                              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {lang}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                <section className="surface-card p-6">
                  <h2 className="tracking-tight">Availability</h2>
                  {(() => {
                    const meta = AVAILABILITY[creator.availability] || {
                      label: creator.availability
                        ? creator.availability.charAt(0).toUpperCase() + creator.availability.slice(1)
                        : "Unknown",
                      dot: "bg-muted-foreground",
                      text: "text-muted-foreground",
                      note: "Availability hasn't been updated yet.",
                    };
                    return (
                      <>
                        <p className="mt-4 flex items-center gap-2">
                          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                          <span className={`text-sm font-semibold capitalize ${meta.text}`}>
                            {meta.label}
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">{meta.note}</p>
                      </>
                    );
                  })()}
                </section>
              </aside>
            </div>
          </div>
        </main>
      )}

      <PublicFooter />
    </div>
  );
}
