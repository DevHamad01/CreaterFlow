import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { generateCampaignStrategy } from "@/lib/campaignAi";
import { computeCreatorMatch, rankCreatorsForCampaign, formatNumber, formatCurrency } from "@/lib/intelligence";
import CampaignSimulator from "@/components/intelligence/CampaignSimulator";
import { TemplateSelector, SaveTemplateModal } from "@/components/TemplateSelector";
import {
  Sparkles, Loader2, ArrowRight, ArrowLeft, Check, Target,
  Users, FileText, BarChart3, Lightbulb, MapPin, Wallet,
  Search, Star, AlertCircle, Rocket, TrendingUp, FolderOpen, Save
} from "lucide-react";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];
const OBJECTIVES = ["Brand awareness", "Lead generation", "Product launch", "Thought leadership", "Trial signups", "Event promotion", "Content amplification"];

export default function NewCampaign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [allCreators, setAllCreators] = useState([]);
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
  };

  // Load creators for matching step
  useEffect(() => {
    if (step === 3 && allCreators.length === 0) {
      base44.entities.Creator.list("-linkedin_followers", 100).then(setAllCreators);
    }
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

      navigate(`/app/campaigns/${campaign.id}`);
    } catch (err) {
      alert("Failed to create campaign: " + (err.message || "Unknown error"));
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate("/app/campaigns")} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </button>
        <h1 className="text-2xl font-bold text-slate-900">AI Campaign Copilot</h1>
        <p className="text-sm text-slate-500 mt-1">From strategy to creator selection — powered by AI</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${s.num <= step ? "text-blue-600" : "text-slate-400"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${s.num <= step ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                {s.num < step ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${s.num < step ? "bg-blue-600" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Campaign basics</h2>
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
            >
              <FolderOpen className="w-4 h-4" /> Use template
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Product or service *</label>
            <input value={form.product} onChange={(e) => update("product", e.target.value)} placeholder="e.g. Lemlist AI Outreach" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Website</label>
              <input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="company.com" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Industry</label>
              <input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="SaaS, Fintech..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Campaign objective *</label>
            <select value={form.objective} onChange={(e) => update("objective", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select objective...</option>
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Ideal customer profile (ICP) *</label>
            <input value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)} placeholder="VP Sales at B2B SaaS companies" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Geography</label>
              <input value={form.geography} onChange={(e) => update("geography", e.target.value)} placeholder="US, Europe, Global..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Budget (€) *</label>
              <input type="number" value={form.budget} onChange={(e) => update("budget", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Lead target (optional)</label>
            <input type="number" value={form.lead_target} onChange={(e) => update("lead_target", Number(e.target.value))} placeholder="e.g. 50" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-slate-400 mt-1">Set a goal to trigger automatic notifications when you hit 50% and 100% of this target</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Desired outcome *</label>
            <input value={form.desired_outcome} onChange={(e) => update("desired_outcome", e.target.value)} placeholder="Free trial signups" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Key message (optional)</label>
            <textarea value={form.keyMessage} onChange={(e) => update("keyMessage", e.target.value)} rows={2} placeholder="The main message you want creators to convey..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">End date</label>
              <input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!form.product || !form.objective || !form.target_audience || !form.desired_outcome}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Generate AI strategy <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: AI Strategy */}
      {step === 2 && (
        <div className="space-y-4">
          {!strategy && (
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Campaign Strategist</h2>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Our AI will analyze your inputs and generate a complete campaign strategy: positioning, creator requirements, brief, key messages, and measurement plan.
              </p>
              <button
                onClick={generateStrategy}
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing & generating strategy...</> : <><Sparkles className="w-4 h-4" /> Generate campaign strategy</>}
              </button>
              {genError && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{genError}</p>
                </div>
              )}
            </div>
          )}

          {strategy && (
            <>
              {/* Strategy section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Campaign Strategy</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Objective</p>
                    <p className="text-slate-900">{strategy.strategy?.objective}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Positioning</p>
                    <p className="text-slate-700">{strategy.strategy?.positioning}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Campaign type</p>
                      <p className="text-slate-900">{strategy.strategy?.campaign_type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Duration</p>
                      <p className="text-slate-900">{strategy.strategy?.estimated_duration}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator requirements */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-violet-600" />
                  <h3 className="font-semibold text-slate-900">Creator Requirements</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {strategy.creator_requirements?.recommended_niches?.map((n) => (
                      <span key={n} className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">{n}</span>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Audience characteristics</p>
                    <p className="text-slate-700">{strategy.creator_requirements?.audience_characteristics}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Creator size</p>
                      <p className="text-slate-900">{strategy.creator_requirements?.creator_size}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Recommended count</p>
                      <p className="text-slate-900">{strategy.creator_requirements?.estimated_creators} creators</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign brief */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">Campaign Brief</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-700 leading-relaxed">{strategy.campaign?.brief}</p>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-2">Key messages</p>
                    <ul className="space-y-1.5">
                      {strategy.campaign?.key_messages?.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Creator guidelines</p>
                    <p className="text-slate-700">{strategy.campaign?.creator_guidelines}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Call to action</p>
                    <p className="text-slate-900 font-medium">{strategy.campaign?.cta}</p>
                  </div>
                </div>
              </div>

              {/* Measurement */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-slate-900">Measurement Plan</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Tracking strategy</p>
                    <p className="text-slate-700">{strategy.measurement?.tracking_strategy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-2">Recommended KPIs</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.measurement?.recommended_kpis?.map((kpi) => (
                        <span key={kpi} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">{kpi}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Attribution approach</p>
                    <p className="text-slate-700">{strategy.measurement?.attribution_approach}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  Find matching creators <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Creator Matching */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">Intelligent Creator Matching</h3>
              <span className="text-sm text-slate-500">{selectedCreators.length} selected</span>
            </div>
            <p className="text-sm text-slate-500">Creators are ranked by match score based on audience fit, niche, engagement, and historical performance.</p>
          </div>

          {allCreators.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {rankedCreators.map(({ creator, match }) => {
                const selected = selectedCreators.find((c) => c.id === creator.id);
                return (
                  <div
                    key={creator.id}
                    onClick={() => toggleCreator(creator)}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all flex items-center gap-3 ${selected ? "border-blue-500 bg-blue-50/30" : "border-transparent border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <img
                      src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}&backgroundColor=2563eb`}
                      alt={creator.name}
                      className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{creator.name}</p>
                      <p className="text-xs text-slate-500 truncate">{creator.niche} · {formatNumber(creator.linkedin_followers)} followers</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-500">{formatCurrency(creator.price_per_post)}</span>
                      <span className={`text-sm font-bold ${match.score >= 85 ? "text-emerald-600" : match.score >= 70 ? "text-blue-600" : "text-slate-600"}`}>
                        {match.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {selectedCreators.length > 0 ? `Simulate with ${selectedCreators.length} creators` : "Skip to review"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Simulator */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Campaign Simulator</h3>
            </div>
            <p className="text-sm text-slate-500">Estimated outcomes based on selected creators' historical performance data.</p>
          </div>

          {selectedCreators.length > 0 ? (
            <CampaignSimulator creators={selectedCreators} budget={form.budget} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">No creators selected. Go back to select creators for simulation.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(5)} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 flex items-center justify-center gap-2">
              Review & create <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Campaign summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Campaign name</dt><dd className="font-medium text-slate-900 text-right">{strategy?.campaign?.campaign_name || form.name}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Product</dt><dd className="font-medium text-slate-900 text-right">{form.product}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Budget</dt><dd className="font-medium text-slate-900">{formatCurrency(form.budget)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Objective</dt><dd className="font-medium text-slate-900 text-right max-w-xs">{strategy?.strategy?.objective || form.objective}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Target audience</dt><dd className="font-medium text-slate-900 text-right max-w-xs">{strategy?.strategy?.target_audience || form.target_audience}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Creators selected</dt><dd className="font-medium text-slate-900">{selectedCreators.length}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Total creator cost</dt><dd className="font-medium text-slate-900">{formatCurrency(selectedCreators.reduce((s, c) => s + c.price_per_post, 0))}</dd></div>
            </dl>
          </div>

          {selectedCreators.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Selected creators</h3>
              <div className="space-y-2">
                {selectedCreators.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <img src={c.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=2563eb`} alt="" className="w-8 h-8 rounded-full bg-slate-100" />
                    <span className="text-sm font-medium text-slate-900 flex-1">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.niche}</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(c.price_per_post)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strategy?.campaign?.key_messages && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Key messages</h3>
              <ul className="space-y-1.5">
                {strategy.campaign.key_messages.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setShowSaveTemplate(true)}
            className="w-full py-2.5 rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" /> Save as template
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating campaign...</> : <><Rocket className="w-4 h-4" /> Launch campaign</>}
            </button>
          </div>
        </div>
      )}

      {/* Template modals */}
      {showTemplateSelector && (
        <TemplateSelector onApply={applyTemplate} onClose={() => setShowTemplateSelector(false)} />
      )}
      {showSaveTemplate && (
        <SaveTemplateModal campaignData={{ ...form, ...strategy?.campaign, lead_target: templateData?.lead_target }} onClose={() => setShowSaveTemplate(false)} />
      )}
    </div>
  );
}