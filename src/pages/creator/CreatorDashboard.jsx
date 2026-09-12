import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import {
  Megaphone, Wallet, TrendingUp, PenSquare,
  ArrowRight, MessageSquare, CheckCircle2
} from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaignCreators, setCampaignCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.CampaignCreator.list("-created_date", 50),
      base44.entities.Campaign.list("-created_date", 50),
      base44.entities.Post.list("-created_date", 50),
      base44.entities.Payment.list("-created_date", 50),
    ]).then(([cc, camps, p, pay]) => {
      const creatorName = user.full_name || "";
      setCampaignCreators(cc.filter((c) => c.creator_name === creatorName));
      setCampaigns(camps);
      setPosts(p.filter((p) => p.creator_name === creatorName));
      setPayments(pay.filter((p) => p.creator_name === creatorName));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}</div></div>;

  const activeCampaigns = campaignCreators.filter((cc) => ["invited", "accepted", "draft_submitted", "in_review", "approved", "scheduled", "live"].includes(cc.status)).length;
  const totalEarnings = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingEarnings = payments.filter((p) => p.status === "pending" || p.status === "scheduled").reduce((s, p) => s + p.amount, 0);
  const draftsPending = posts.filter((p) => p.status === "submitted" || p.status === "in_review").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your creator dashboard.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active deals" value={activeCampaigns} icon={Megaphone} accent="blue" />
        <StatCard label="Total earned" value={`€${totalEarnings.toLocaleString()}`} icon={Wallet} accent="emerald" />
        <StatCard label="Pending" value={`€${pendingEarnings.toLocaleString()}`} icon={TrendingUp} accent="amber" />
        <StatCard label="Drafts to review" value={draftsPending} icon={MessageSquare} accent="purple" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/app/opportunities" className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Megaphone className="w-5 h-5 text-blue-600" /></div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Find opportunities</h3>
          <p className="text-sm text-slate-500 mt-1">Browse brand campaigns looking for creators</p>
        </Link>
        <Link to="/app/profile" className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3"><PenSquare className="w-5 h-5 text-purple-600" /></div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Edit profile</h3>
          <p className="text-sm text-slate-500 mt-1">Update your niche, audience, and pricing</p>
        </Link>
      </div>

      {/* Active collaborations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your collaborations</h2>
          <Link to="/app/my-campaigns" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        {campaignCreators.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState icon={Megaphone} title="No collaborations yet" description="Browse opportunities and accept your first brand deal." action={<button onClick={() => navigate("/app/opportunities")} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Find opportunities</button>} />
          </div>
        ) : (
          <div className="space-y-3">
            {campaignCreators.slice(0, 5).map((cc) => {
              const camp = campaigns.find((c) => c.id === cc.campaign_id);
              return (
                <div key={cc.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{camp?.name || "Campaign"}</p>
                    <p className="text-xs text-slate-500">{camp?.company_name || "—"} · €{cc.price} · Fit {cc.fit_score}%</p>
                  </div>
                  <StatusBadge status={cc.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}