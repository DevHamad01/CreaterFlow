import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge, FitScore } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import CampaignHealthBadge from "@/components/intelligence/CampaignHealthBadge";
import SmartRecommendations from "@/components/intelligence/SmartRecommendations";
import AIContentReview from "@/components/intelligence/AIContentReview";
import CampaignReport from "@/components/intelligence/CampaignReport";
import BudgetRecommendations from "@/components/intelligence/BudgetRecommendations";
import { generateCreatorContentAngles } from "@/lib/campaignAi";
import {
  ArrowLeft, Users, FileText, BarChart3, Target, Plus,
  Search, Check, X, MessageSquare, Loader2, ExternalLink,
  TrendingUp, MousePointerClick, Wallet, Sparkles, Lightbulb
} from "lucide-react";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

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
  const [tab, setTab] = useState("creators");
  const [showInvite, setShowInvite] = useState(false);
  const [allCreators, setAllCreators] = useState([]);
  const [search, setSearch] = useState("");
  const [reviewingPost, setReviewingPost] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [aiReviewingPost, setAiReviewingPost] = useState(null);
  const [contentAngles, setContentAngles] = useState([]);
  const [loadingAngles, setLoadingAngles] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Campaign.get(id),
      base44.entities.CampaignCreator.filter({ campaign_id: id }),
      base44.entities.Post.filter({ campaign_id: id }),
      base44.entities.CampaignMetric.filter({ campaign_id: id }),
      base44.entities.Lead.filter({ campaign_id: id }, "-date"),
      base44.entities.Payment.filter({ campaign_id: id }),
    ]).then(([c, cc, p, m, l, pay]) => {
      setCampaign(c); setCampaignCreators(cc); setPosts(p); setMetrics(m); setLeads(l); setPayments(pay);
    }).finally(() => setLoading(false));
  }, [id]);

  const loadCreators = async () => {
    const c = await base44.entities.Creator.list("-linkedin_followers", 50);
    setAllCreators(c);
  };

  const inviteCreator = async (creator) => {
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
    setCampaignCreators(cc);
    setShowInvite(false);
  };

  const reviewPost = async (post, action) => {
    const updates = action === "approve"
      ? { status: "approved", feedback: feedback || "Approved" }
      : { status: "revision_requested", feedback: feedback || "Please revise" };

    await base44.entities.Post.update(post.id, updates);
    // Update campaign creator status
    if (action === "approve") {
      await base44.entities.CampaignCreator.update(post.campaign_creator_id, { status: "approved" });
    } else {
      await base44.entities.CampaignCreator.update(post.campaign_creator_id, { status: "revision_requested" });
    }
    const p = await base44.entities.Post.filter({ campaign_id: id });
    setPosts(p);
    const cc = await base44.entities.CampaignCreator.filter({ campaign_id: id });
    setCampaignCreators(cc);
    setReviewingPost(null);
    setFeedback("");
  };

  const updateCampaignStatus = async (newStatus) => {
    await base44.entities.Campaign.update(id, { status: newStatus });
    setCampaign({ ...campaign, status: newStatus });
  };

  const loadContentAngles = async () => {
    if (contentAngles.length > 0 || loadingAngles) return;
    setLoadingAngles(true);
    try {
      const result = await generateCreatorContentAngles(campaignCreators, campaign);
      setContentAngles(result.angles || []);
    } catch (err) {
      // silent fail — angles are optional
    } finally {
      setLoadingAngles(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-64" /><div className="h-64 bg-slate-100 rounded-2xl" /></div>;
  if (!campaign) return <EmptyState title="Campaign not found" />;

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

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/app/campaigns")} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
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
            <p className="text-slate-600">{campaign.objective}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
              <span>Budget: €{campaign.budget?.toLocaleString() || 0}</span>
              <span>Product: {campaign.product}</span>
              {campaign.start_date && <span>Start: {campaign.start_date}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <button onClick={() => updateCampaignStatus("recruiting")} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Start recruiting
              </button>
            )}
            {campaign.status === "recruiting" && (
              <button onClick={() => updateCampaignStatus("active")} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Activate campaign
              </button>
            )}
            {campaign.status === "active" && (
              <button onClick={() => updateCampaignStatus("live")} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                Mark as live
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Creators", value: campaignCreators.length, icon: Users, color: "text-blue-600" },
          { label: "Impressions", value: totalImpressions.toLocaleString(), icon: TrendingUp, color: "text-purple-600" },
          { label: "Clicks", value: totalClicks, icon: MousePointerClick, color: "text-emerald-600" },
          { label: "Leads", value: totalLeads, icon: Target, color: "text-amber-600" },
          { label: "Spend", value: `€${totalSpend.toLocaleString()}`, icon: Wallet, color: "text-slate-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-lg font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Smart Recommendations */}
      {["active", "recruiting", "review", "live"].includes(campaign.status) && allCreators.length > 0 && (
        <SmartRecommendations
          campaign={campaign}
          campaignCreators={campaignCreators}
          allCreators={allCreators}
          metrics={metrics}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "creators" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Assigned creators</h2>
            <button onClick={() => { setShowInvite(true); loadCreators(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
              <Plus className="w-4 h-4" /> Invite creators
            </button>
          </div>

          {campaignCreators.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200">
              <EmptyState icon={Users} title="No creators yet" description="Invite creators from the marketplace to join this campaign." action={<button onClick={() => { setShowInvite(true); loadCreators(); }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Invite creators</button>} />
            </div>
          ) : (
            <div className="space-y-2">
              {campaignCreators.map((cc) => (
                <div key={cc.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <img src={cc.creator_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${cc.creator_name}&backgroundColor=2563eb`} alt="" className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/creators/${cc.creator_id}`} className="font-medium text-slate-900 hover:text-blue-600">{cc.creator_name}</Link>
                    <p className="text-xs text-slate-500">{cc.creator_niche} · {cc.creator_followers?.toLocaleString()} followers · €{cc.price}</p>
                  </div>
                  <FitScore score={cc.fit_score} />
                  <StatusBadge status={cc.status} />
                </div>
              ))}
            </div>
          )}

          {/* Invite modal */}
          {showInvite && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Invite creators</h3>
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search creators..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {allCreators.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.niche?.toLowerCase().includes(search.toLowerCase())).map((c) => {
                    const already = campaignCreators.some((cc) => cc.creator_id === c.id);
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                        <img src={c.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=2563eb`} alt="" className="w-9 h-9 rounded-full bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.niche} · €{c.price_per_post}/post</p>
                        </div>
                        {already ? (
                          <span className="text-xs text-slate-400">Invited</span>
                        ) : (
                          <button onClick={() => inviteCreator(c)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Invite</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "brief" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Objective</h3>
            <p className="text-sm text-slate-700">{campaign.objective}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Target audience</h3>
            <p className="text-sm text-slate-700">{campaign.target_audience}</p>
          </div>
          {campaign.key_messages?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Key messages</h3>
              <ul className="space-y-1.5">
                {campaign.key_messages.map((m, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {m}</li>)}
              </ul>
            </div>
          )}
          {campaign.creator_guidelines && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Creator guidelines</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{campaign.creator_guidelines}</p>
            </div>
          )}
          {campaign.content_direction && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Content direction</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{campaign.content_direction}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Tracking</h3>
            <p className="text-sm text-slate-700 font-mono bg-slate-50 px-3 py-2 rounded-lg">{campaign.tracking_base_url}</p>
          </div>

          {/* Creator-specific content angles */}
          {campaignCreators.length > 0 && (
            <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/50 rounded-2xl border border-violet-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Creator-specific content angles</h3>
                </div>
                <button
                  onClick={loadContentAngles}
                  disabled={loadingAngles}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {loadingAngles ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {contentAngles.length > 0 ? "Regenerate" : "Generate angles"}
                </button>
              </div>
              {contentAngles.length > 0 ? (
                <div className="space-y-3">
                  {contentAngles.map((angle, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 text-sm">{angle.creator_name}</span>
                        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{angle.angle_name}</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{angle.angle_description}</p>
                      {angle.suggested_hook && (
                        <p className="text-xs text-slate-500 italic mb-2">Hook: &quot;{angle.suggested_hook}&quot;</p>
                      )}
                      {angle.key_talking_points?.length > 0 && (
                        <ul className="space-y-1">
                          {angle.key_talking_points.map((pt, j) => (
                            <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" /> {pt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Generate unique content angles for each creator based on their niche, audience, and expertise. No two creators get identical instructions.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "drafts" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200">
              <EmptyState icon={MessageSquare} title="No drafts yet" description="Creator drafts will appear here for your review." />
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{post.creator_name}</span>
                    <StatusBadge status={post.status} />
                  </div>
                  {post.published_date && <span className="text-xs text-slate-500">Published: {post.published_date}</span>}
                  {post.scheduled_date && <span className="text-xs text-slate-500">Scheduled: {post.scheduled_date}</span>}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3 line-clamp-4">{post.content}</p>
                {post.post_url && (
                  <a href={post.post_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mb-3">
                    <ExternalLink className="w-3 h-3" /> View live post
                  </a>
                )}
                {post.feedback && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                    <span className="font-medium">Feedback:</span> {post.feedback}
                  </div>
                )}
                {(post.status === "submitted" || post.status === "in_review") && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => setAiReviewingPost(post)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100">
                      <Sparkles className="w-4 h-4" /> AI Review
                    </button>
                    <button onClick={() => setReviewingPost(post)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Review & feedback
                    </button>
                    <button onClick={() => reviewPost(post, "approve")} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => reviewPost(post, "reject")} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 flex items-center gap-1">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Review modal */}
          {reviewingPost && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setReviewingPost(null)}>
              <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold text-slate-900 mb-2">Review draft from {reviewingPost.creator_name}</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">{reviewingPost.content}</p>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter feedback for the creator..." rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-4 resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => setReviewingPost(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={() => reviewPost(reviewingPost, "approve")} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Approve with feedback</button>
                  <button onClick={() => reviewPost(reviewingPost, "reject")} className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">Request revision</button>
                </div>
              </div>
            </div>
          )}

          {/* AI Content Review modal */}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Impressions", value: totalImpressions.toLocaleString(), icon: TrendingUp },
              { label: "Clicks", value: totalClicks, icon: MousePointerClick },
              { label: "Leads", value: totalLeads, icon: Target },
              { label: "Pipeline", value: `€${(totalPipeline / 1000).toFixed(1)}K`, icon: Wallet },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <s.icon className="w-4 h-4 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Funnel chart */}
          {metrics.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Per-creator performance bar chart */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2">
                <h3 className="font-semibold text-slate-900 mb-4">Per-creator performance</h3>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>

              {/* Lead status pie chart */}
              {leads.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Lead breakdown</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={["new", "qualified", "contacted", "converted", "lost"].map((status) => ({
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
                        {["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Trend area chart */}
          {metrics.length > 0 && metrics.some((m) => m.date) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Performance trend over time</h3>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="clicks" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="leads" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Creator performance</h3>
            {metrics.length === 0 ? (
              <EmptyState icon={BarChart3} title="No analytics yet" description="Performance data will appear once posts go live." />
            ) : (
              <div className="space-y-2">
                {metrics.map((m) => {
                  const cc = campaignCreators.find((c) => c.creator_id === m.creator_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-900">{cc?.creator_name || "Creator"}</span>
                      <div className="flex gap-6 text-sm">
                        <span className="text-slate-600">{m.impressions?.toLocaleString()} <span className="text-xs text-slate-400">impr</span></span>
                        <span className="text-slate-600">{m.clicks} <span className="text-xs text-slate-400">clicks</span></span>
                        <span className="text-slate-600">{m.leads} <span className="text-xs text-slate-400">leads</span></span>
                        <span className="font-medium text-slate-900">€{m.pipeline_value?.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            <div className="bg-white rounded-2xl border border-slate-200">
              <EmptyState icon={Target} title="No leads yet" description="Leads from your campaign posts will appear here." />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Contact</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Company</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Creator</th>
                      <th className="text-right px-4 py-3 font-medium">Value</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{l.contact_name}</p>
                          <p className="text-xs text-slate-500">{l.title}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{l.company_name}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-slate-600">{l.creator_name}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">€{l.value?.toLocaleString()}</td>
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
            <div className="bg-white rounded-2xl border border-slate-200">
              <EmptyState icon={Wallet} title="No payments yet" description="Creator payments will appear here once posts are live." />
            </div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{p.creator_name}</p>
                  <p className="text-xs text-slate-500">{p.invoice_number || "Pending invoice"} · Due {p.due_date || "TBD"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">€{p.amount}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))
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
  );
}