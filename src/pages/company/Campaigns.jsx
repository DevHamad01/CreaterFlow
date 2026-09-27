import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertTriangle, RefreshCw, SearchX, CalendarDays, Wallet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { preferLive, hasContent } from "@/lib/seeded";
import { campaigns as seedCampaigns } from "@/data/app";

const STATUSES = ["draft", "recruiting", "active", "review", "live", "completed"];

const pretty = (s) => (s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1));

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadCampaigns = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    base44.entities.Campaign.filter({ created_by_id: user.id }, "-created_date")
      .then((rows) => setCampaigns(preferLive(seedCampaigns)(rows)))
      .catch((err) => {
        console.error("Campaigns: load failed", err);
        setError("We couldn't load your campaigns. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const tabs = useMemo(
    () => [
      { value: "all", label: "All", count: campaigns.length },
      ...STATUSES.map((s) => ({
        value: s,
        label: pretty(s),
        count: campaigns.filter((c) => c.status === s).length,
      })),
    ],
    [campaigns]
  );

  const filtered = useMemo(
    () => (filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter)),
    [campaigns, filter]
  );

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading campaigns</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !hasContent(campaigns)) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your campaigns"
          description={error}
          action={
            <Button onClick={loadCampaigns}>
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
        title="Campaigns"
        description={`${campaigns.length} total ${campaigns.length === 1 ? "campaign" : "campaigns"}`}
        action={
          <Button onClick={() => navigate("/app/campaigns/new")}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New campaign
          </Button>
        }
      />

      {error && (
        <p
          role="status"
          className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/5 px-3 py-1 text-xs text-warning"
        >
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
          Showing sample campaigns — {error}
          <button
            type="button"
            onClick={loadCampaigns}
            className="rounded font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      <FilterTabs tabs={tabs} value={filter} onChange={setFilter} ariaLabel="Filter by status" />

      {filtered.length === 0 ? (
        campaigns.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              illustration="campaign"
              title="No campaigns yet"
              description="Create your first campaign to start collaborating with creators."
              action={
                <Button asChild>
                  <Link to="/app/campaigns/new">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Create campaign
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="surface-card">
            <EmptyState
              icon={SearchX}
              title={`No ${pretty(filter).toLowerCase()} campaigns`}
              description={`You have ${campaigns.length} ${campaigns.length === 1 ? "campaign" : "campaigns"} in total, but none with the ${pretty(filter).toLowerCase()} status.`}
              action={
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Show all campaigns
                </Button>
              }
            />
          </div>
        )
      ) : (
        <Stagger as="ul" className="space-y-3" stagger={0.04}>
          {filtered.map((c) => (
            <StaggerItem key={c.id}>
              <Link
                to={`/app/campaigns/${c.id}`}
                className="surface-card card-lift block p-5 focus-visible:outline-none"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold tracking-tight">{c.name}</h2>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.objective}</p>
                  </div>
                  <span className="font-display text-sm font-semibold">
                    €{(c.budget || 0).toLocaleString()}
                  </span>
                </div>

                {(c.start_date || c.end_date) && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {c.start_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                        {c.start_date}
                        {c.end_date ? ` → ${c.end_date}` : ""}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet aria-hidden="true" className="h-3.5 w-3.5" />
                      Budget {(c.budget || 0).toLocaleString()}
                    </span>
                  </p>
                )}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
