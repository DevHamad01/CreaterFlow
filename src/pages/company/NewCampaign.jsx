import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { generateCampaignStrategy } from "@/lib/campaignAi";
import { computeCreatorMatch, rankCreatorsForCampaign, formatNumber, formatCurrency } from "@/lib/intelligence";
import CampaignSimulator from "@/components/intelligence/CampaignSimulator";
import { TemplateSelector, SaveTemplateModal } from "@/components/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles, Loader2, ArrowRight, ArrowLeft, Check, Target,
  Users, FileText, BarChart3, Lightbulb, AlertCircle, Rocket, FolderOpen, Save, UsersRound
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];
const OBJECTIVES = ["Brand awareness", "Lead generation", "Product launch", "Thought leadership", "Trial signups", "Event promotion", "Content amplification"];

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40";

export default function NewCampaign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [allCreators, setAllCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsError, setCreatorsError] = useState(null);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [genError, setGenError] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateData, setTemplateData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    product: "",
    website: "",
    industry: "",
    objective: "",
    target_audience: "",
    geography: "",
    budget: 5000,
    lead_target: 50,
    desired_outcome: "",
    keyMessage: "",
    start_date: "",
    end_date: "",
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const applyTemplate = (tpl) => {
    setForm((p) => ({
      ...p,
      objective: tpl.objective || p.objective,
      target_audience: tpl.target_audience || p.target_audience,
      budget: tpl.budget || p.budget,
      product: tpl.product || p.product,
      desired_outcome: tpl.desired_outcome || p.desired_outcome,
    }));
    setTemplateData(tpl);
    if (tpl.creator_guidelines || tpl.key_messages?.length) {
      setStrategy({
        strategy: { objective: tpl.objective, target_audience: tpl.target_audience, positioning: "Template-based campaign", campaign_type: tpl.category || "Lead generation", estimated_duration: "3-4 weeks" },
        creator_requirements: { recommended_niches: [], audience_characteristics: tpl.target_audience, geography: "Global", experience_level: "established", creator_size: "10K-50K", estimated_creators: 4 },
        campaign: {
          campaign_name: form.name || `${tpl.product || "Campaign"} Campaign`,
          brief: tpl.description || `Campaign for ${tpl.product || "product"}.`,
          key_messages: tpl.key_messages || [],
          creator_guidelines: tpl.creator_guidelines || "",
          content_direction: tpl.content_direction || "",
          cta: tpl.desired_outcome || "",
        },
        measurement: { tracking_strategy: "Use unique tracking links", recommended_kpis: ["Impressions", "Clicks", "Leads", "CPL"], attribution_approach: "UTM tracking per creator" },
      });
    }
    toast({ title: "Template applied", description: tpl.name });
  };

  // Load creators for matching step
  useEffect(() => {
    if (step !== 3 || allCreators.length > 0) return;
    let cancelled = false;
    setCreatorsLoading(true);
    setCreatorsError(null);
    base44.entities.Creator.list("-linkedin_followers", 100)
      .then((rows) => {
        if (!cancelled) setAllCreators(rows || []);
      })
      .catch((err) => {
        console.error("NewCampaign: creator list failed", err);
        if (!cancelled) setCreatorsError("We couldn't load the creator directory. Retry or skip to review.");
      })
      .finally(() => {
        if (!cancelled) setCreatorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, allCreators.length]);

  // Build a pseudo-campaign object for matching
  const matchCampaign = useMemo(() => ({
    product: form.product,
    objective: form.objective,
    target_audience: form.target_audience,
    budget: form.budget,
  }), [form]);

  const rankedCreators = useMemo(() => {
    if (!strategy) return [];
    return rankCreatorsForCampaign(allCreators, matchCampaign).slice(0, 20);
  }, [allCreators, strategy, matchCampaign]);

  const generateStrategy = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const result = await generateCampaignStrategy(form);
      setStrategy(result);
      // Auto-fill form fields from strategy
      if (result.campaign?.campaign_name) update("name", result.campaign.campaign_name);
      if (result.campaign?.brief) update("objective", result.strategy?.objective || form.objective);
      if (result.strategy?.target_audience) update("target_audience", result.strategy.target_audience);
    } catch (err) {
      setGenError(err.message || "Failed to generate strategy. You can continue with manual entry.");
      // Provide a minimal fallback so the user isn't stuck
      setStrategy({
        strategy: {
          objective: form.objective,
          target_audience: form.target_audience,
          positioning: "Position your product as the solution to your audience's primary challenge.",
          campaign_type: "Lead generation",
          estimated_duration: "3-4 weeks",
        },
        creator_requirements: {
          recommended_niches: [NICHES[0], NICHES[1]],
          audience_characteristics: form.target_audience,
          geography: form.geography || "Global",
          experience_level: "established",
          creator_size: "10K-50K",
          estimated_creators: 4,
        },
        campaign: {
          campaign_name: form.name || `${form.product} Campaign`,
          brief: `Collaborate with B2B creators to promote ${form.product} to ${form.target_audience}.`,
          key_messages: [
            `${form.product} helps ${form.target_audience} achieve ${form.desired_outcome}`,
            "Show a real workflow or before/after comparison",
            "Include a clear call-to-action",
            "Keep the tone authentic and experience-based",
          ],
          creator_guidelines: "Share a genuine experience or workflow. Show, don't tell. Include a screenshot or demo if possible. Keep it authentic — no hard selling.",
          content_direction: "Educational + personal experience. Focus on the transformation or time saved.",
          cta: `Try ${form.product} today`,
        },
        measurement: {
          tracking_strategy: "Use unique tracking links for each creator to attribute clicks and leads.",
          recommended_kpis: ["Impressions", "Click-through rate", "Leads generated", "Cost per lead"],
          attribution_approach: "Track unique clicks and lead form submissions from each creator's tracking link.",
        },
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleCreator = (creator) => {
    setSelectedCreators((prev) => {
      const exists = prev.find((c) => c.id === creator.id);
      if (exists) return prev.filter((c) => c.id !== creator.id);
      return [...prev, creator];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const campaign = await base44.entities.Campaign.create({
        name: strategy?.campaign?.campaign_name || form.name,
        company_id: user?.company_name || "",
        company_name: user?.company_name || "My Company",
        product: form.product,
        objective: strategy?.strategy?.objective || templateData?.objective || form.objective,
        target_audience: strategy?.strategy?.target_audience || templateData?.target_audience || form.target_audience,
        desired_outcome: form.desired_outcome,
        budget: form.budget,
        start_date: form.start_date,
        end_date: form.end_date,
        key_messages: strategy?.campaign?.key_messages || templateData?.key_messages || [],
        creator_guidelines: strategy?.campaign?.creator_guidelines || templateData?.creator_guidelines || "",
        content_direction: strategy?.campaign?.content_direction || templateData?.content_direction || "",
        tracking_base_url: `https://creatorflow.app/t/${(strategy?.campaign?.campaign_name || form.name).toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`,
        lead_target: templateData?.lead_target || 0,
        status: "draft",
      });

      // Invite selected creators
      for (const creator of selectedCreators) {
        const match = computeCreatorMatch(creator, matchCampaign);
        await base44.entities.CampaignCreator.create({
          campaign_id: campaign.id,
          creator_id: creator.id,
          creator_name: creator.name,
          creator_avatar: creator.avatar_url,
          creator_niche: creator.niche,
          creator_followers: creator.linkedin_followers,
          fit_score: match.score,
          price: creator.price_per_post,
          status: "invited",
          tracking_link: `${campaign.tracking_base_url}/${creator.name.toLowerCase().replace(/\s+/g, "-")}`,
          invited_date: new Date().toISOString().split("T")[0],
        });
      }

      toast({ title: "Campaign created", description: strategy?.campaign?.campaign_name || form.name });
      navigate(`/app/campaigns/${campaign.id}`);
    } catch (err) {
      console.error("NewCampaign: create failed", err);
      toast({
        title: "We couldn't create your campaign",
        description: err.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Campaign basics", icon: Target },
    { num: 2, label: "AI strategy", icon: Sparkles },
    { num: 3, label: "Creator matching", icon: Users },
    { num: 4, label: "Simulator", icon: BarChart3 },
    { num: 5, label: "Review", icon: Check },
  ];

  const missing = [
    !form.product && "product or service",
    !form.objective && "objective",
    !form.target_audience && "ideal customer profile",
    !form.desired_outcome && "desired outcome",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/campaigns")} className="-ml-2 mb-3">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to campaigns
        </Button>
        <h1 className="font-display text-2xl font-semibold tracking-tight">AI Campaign Copilot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          From strategy to creator selection — powered by AI
        </p>
      </div>

      <nav aria-label="Campaign creation progress">
        <ol className="flex items-center gap-1">
          {steps.map((s, i) => {
            const done = s.num < step;
            const current = s.num === step;
            return (
              <li key={s.num} className="flex flex-1 items-center gap-1">
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2",
                    s.num <= step ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                      s.num <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check aria-hidden="true" className="h-4 w-4" /> : s.num}
                  </span>
                  <span className="hidden text-xs font-semibold sm:block">{s.label}</span>
                </span>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn("mx-2 h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {step === 1 && (
        <div className="surface-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-4">
            <h2 className="font-semibold tracking-tight">Campaign basics</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowTemplateSelector(true)}>
              <FolderOpen aria-hidden="true" className="h-4 w-4" />
              Use template
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product">Product or service *</Label>
            <Input
              id="product"
              value={form.product}
              onChange={(e) => update("product", e.target.value)}
              placeholder="e.g. Lemlist AI Outreach"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="SaaS, Fintech..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objective">Campaign objective *</Label>
            <select
              id="objective"
              value={form.objective}
              onChange={(e) => update("objective", e.target.value)}
              className={selectClass}
            >
              <option value="">Select objective...</option>
              {OBJECTIVES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-audience">Ideal customer profile (ICP) *</Label>
            <Input
              id="target-audience"
              value={form.target_audience}
              onChange={(e) => update("target_audience", e.target.value)}
              placeholder="VP Sales at B2B SaaS companies"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="geography">Geography</Label>
              <Input
                id="geography"
                value={form.geography}
                onChange={(e) => update("geography", e.target.value)}
                placeholder="US, Europe, Global..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (€) *</Label>
              <Input
                id="budget"
                type="number"
                value={form.budget}
                onChange={(e) => update("budget", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-target">Lead target (optional)</Label>
            <Input
              id="lead-target"
              type="number"
              value={form.lead_target}
              onChange={(e) => update("lead_target", Number(e.target.value))}
              placeholder="e.g. 50"
              aria-describedby="lead-target-hint"
            />
            <p id="lead-target-hint" className="text-xs text-muted-foreground">
              Set a goal to trigger automatic notifications when you hit 50% and 100% of this target
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desired-outcome">Desired outcome *</Label>
            <Input
              id="desired-outcome"
              value={form.desired_outcome}
              onChange={(e) => update("desired_outcome", e.target.value)}
              placeholder="Free trial signups"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="key-message">Key message (optional)</Label>
            <Textarea
              id="key-message"
              rows={2}
              value={form.keyMessage}
              onChange={(e) => update("keyMessage", e.target.value)}
              placeholder="The main message you want creators to convey..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date">End date</Label>
              <Input
                id="end-date"
                type="date"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
              />
            </div>
          </div>

          {missing.length > 0 && (
            <p className="text-xs text-muted-foreground" role="status">
              Add your {missing.join(", ")} to continue.
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={() => setStep(2)}
            disabled={missing.length > 0}
          >
            Generate AI strategy
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {!strategy && (
              <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-8 text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                >
                <Sparkles className="h-7 w-7" />
              </span>
              <h2 className="mb-2 font-display text-lg font-semibold tracking-tight">AI Campaign Strategist</h2>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                Our AI will analyze your inputs and generate a complete campaign strategy: positioning,
                creator requirements, brief, key messages, and measurement plan.
              </p>
              <Button size="lg" onClick={generateStrategy} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Analyzing &amp; generating strategy...
                  </>
                ) : (
                  <>
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    Generate campaign strategy
                  </>
                )}
              </Button>
              {genError && (
                <p
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-left text-xs text-warning"
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {genError}
                </p>
              )}
            </div>
          )}

          {strategy && (
            <>
              <div className="surface-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
                  <Lightbulb aria-hidden="true" className="h-5 w-5 text-primary" />
                  Campaign Strategy
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Objective</p>
                    <p>{strategy.strategy?.objective}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Positioning</p>
                    <p>{strategy.strategy?.positioning}</p>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Campaign type</p>
                      <p>{strategy.strategy?.campaign_type}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Duration</p>
                      <p>{strategy.strategy?.estimated_duration}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
                  <Users aria-hidden="true" className="h-5 w-5 text-iris" />
                  Creator Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  {strategy.creator_requirements?.recommended_niches?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {strategy.creator_requirements.recommended_niches.map((n) => (
                        <span key={n} className="rounded-full bg-iris/10 px-2.5 py-1 text-xs font-semibold text-iris">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Audience characteristics
                    </p>
                    <p>{strategy.creator_requirements?.audience_characteristics}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Creator size</p>
                      <p>{strategy.creator_requirements?.creator_size}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recommended count</p>
                      <p>{strategy.creator_requirements?.estimated_creators} creators</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
                  <FileText aria-hidden="true" className="h-5 w-5 text-success" />
                  Campaign Brief
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="leading-relaxed">{strategy.campaign?.brief}</p>
                  {strategy.campaign?.key_messages?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Key messages</p>
                      <ul className="space-y-1.5">
                        {strategy.campaign.key_messages.map((msg, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                            {msg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Creator guidelines</p>
                    <p>{strategy.campaign?.creator_guidelines}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Call to action</p>
                    <p className="font-semibold">{strategy.campaign?.cta}</p>
                  </div>
                </div>
              </div>

              <div className="surface-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
                  <BarChart3 aria-hidden="true" className="h-5 w-5 text-warning" />
                  Measurement Plan
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tracking strategy</p>
                    <p>{strategy.measurement?.tracking_strategy}</p>
                  </div>
                  {strategy.measurement?.recommended_kpis?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recommended KPIs</p>
                      <div className="flex flex-wrap gap-2">
                        {strategy.measurement.recommended_kpis.map((kpi) => (
                          <span key={kpi} className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attribution approach</p>
                    <p>{strategy.measurement?.attribution_approach}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(3)}>
                  Find matching creators
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold tracking-tight">Intelligent Creator Matching</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {selectedCreators.length} selected
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Creators are ranked by match score based on audience fit, niche, engagement, and historical
              performance.
            </p>
          </div>

          {creatorsError ? (
            <div className="surface-card p-6" role="alert">
              <p className="text-sm font-semibold text-danger">{creatorsError}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setCreatorsError(null);
                    setAllCreators([]);
                  }}
                >
                  Retry
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStep(4)}>
                  Skip to simulator
                </Button>
              </div>
            </div>
          ) : creatorsLoading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading matching creators</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[68px] rounded-xl" />
              ))}
            </div>
          ) : rankedCreators.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <UsersRound aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-semibold tracking-tight">No creators to match yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The creator directory is empty, so there is nothing to rank. You can still finish your
                campaign and invite creators later.
              </p>
            </div>
          ) : (
            <ul className="max-h-[500px] space-y-2 overflow-y-auto">
              {rankedCreators.map(({ creator, match }) => {
                const selected = selectedCreators.find((c) => c.id === creator.id);
                return (
                  <li key={creator.id}>
                    <button
                      type="button"
                      onClick={() => toggleCreator(creator)}
                      aria-pressed={Boolean(selected)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ease-smooth",
                        selected
                          ? "border-primary/40 bg-primary/10"
                          : "border-border hover:border-primary/25 hover:bg-muted/50"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2",
                          selected ? "border-primary/40 bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                      <img
                        src={
                          creator.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            creator.name || "creator"
                          )}&backgroundColor=2563eb`
                        }
                        alt=""
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{creator.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {creator.niche} · {formatNumber(creator.linkedin_followers)} followers
                        </span>
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-3">
                        <span className="text-xs text-muted-foreground">{formatCurrency(creator.price_per_post)}</span>
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            match.score >= 85
                              ? "text-success"
                              : match.score >= 70
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {match.score}%
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setStep(4)}>
              {selectedCreators.length > 0
                ? `Simulate with ${selectedCreators.length} creators`
                : "Skip to simulator"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="surface-card p-5">
            <h3 className="mb-1 flex items-center gap-2 font-semibold tracking-tight">
              <BarChart3 aria-hidden="true" className="h-5 w-5 text-primary" />
              Campaign Simulator
            </h3>
            <p className="text-sm text-muted-foreground">
              Estimated outcomes based on selected creators' historical performance data.
            </p>
          </div>

          {selectedCreators.length > 0 ? (
            <CampaignSimulator creators={selectedCreators} budget={form.budget} />
          ) : (
            <div className="surface-card p-8 text-center">
              <p className="text-sm font-semibold">No creators selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Go back to step 3 to select creators for a simulation.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setStep(3)}>
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to creator matching
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(3)}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setStep(5)}>
              Review &amp; create
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="surface-card p-6">
            <h2 className="mb-4 font-semibold tracking-tight">Campaign summary</h2>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Campaign name", value: strategy?.campaign?.campaign_name || form.name },
                { label: "Product", value: form.product },
                { label: "Budget", value: formatCurrency(form.budget) },
                { label: "Objective", value: strategy?.strategy?.objective || form.objective },
                { label: "Target audience", value: strategy?.strategy?.target_audience || form.target_audience },
                { label: "Creators selected", value: String(selectedCreators.length) },
                {
                  label: "Total creator cost",
                  value: formatCurrency(selectedCreators.reduce((s, c) => s + c.price_per_post, 0)),
                },
              ].map((row) => (
                <div key={row.label} className="flex flex-wrap justify-between gap-2">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="max-w-xs text-right font-semibold">{row.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          {selectedCreators.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold tracking-tight">Selected creators</h3>
              <ul className="space-y-2">
                {selectedCreators.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <img
                      src={
                        c.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          c.name || "creator"
                        )}&backgroundColor=2563eb`
                      }
                      alt=""
                      className="h-8 w-8 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.name}</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{c.niche}</span>
                    <span className="text-sm font-semibold tabular-nums">{formatCurrency(c.price_per_post)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strategy?.campaign?.key_messages?.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold tracking-tight">Key messages</h3>
              <ul className="space-y-1.5">
                {strategy.campaign.key_messages.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => setShowSaveTemplate(true)}>
            <Save aria-hidden="true" className="h-4 w-4 text-primary" />
            Save as template
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(4)}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Creating campaign...
                </>
              ) : (
                <>
                  <Rocket aria-hidden="true" className="h-4 w-4" />
                  Launch campaign
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {showTemplateSelector && (
        <TemplateSelector onApply={applyTemplate} onClose={() => setShowTemplateSelector(false)} />
      )}
      {showSaveTemplate && (
        <SaveTemplateModal
          campaignData={{ ...form, ...strategy?.campaign, lead_target: templateData?.lead_target }}
          onClose={() => setShowSaveTemplate(false)}
        />
      )}
    </div>
  );
}
