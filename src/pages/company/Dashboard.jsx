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
import {
  FolderKanban, Wallet, Target, Plus,
  TrendingUp, Search, BarChart3, AlertTriangle, RefreshCw, ArrowRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const ACTIVE_STATUSES = ["active", "recruiting", "review", "live"];

const QUICK_ACTIONS = [
  {
    to: "/app/marketplace",
    icon: Search,
    tone: "bg-primary/10 text-primary ring-primary/20",
    title: "Browse marketplace",
    body: "Find creators for your next campaign",
  },
  {
    to: "/app/campaigns/new",
    icon: Plus,
    tone: "bg-iris/10 text-iris ring-iris/20",
    title: "Create campaign",
    body: "Generate an AI brief and invite creators",
  },
  {
    to: "/app/analytics",
    icon: BarChart3,
    tone: "bg-success/10 text-success ring-success/20",
    title: "View analytics",
    body: "Track clicks, leads and pipeline",
  },
];

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      base44.entities.Campaign.filter({ created_by_id: user.id }, "-created_date"),
      base44.entities.Payment.filter({ created_by_id: user.id }),
      base44.entities.Lead.filter({ created_by_id: user.id }),
    ])
      .then(([c, p, l]) => {
        setCampaigns(c || []);
        setPayments(p || []);
        setLeads(l || []);
      })
      .catch((err) => {
        console.error("CompanyDashboard: load failed", err);
        setError("We couldn't load your workspace. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your dashboard</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2.5">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your dashboard"
          description={error}
          action={
            <Button onClick={loadDashboard}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c) => ACTIVE_STATUSES.includes(c.status)).length;
  const totalSpend = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.amount || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Here's what's happening with your creator campaigns."
        action={
          <Button onClick={() => navigate("/app/campaigns/new")}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New campaign
          </Button>
        }
      />

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.05}>
        <StatCard label="Active campaigns" value={activeCampaigns} icon={FolderKanban} accent="primary" />
        <StatCard
          label="Total spend"
          value={`€${totalSpend.toLocaleString()}`}
          icon={Wallet}
          accent="neutral"
        />
        <StatCard label="Leads generated" value={totalLeads} icon={Target} accent="iris" />
        <StatCard
          label="Pipeline value"
          value={`€${(totalPipeline / 1000).toFixed(1)}K`}
          icon={TrendingUp}
          accent="success"
        />
      </Stagger>

      <Stagger className="grid gap-4 sm:grid-cols-3" stagger={0.07}>
        {QUICK_ACTIONS.map(({ to, icon: Icon, tone, title, body }) => (
          <StaggerItem key={to} className="surface-card card-lift group">
            <Link to={to} className="block rounded-2xl p-5 focus-visible:outline-none">
              <span
                aria-hidden="true"
                className={`mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="flex items-center gap-1.5 font-semibold tracking-tight transition-colors group-hover:text-primary">
                {title}
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 opacity-0 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Recent campaigns</h2>
          <Link
            to="/app/campaigns"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="surface-card">
              <EmptyState
                illustration="campaign"
                title="No campaigns yet"
              description="Create your first campaign to start collaborating with creators."
              action={
                <Button onClick={() => navigate("/app/campaigns/new")}>
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Create campaign
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {campaigns.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/app/campaigns/${c.id}`}
                  className="surface-card surface-card-hover block p-4 focus-visible:outline-none"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold tracking-tight">{c.name}</h3>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.objective}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="hidden font-display text-sm font-semibold sm:block">
                        €{(c.budget || 0).toLocaleString()}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
