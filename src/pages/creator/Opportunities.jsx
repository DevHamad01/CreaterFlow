import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import { FitScore } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Megaphone, Check, Loader2, AlertTriangle, RefreshCw, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { preferLive, hasContent, scopedToCreator } from "@/lib/seeded";
import {
  campaignCreators as seedCampaignCreators,
  campaigns as seedCampaigns,
  DEMO_CREATOR_NAME,
} from "@/data/app";
import { creators as sampleCreators } from "@/data/creators";

export default function Opportunities() {
  const { user } = useAuth();
  // This page lists open work, so the seed is the open slice of the campaigns.
  const [campaigns, setCampaigns] = useState(() =>
    seedCampaigns.filter((c) => c.status === "recruiting" || c.status === "active")
  );
  const [myCollabs, setMyCollabs] = useState(() =>
    seedCampaignCreators.filter((c) => c.creator_name === DEMO_CREATOR_NAME)
  );
  const [myProfile, setMyProfile] = useState(
    () => sampleCreators.find((c) => c.name === DEMO_CREATOR_NAME) || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      base44.entities.Campaign.filter({ status: "recruiting" }, "-created_date", 20),
      base44.entities.Campaign.filter({ status: "active" }, "-created_date", 20),
      base44.entities.CampaignCreator.list(),
      base44.entities.Creator.list(),
    ])
      .then(([recruiting, active, myCc, allCreators]) => {
        // A campaign can be returned by both queries if its status flipped
        // between them; de-duplicate so React keys stay unique.
        const byId = new Map();
        [...(recruiting || []), ...(active || [])].forEach((c) => byId.set(c.id, c));
        setCampaigns(
          preferLive(
            seedCampaigns.filter((c) => c.status === "recruiting" || c.status === "active")
          )([...byId.values()])
        );
        const creatorName = user.full_name || "";
        setMyCollabs(
          scopedToCreator(
            (myCc || []).filter((cc) => cc.creator_name === creatorName),
            seedCampaignCreators,
            creatorName,
            DEMO_CREATOR_NAME
          )
        );
        setMyProfile(
          (allCreators || []).find((c) => c.name === creatorName) ||
            sampleCreators.find((c) => c.name === DEMO_CREATOR_NAME) ||
            null
        );
      })
      .catch((err) => {
        console.error("Opportunities: load failed", err);
        setError("We couldn't load opportunities. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const hasApplied = (campaignId) => myCollabs.some((cc) => cc.campaign_id === campaignId);

  const available = useMemo(
    () => campaigns.filter((c) => !hasApplied(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaigns, myCollabs]
  );

  // Keep the illustrative fit score stable per campaign instead of reshuffling
  // it on every re-render.
  const fitScores = useMemo(() => {
    const scores = {};
    available.forEach((c) => {
      scores[c.id] = 80 + Math.floor(Math.random() * 18);
    });
    return scores;
  }, [available]);

  const acceptOpportunity = async (campaign) => {
    setActing(campaign.id);
    try {
      const fitScore = myProfile
        ? Math.min(98, Math.floor(70 + (myProfile.engagement_rate || 3) * 4 + (myProfile.rating || 4.5) * 2))
        : Math.floor(75 + Math.random() * 25);
      await base44.entities.CampaignCreator.create({
        campaign_id: campaign.id,
        creator_id: myProfile?.id || "",
        creator_name: user?.full_name || "Creator",
        creator_avatar: myProfile?.avatar_url,
        creator_niche: myProfile?.niche || "AI & SaaS",
        creator_followers: myProfile?.linkedin_followers || 15000,
        fit_score: fitScore,
        price: myProfile?.price_per_post || 800,
        status: "accepted",
        tracking_link: `${campaign.tracking_base_url}/${user?.full_name?.toLowerCase().replace(/\s+/g, "-")}`,
        accepted_date: new Date().toISOString().split("T")[0],
      });
      const myCc = await base44.entities.CampaignCreator.list();
      const creatorName = user?.full_name || "";
      setMyCollabs((myCc || []).filter((cc) => cc.creator_name === creatorName));
      toast({ title: "Deal accepted", description: campaign.name });
    } catch (err) {
      console.error("Opportunities: accept failed", err);
      toast({
        title: "We couldn't accept this deal",
        description: err.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading opportunities</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error && !hasContent(campaigns)) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load opportunities"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        icon={Megaphone}
        description="Brand campaigns looking for creators like you"
      />

      {error && (
        <p
          role="status"
          className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/5 px-3 py-1 text-xs text-warning"
        >
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
          Showing sample opportunities — {error}
          <button
            type="button"
            onClick={load}
            className="rounded font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      {!user?.full_name ? (
        <div className="surface-card">
          <EmptyState
            icon={UserRound}
            title="Add your name to get matched"
            description="Opportunities are matched to your profile name, so brands know who they're working with. Add it once to start accepting deals."
            action={
              <Button asChild>
                <a href="/app/profile">Complete your profile</a>
              </Button>
            }
          />
        </div>
      ) : available.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="campaign"
              title="No opportunities available"
            description="New brand campaigns will appear here when they start recruiting creators."
          />
        </div>
      ) : (
        <Stagger as="ul" className="space-y-4" stagger={0.05}>
          {available.map((c) => (
            <StaggerItem key={c.id} as="li" className="surface-card p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold tracking-tight">{c.name}</h3>
                    <FitScore score={fitScores[c.id]} />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{c.company_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold tabular-nums">
                    €{myProfile?.price_per_post || 800}
                  </p>
                  <p className="text-xs text-muted-foreground">per post</p>
                </div>
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{c.objective}</p>

              <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {c.target_audience && <span>Target: {c.target_audience}</span>}
                {c.start_date && <span>Starts: {c.start_date}</span>}
                {c.budget ? <span>Budget: €{c.budget.toLocaleString()}</span> : null}
              </div>

              <div className="flex items-center gap-2 border-t border-border/70 pt-3">
                <Button onClick={() => acceptOpportunity(c)} disabled={acting === c.id}>
                  {acting === c.id ? (
                    <>
                      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Check aria-hidden="true" className="h-4 w-4" />
                      Accept deal
                    </>
                  )}
                </Button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
