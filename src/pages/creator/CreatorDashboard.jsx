import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Wallet, TrendingUp, PenSquare, MessageSquare, AlertTriangle, RefreshCw, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { preferLive, hasContent, scopedToCreator } from "@/lib/seeded";
import {
  campaignCreators as seedCampaignCreators,
  campaigns as seedCampaigns,
  posts as seedPosts,
  payments as seedPayments,
  DEMO_CREATOR_NAME,
} from "@/data/app";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaignCreators, setCampaignCreators] = useState(() =>
    seedCampaignCreators.filter((c) => c.creator_name === DEMO_CREATOR_NAME)
  );
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [posts, setPosts] = useState(() =>
    seedPosts.filter((row) => row.creator_name === DEMO_CREATOR_NAME)
  );
  const [payments, setPayments] = useState(() =>
    seedPayments.filter((row) => row.creator_name === DEMO_CREATOR_NAME)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      base44.entities.CampaignCreator.list("-created_date", 50),
      base44.entities.Campaign.list("-created_date", 50),
      base44.entities.Post.list("-created_date", 50),
      base44.entities.Payment.list("-created_date", 50),
    ])
      .then(([cc, camps, p, pay]) => {
        const creatorName = user.full_name || "";
        setCampaignCreators(
          scopedToCreator(
            (cc || []).filter((c) => c.creator_name === creatorName),
            seedCampaignCreators,
            creatorName,
            DEMO_CREATOR_NAME
          )
        );
        setCampaigns(preferLive(seedCampaigns)(camps));
        setPosts(
          scopedToCreator(
            (p || []).filter((row) => row.creator_name === creatorName),
            seedPosts,
            creatorName,
            DEMO_CREATOR_NAME
          )
        );
        setPayments(
          scopedToCreator(
            (pay || []).filter((row) => row.creator_name === creatorName),
            seedPayments,
            creatorName,
            DEMO_CREATOR_NAME
          )
        );
      })
      .catch((err) => {
        console.error("CreatorDashboard: load failed", err);
        setError("We couldn't load your dashboard. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your dashboard</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !hasContent(campaigns, campaignCreators, posts, payments)) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your dashboard"
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

  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Your creator dashboard"}
        description="Track your deals, drafts, and earnings in one place."
      />

      {error && (
        <p
          role="status"
          className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/5 px-3 py-1 text-xs text-warning"
        >
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
          Showing sample work — {error}
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
            title="Add your name to see your work"
            description="Your dashboard matches campaigns, drafts, and payments to your profile name. Add it once and everything here fills in."
            action={
              <Button asChild>
                <Link to="/app/profile">Complete your profile</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.05}>
            <StatCard
              label="Active deals"
              value={campaignCreators.filter((cc) =>
                ["invited", "accepted", "draft_submitted", "in_review", "approved", "scheduled", "live"].includes(cc.status)
              ).length}
              icon={Megaphone}
              accent="primary"
            />
            <StatCard
              label="Total earned"
              value={`€${payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0).toLocaleString()}`}
              icon={Wallet}
              accent="success"
            />
            <StatCard
              label="Pending"
              value={`€${payments
                .filter((p) => p.status === "pending" || p.status === "scheduled")
                .reduce((s, p) => s + p.amount, 0)
                .toLocaleString()}`}
              icon={TrendingUp}
              accent="warning"
            />
            <StatCard
              label="Drafts to review"
              value={posts.filter((p) => p.status === "submitted" || p.status === "in_review").length}
              icon={MessageSquare}
              accent="iris"
            />
          </Stagger>

          <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
            <StaggerItem className="surface-card card-lift">
              <Link
                to="/app/opportunities"
                className="block rounded-2xl p-5 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <Megaphone className="h-5 w-5" />
                </span>
                <h3 className="font-semibold tracking-tight transition-colors group-hover:text-primary">
                  Find opportunities
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse brand campaigns looking for creators
                </p>
              </Link>
            </StaggerItem>
            <StaggerItem className="surface-card card-lift">
              <Link
                to="/app/profile"
                className="block rounded-2xl p-5 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-iris/10 text-iris"
                >
                  <PenSquare className="h-5 w-5" />
                </span>
                <h3 className="font-semibold tracking-tight">Edit profile</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your niche, audience, and pricing
                </p>
              </Link>
            </StaggerItem>
          </Stagger>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-tight">Your collaborations</h2>
              {campaignCreators.length > 5 && (
                <Link
                  to="/app/my-campaigns"
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              )}
            </div>
            {campaignCreators.length === 0 ? (
              <div className="surface-card">
                  <EmptyState
                    illustration="collaboration"
                    title="No collaborations yet"
                  description="Browse opportunities and accept your first brand deal."
                  action={
                    <Button onClick={() => navigate("/app/opportunities")}>Find opportunities</Button>
                  }
                />
              </div>
            ) : (
              <ul className="space-y-3">
                {campaignCreators.slice(0, 5).map((cc) => {
                  const camp = campaigns.find((c) => c.id === cc.campaign_id);
                  return (
                    <li key={cc.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-tight">{camp?.name || "Campaign"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {camp?.company_name || "—"}
                          {cc.price ? ` · €${cc.price}` : ""}
                          {cc.fit_score ? ` · Fit ${cc.fit_score}%` : ""}
                        </p>
                      </div>
                      <StatusBadge status={cc.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
