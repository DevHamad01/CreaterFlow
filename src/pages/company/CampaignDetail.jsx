import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge, FitScore } from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import CampaignHealthBadge from "@/components/intelligence/CampaignHealthBadge";
import SmartRecommendations from "@/components/intelligence/SmartRecommendations";
import AIContentReview from "@/components/intelligence/AIContentReview";
import CampaignReport from "@/components/intelligence/CampaignReport";
import BudgetRecommendations from "@/components/intelligence/BudgetRecommendations";
import { generateCreatorContentAngles } from "@/lib/campaignAi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Users, FileText, BarChart3, Target, Plus,
  Search, Check, X, MessageSquare, Loader2, ExternalLink,
  TrendingUp, MousePointerClick, Wallet, Sparkles, AlertTriangle, RefreshCw, SearchX
} from "lucide-react";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { base44 } from "@/api/base44Client";
import {
  campaigns as seedCampaigns,
  campaignCreators as seedCampaignCreators,
  posts as seedPosts,
  metrics as seedMetrics,
  leads as seedLeads,
  payments as seedPayments,
} from "@/data/app";
import { CHART_COLORS, CHART_TOOLTIP, CHART_AXIS_TICK } from "@/lib/chartTheme";
import { cn } from "@/lib/utils";

const CHART = CHART_COLORS;
const TOOLTIP = CHART_TOOLTIP;
const AXIS_TICK = CHART_AXIS_TICK;

const LEAD_COLORS = [CHART.primary, CHART.success, CHART.warning, CHART.iris, CHART.danger];

const LEAD_STATUSES = ["new", "qualified", "contacted", "converted", "lost"];

const STATUS_ACTIONS = {
  draft: { to: "recruiting", label: "Start recruiting", icon: Users },
  recruiting: { to: "active", label: "Activate campaign", icon: TrendingUp },
  active: { to: "live", label: "Mark as live", icon: Sparkles },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [campaignCreators, setCampaignCreators] = useState([]);
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("creators");
  const [showInvite, setShowInvite] = useState(false);
  const [allCreators, setAllCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [reviewingPost, setReviewingPost] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [aiReviewingPost, setAiReviewingPost] = useState(null);
  const [contentAngles, setContentAngles] = useState([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [reviewingPending, setReviewingPending] = useState(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    // A seeded campaign id resolves from local data, so the detail view works
    // without a round trip. Unknown ids still hit the backend so a real
    // not-found is still reported as one.
    const seeded = seedCampaigns.find((c) => c.id === id) || null;
    const scoped = (rows, seed) => {
      if (Array.isArray(rows) && rows.length > 0) return rows;
      return seed.filter((row) => row.campaign_id === id);
    };
    Promise.all([
      seeded ? Promise.resolve(seeded) : base44.entities.Campaign.get(id).catch(() => null),
      base44.entities.CampaignCreator.filter({ campaign_id: id }),
      base44.entities.Post.filter({ campaign_id: id }),
      base44.entities.CampaignMetric.filter({ campaign_id: id }),
      base44.entities.Lead.filter({ campaign_id: id }, "-date"),
      base44.entities.Payment.filter({ campaign_id: id }),
    ])
      .then(([c, cc, p, m, l, pay]) => {
        if (!c) {
          setNotFound(true);
          return;
        }
        setCampaign(c);
        setCampaignCreators(scoped(cc, seedCampaignCreators));
        setPosts(scoped(p, seedPosts));
        setMetrics(scoped(m, seedMetrics));
        setLeads(scoped(l, seedLeads));
        setPayments(scoped(pay, seedPayments));
      })
      .catch((err) => {
        console.error("CampaignDetail: load failed", err);
        if (err?.message?.match(/not found|404/i)) setNotFound(true);
        else setError("We couldn't load this campaign. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const loadCreators = async () => {
    setCreatorsLoading(true);
    try {
      const c = await base44.entities.Creator.list("-linkedin_followers", 50);
      setAllCreators(c || []);
    } catch (err) {
      console.error("CampaignDetail: creator list failed", err);
      toast({
        title: "We couldn't load the creator directory",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setCreatorsLoading(false);
    }
  };

  const openInvite = () => {
    setShowInvite(true);
    if (allCreators.length === 0) loadCreators();
  };

  const inviteCreator = async (creator) => {
    setInvitingId(creator.id);
    try {
      const fitScore = Math.floor(75 + Math.random() * 25);
      await base44.entities.CampaignCreator.create({
        campaign_id: id,
        creator_id: creator.id,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url,
        creator_niche: creator.niche,
        creator_followers: creator.linkedin_followers,
        fit_score: fitScore,
        price: creator.price_per_post,
        status: "invited",
        tracking_link: `${campaign?.tracking_base_url}/${creator.name.toLowerCase().replace(/\s+/g, "-")}`,
        invited_date: new Date().toISOString().split("T")[0],
      });
      const cc = await base44.entities.CampaignCreator.filter({ campaign_id: id });
      setCampaignCreators(cc || []);
      toast({ title: "Creator invited", description: `${creator.name} was added to the campaign.` });
    } catch (err) {
      console.error("CampaignDetail: invite failed", err);
      toast({
        title: "We couldn't send that invitation",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setInvitingId(null);
    }
  };

  const reviewPost = async (post, action) => {
    const updates = action === "approve"
      ? { status: "approved", feedback: feedback || "Approved" }
      : { status: "revision_requested", feedback: feedback || "Please revise" };

    setReviewingPending(post.id);
    try {
      await base44.entities.Post.update(post.id, updates);
      // Update campaign creator status
      await base44.entities.CampaignCreator.update(post.campaign_creator_id, {
        status: action === "approve" ? "approved" : "revision_requested",
      });
      const p = await base44.entities.Post.filter({ campaign_id: id });
      setPosts(p || []);
      const cc = await base44.entities.CampaignCreator.filter({ campaign_id: id });
      setCampaignCreators(cc || []);
      setReviewingPost(null);
      setFeedback("");
      toast({
        title: action === "approve" ? "Draft approved" : "Revision requested",
        description: post.creator_name,
      });
    } catch (err) {
      console.error("CampaignDetail: review failed", err);
      toast({
        title: "We couldn't save your review",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setReviewingPending(null);
    }
  };

  const updateCampaignStatus = async (newStatus) => {
    setStatusPending(true);
    try {
      await base44.entities.Campaign.update(id, { status: newStatus });
      setCampaign((prev) => ({ ...prev, status: newStatus }));
      toast({
        title: "Campaign updated",
        description: `Status is now ${newStatus}.`,
      });
    } catch (err) {
      console.error("CampaignDetail: status update failed", err);
      toast({
        title: "We couldn't update the campaign",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setStatusPending(false);
    }
  };

  const loadContentAngles = async () => {
    if (loadingAngles) return;
    setLoadingAngles(true);
    try {
      const result = await generateCreatorContentAngles(campaignCreators, campaign);
      setContentAngles(result.angles || []);
      if (!result.angles?.length) {
        toast({
          title: "No content angles generated",
          description: "Try again once the brief has more detail.",
        });
      }
    } catch (err) {
      console.error("CampaignDetail: content angles failed", err);
      toast({
        title: "We couldn't generate content angles",
        description: "This is optional — you can still brief creators manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingAngles(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading campaign</span>
        <Skeleton className="h-4 w-40" />
        <div className="surface-card space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-11 rounded-xl" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || (error && !campaign)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/campaigns")}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to campaigns
        </Button>
        <div className="surface-card mx-auto max-w-lg p-8" role="alert">
          <EmptyState
            icon={AlertTriangle}
            title={notFound ? "Campaign not found" : "We couldn't load this campaign"}
            description={
              notFound
                ? "This campaign may have been deleted, or you may not have access to it."
                : error
            }
            action={
              notFound ? (
                <Button asChild>
                  <Link to="/app/campaigns">Back to campaigns</Link>
                </Button>
              ) : (
                <Button onClick={load}>
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  Try again
                </Button>
              )
            }
          />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const tabs = [
    { id: "creators", label: "Creators", icon: Users, count: campaignCreators.length },
    { id: "brief", label: "Brief", icon: FileText },
    { id: "drafts", label: "Drafts & Review", icon: MessageSquare, count: posts.length },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Target, count: leads.length },
    { id: "payments", label: "Payments", icon: Wallet, count: payments.length },
    ...(campaign.status === "completed" ? [{ id: "report", label: "AI Report", icon: Sparkles }] : []),
  ];

  const statusAction = STATUS_ACTIONS[campaign.status];
  const reviewablePosts = posts.filter((p) => p.status === "submitted" || p.status === "in_review");
  const inviteCandidates = allCreators.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.niche?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/app/campaigns")} className="-ml-2">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to campaigns
      </Button>

      {error && (
        <p
          role="status"
          className="inline-flex items-center gap-2 self-start rounded-full border border-warning/25 bg-warning/5 px-3 py-1 text-xs text-warning"
        >
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
          Showing sample data — {error}
          <button
            type="button"
            onClick={load}
            className="rounded font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      <div className="surface-card surface-card-strong p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
              {["active", "recruiting", "review", "live"].includes(campaign.status) && (
                <CampaignHealthBadge
                  campaign={campaign}
                  campaignCreators={campaignCreators}
                  posts={posts}
                  metrics={metrics}
                  payments={payments}
                />
              )}
            </div>
            <p className="text-muted-foreground">{campaign.objective}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Wallet aria-hidden="true" className="h-3.5 w-3.5" />
                Budget €{campaign.budget?.toLocaleString() || 0}
              </span>
              <span>Product: {campaign.product}</span>
              {campaign.start_date && <span>Start: {campaign.start_date}</span>}
            </div>
          </div>
          {statusAction && (
            <Button
              onClick={() => updateCampaignStatus(statusAction.to)}
              disabled={statusPending}
              className={cn(
                statusAction.to === "live" && "bg-success text-success-foreground hover:bg-success/90"
              )}
            >
              {statusPending ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <statusAction.icon aria-hidden="true" className="h-4 w-4" />
              )}
              {statusAction.label}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard dense label="Creators" value={campaignCreators.length} icon={Users} accent="primary" />
        <StatCard dense label="Impressions" value={totalImpressions.toLocaleString()} icon={TrendingUp} accent="iris" />
        <StatCard dense label="Clicks" value={totalClicks} icon={MousePointerClick} accent="success" />
        <StatCard dense label="Leads" value={totalLeads} icon={Target} accent="warning" />
        <StatCard dense label="Spend" value={`€${totalSpend.toLocaleString()}`} icon={Wallet} accent="neutral" />
      </div>

      {["active", "recruiting", "review", "live"].includes(campaign.status) && allCreators.length > 0 && (
        <SmartRecommendations
          campaign={campaign}
          campaignCreators={campaignCreators}
          allCreators={allCreators}
          metrics={metrics}
        />
      )}

      <div
        role="tablist"
        aria-label="Campaign sections"
        className="no-scrollbar -mb-px flex gap-1 overflow-x-auto border-b border-border/80"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <t.icon aria-hidden="true" className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        {tab === "creators" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold tracking-tight">Assigned creators</h2>
              <Button onClick={openInvite}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Invite creators
              </Button>
            </div>

            {campaignCreators.length === 0 ? (
              <div className="surface-card">
                <EmptyState
                  icon={Users}
                  title="No creators yet"
                  description="Invite creators from the marketplace to join this campaign."
                  action={
                    <Button onClick={openInvite}>
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Invite creators
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="space-y-2">
                {campaignCreators.map((cc) => (
                  <li key={cc.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
                    <img
                      src={cc.creator_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cc.creator_name || "creator")}&backgroundColor=2563eb`}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/creators/${cc.creator_id}`}
                        className="truncate font-semibold transition-colors hover:text-primary"
                      >
                        {cc.creator_name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {cc.creator_niche}
                        {cc.creator_followers ? ` · ${cc.creator_followers.toLocaleString()} followers` : ""}
                        {cc.price ? ` · €${cc.price}` : ""}
                      </p>
                    </div>
                    <FitScore score={cc.fit_score} />
                    <StatusBadge status={cc.status} />
                  </li>
                ))}
              </ul>
            )}

            <Dialog open={showInvite} onOpenChange={(open) => !open && setShowInvite(null)}>
              <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Invite creators</DialogTitle>
                  <DialogDescription>
                    {campaignCreators.length} of your creators are already on this campaign.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search creators..."
                    aria-label="Search creators to invite"
                    className="pl-10"
                  />
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {creatorsLoading ? (
                    [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
                  ) : inviteCandidates.length === 0 ? (
                    <EmptyState
                      icon={SearchX}
                      title="No creators match that search"
                      description="Try a different name or niche."
                    />
                  ) : (
                    inviteCandidates.map((c) => {
                      const already = campaignCreators.some((cc) => cc.creator_id === c.id);
                      const inviting = invitingId === c.id;
                      return (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:border-primary/25 hover:bg-muted/50"
                        >
                          <img
                            src={c.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || "creator")}&backgroundColor=2563eb`}
                            alt=""
                            className="h-9 w-9 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{c.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.niche}
                              {c.price_per_post ? ` · €${c.price_per_post}/post` : ""}
                            </p>
                          </div>
                          {already ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                              <Check aria-hidden="true" className="h-3.5 w-3.5" />
                              Invited
                            </span>
                          ) : (
                            <Button size="sm" onClick={() => inviteCreator(c)} disabled={inviting}>
                              {inviting && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
                              Invite
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {tab === "brief" && (
          <div className="surface-card space-y-6 p-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Objective</h3>
              <p className="text-sm text-muted-foreground">{campaign.objective}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Target audience</h3>
              <p className="text-sm text-muted-foreground">{campaign.target_audience}</p>
            </div>
            {campaign.key_messages?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Key messages</h3>
                <ul className="space-y-1.5">
                  {campaign.key_messages.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {campaign.creator_guidelines && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Creator guidelines</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{campaign.creator_guidelines}</p>
              </div>
            )}
            {campaign.content_direction && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Content direction</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{campaign.content_direction}</p>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Tracking</h3>
              <p className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
                {campaign.tracking_base_url}
              </p>
            </div>

            {campaignCreators.length > 0 && (
              <div className="rounded-2xl border border-iris/25 bg-iris/[0.03] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-iris" />
                    Creator-specific content angles
                  </h3>
                  <Button
                    size="sm"
                    onClick={loadContentAngles}
                    disabled={loadingAngles}
                    className="bg-iris text-iris-foreground hover:bg-iris/90"
                  >
                    {loadingAngles ? (
                      <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    {contentAngles.length > 0 ? "Regenerate" : "Generate angles"}
                  </Button>
                </div>
                {loadingAngles ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : contentAngles.length > 0 ? (
                  <ul className="space-y-3">
                    {contentAngles.map((angle, i) => (
                      <li key={i} className="surface-card p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{angle.creator_name}</span>
                          <span className="rounded-full bg-iris/10 px-2 py-0.5 text-xs font-semibold text-iris">
                            {angle.angle_name}
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{angle.angle_description}</p>
                        {angle.suggested_hook && (
                          <p className="mb-2 text-xs italic text-muted-foreground">Hook: “{angle.suggested_hook}”</p>
                        )}
                        {angle.key_talking_points?.length > 0 && (
                          <ul className="space-y-1">
                            {angle.key_talking_points.map((pt, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <span aria-hidden="true" className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-iris/60" />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Generate unique content angles for each creator based on their niche, audience, and
                    expertise. No two creators get identical instructions.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "drafts" && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="surface-card">
                <EmptyState
                  icon={MessageSquare}
                  title="No drafts yet"
                  description="Creator drafts will appear here for your review."
                />
              </div>
            ) : (
              <ul className="space-y-3">
                {posts.map((post) => {
                  const busy = reviewingPending === post.id;
                  return (
                    <li key={post.id} className={cn("surface-card p-5", busy && "opacity-70")}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.creator_name}</span>
                          <StatusBadge status={post.status} />
                        </div>
                        {post.published_date && (
                          <span className="text-xs text-muted-foreground">Published: {post.published_date}</span>
                        )}
                        {post.scheduled_date && (
                          <span className="text-xs text-muted-foreground">Scheduled: {post.scheduled_date}</span>
                        )}
                      </div>
                      <p className="mb-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                        {post.content}
                      </p>
                      {post.post_url && (
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                        >
                          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                          View live post
                          <span className="sr-only">from {post.creator_name} (opens in a new tab)</span>
                        </a>
                      )}
                      {post.feedback && (
                        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Feedback:</span> {post.feedback}
                        </p>
                      )}
                      {(post.status === "submitted" || post.status === "in_review") && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/70 pt-3">
                          <Button size="sm" variant="secondary" onClick={() => setAiReviewingPost(post)}>
                            <Sparkles aria-hidden="true" className="h-4 w-4 text-iris" />
                            AI Review
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setReviewingPost(post)}>
                            Review &amp; feedback
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => reviewPost(post, "approve")}
                            disabled={busy}
                            className="bg-success text-success-foreground hover:bg-success/90"
                          >
                            {busy ? (
                              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check aria-hidden="true" className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewPost(post, "reject")}
                            disabled={busy}
                            className="border-danger/30 text-danger hover:bg-danger/10"
                          >
                            <X aria-hidden="true" className="h-4 w-4" />
                            Request revision
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {reviewablePosts.length > 0 && reviewablePosts.length < posts.length && (
              <p className="text-xs text-muted-foreground">
                {reviewablePosts.length} of {posts.length} drafts are waiting on your review.
              </p>
            )}

            <Dialog
              open={Boolean(reviewingPost)}
              onOpenChange={(open) => {
                if (!open) {
                  setReviewingPost(null);
                  setFeedback("");
                }
              }}
            >
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Review draft from {reviewingPost?.creator_name}</DialogTitle>
                  <DialogDescription>
                    Add feedback the creator will see, then approve or request a revision.
                  </DialogDescription>
                </DialogHeader>
                <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  {reviewingPost?.content}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="review-feedback">Feedback</Label>
                  <Textarea
                    id="review-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter feedback for the creator..."
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewingPost(null);
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => reviewPost(reviewingPost, "approve")}
                    disabled={reviewingPending === reviewingPost?.id}
                  >
                    {reviewingPending === reviewingPost?.id ? (
                      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check aria-hidden="true" className="h-4 w-4" />
                    )}
                    Approve with feedback
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-danger/30 text-danger hover:bg-danger/10"
                    onClick={() => reviewPost(reviewingPost, "reject")}
                    disabled={reviewingPending === reviewingPost?.id}
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                    Request revision
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {aiReviewingPost && (
              <AIContentReview
                post={aiReviewingPost}
                campaign={campaign}
                onClose={() => setAiReviewingPost(null)}
                onApprove={(post) => { reviewPost(post, "approve"); setAiReviewingPost(null); }}
                onReject={(post) => { reviewPost(post, "reject"); setAiReviewingPost(null); }}
              />
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard dense label="Impressions" value={totalImpressions.toLocaleString()} icon={TrendingUp} accent="primary" />
              <StatCard dense label="Clicks" value={totalClicks} icon={MousePointerClick} accent="success" />
              <StatCard dense label="Leads" value={totalLeads} icon={Target} accent="warning" />
              <StatCard dense label="Pipeline" value={`€${(totalPipeline / 1000).toFixed(1)}K`} icon={Wallet} accent="iris" />
            </div>

            {metrics.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="surface-card p-6 lg:col-span-2">
                  <h3 className="mb-4 font-semibold tracking-tight">Per-creator performance</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <ReBarChart data={campaignCreators.map((cc) => {
                      const ccMetrics = metrics.filter((m) => m.creator_id === cc.creator_id);
                      return {
                        name: cc.creator_name?.split(" ")[0] || "Creator",
                        impressions: ccMetrics.reduce((s, m) => s + (m.impressions || 0), 0),
                        clicks: ccMetrics.reduce((s, m) => s + (m.clicks || 0), 0),
                        leads: ccMetrics.reduce((s, m) => s + (m.leads || 0), 0),
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                      <XAxis dataKey="name" tick={{ ...AXIS_TICK, fill: CHART.axis }} stroke={CHART.grid} />
                      <YAxis tick={{ ...AXIS_TICK, fill: CHART.axis }} stroke={CHART.grid} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={TOOLTIP}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="impressions" fill={CHART.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" fill={CHART.success} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="leads" fill={CHART.warning} radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>

                {leads.length > 0 && (
                  <div className="surface-card p-6">
                    <h3 className="mb-4 font-semibold tracking-tight">Lead breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={LEAD_STATUSES.map((status) => ({
                            name: status.charAt(0).toUpperCase() + status.slice(1),
                            value: leads.filter((l) => l.status === status).length,
                          })).filter((d) => d.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          innerRadius={40}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {LEAD_STATUSES.map((status, i) => (
                            <Cell key={status} fill={LEAD_COLORS[i % LEAD_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {metrics.length > 0 && metrics.some((m) => m.date) && (
              <div className="surface-card p-6">
                <h3 className="mb-4 font-semibold tracking-tight">Performance trend over time</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={Object.entries(
                    metrics.reduce((acc, m) => {
                      const d = m.date || "N/A";
                      if (!acc[d]) acc[d] = { date: d, impressions: 0, clicks: 0, leads: 0 };
                      acc[d].impressions += m.impressions || 0;
                      acc[d].clicks += m.clicks || 0;
                      acc[d].leads += m.leads || 0;
                      return acc;
                    }, {})
                  ).map(([date, vals]) => ({ ...vals, date: date.slice(5) })).sort((a, b) => a.date.localeCompare(b.date))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis dataKey="date" tick={{ ...AXIS_TICK, fill: CHART.axis }} stroke={CHART.grid} />
                    <YAxis tick={{ ...AXIS_TICK, fill: CHART.axis }} stroke={CHART.grid} />
                    <Tooltip
                      contentStyle={TOOLTIP}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="impressions" stroke={CHART.primary} fill={CHART.primary} fillOpacity={0.12} />
                    <Area type="monotone" dataKey="clicks" stroke={CHART.success} fill={CHART.success} fillOpacity={0.12} />
                    <Area type="monotone" dataKey="leads" stroke={CHART.warning} fill={CHART.warning} fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="surface-card p-6">
              <h3 className="mb-4 font-semibold tracking-tight">Creator performance</h3>
              {metrics.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No analytics yet"
                  description="Performance data will appear once posts go live."
                />
              ) : (
                <ul className="space-y-2">
                  {metrics.map((m) => {
                    const cc = campaignCreators.find((c) => c.creator_id === m.creator_id);
                    return (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"
                      >
                        <span className="text-sm font-semibold">{cc?.creator_name || "Creator"}</span>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                          <span className="tabular-nums">
                            {m.impressions?.toLocaleString()} <span className="text-xs">impr</span>
                          </span>
                          <span className="tabular-nums">
                            {m.clicks} <span className="text-xs">clicks</span>
                          </span>
                          <span className="tabular-nums">
                            {m.leads} <span className="text-xs">leads</span>
                          </span>
                          <span className="font-semibold text-foreground">€{m.pipeline_value?.toLocaleString()}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {metrics.length > 0 && (
              <BudgetRecommendations campaignCreators={campaignCreators} metrics={metrics} />
            )}
          </div>
        )}

        {tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <div className="surface-card">
                <EmptyState
                  icon={Target}
                  title="No leads yet"
                  description="Leads from your campaign posts will appear here."
                />
              </div>
            ) : (
              <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Leads captured by this campaign</caption>
                    <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Contact</th>
                        <th scope="col" className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Company</th>
                        <th scope="col" className="hidden px-4 py-3 text-left font-semibold md:table-cell">Creator</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Value</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {leads.map((l) => (
                        <tr key={l.id} className="transition-colors hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{l.contact_name}</p>
                            <p className="text-xs text-muted-foreground">{l.title}</p>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{l.company_name}</td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{l.creator_name}</td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">€{l.value?.toLocaleString()}</td>
                          <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="surface-card">
                <EmptyState
                  icon={Wallet}
                  title="No payments yet"
                  description="Creator payments will appear here once posts are live."
                />
              </div>
            ) : (
              <ul className="space-y-3">
                {payments.map((p) => (
                  <li key={p.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.creator_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.invoice_number || "Pending invoice"} · Due {p.due_date || "TBD"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-semibold tabular-nums">€{p.amount}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "report" && (
          <CampaignReport
            campaign={campaign}
            creators={campaignCreators}
            posts={posts}
            metrics={metrics}
            leads={leads}
            payments={payments}
          />
        )}
      </div>
    </div>
  );
}
