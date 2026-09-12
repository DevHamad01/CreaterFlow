import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { FitScore } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Megaphone, Check, X, Loader2 } from "lucide-react";

export default function Opportunities() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [myCollabs, setMyCollabs] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Campaign.filter({ status: "recruiting" }, "-created_date", 20),
      base44.entities.Campaign.filter({ status: "active" }, "-created_date", 20),
      base44.entities.CampaignCreator.list(),
      base44.entities.Creator.list(),
    ]).then(([recruiting, active, myCc, allCreators]) => {
      setCampaigns([...recruiting, ...active]);
      const creatorName = user.full_name || "";
      setMyCollabs(myCc.filter((cc) => cc.creator_name === creatorName));
      setMyProfile(allCreators.find((c) => c.name === creatorName) || null);
    }).finally(() => setLoading(false));
  }, [user]);

  const hasApplied = (campaignId) => myCollabs.some((cc) => cc.campaign_id === campaignId);

  const acceptOpportunity = async (campaign) => {
    setActing(campaign.id);
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
    setMyCollabs(myCc.filter((cc) => cc.creator_name === creatorName));
    setActing(null);
  };

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-slate-200 rounded w-48" />{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}</div>;

  const available = campaigns.filter((c) => !hasApplied(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">Brand campaigns looking for creators like you</p>
      </div>

      {available.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={Megaphone} title="No opportunities available" description="New brand campaigns will appear here when they start recruiting creators." />
        </div>
      ) : (
        <div className="space-y-4">
          {available.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{c.name}</h3>
                    <FitScore score={Math.floor(80 + Math.random() * 18)} />
                  </div>
                  <p className="text-sm text-slate-500">{c.company_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-slate-900">€{myProfile?.price_per_post || 800}</p>
                  <p className="text-xs text-slate-500">per post</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{c.objective}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                <span>Target: {c.target_audience}</span>
                {c.start_date && <span>Starts: {c.start_date}</span>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => acceptOpportunity(c)}
                  disabled={acting === c.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                >
                  {acting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Accept deal
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                  <X className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}