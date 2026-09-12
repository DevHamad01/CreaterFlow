import { useEffect, useState, useMemo } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "@/components/EmptyState";
import MatchScoreBadge from "@/components/intelligence/MatchScoreBadge";
import ComparisonModal from "@/components/intelligence/ComparisonModal";
import { computeCreatorMatch, rankCreatorsForCampaign } from "@/lib/intelligence";
import { Search, SlidersHorizontal, SearchX, Plus, GitCompare, X, Check, Heart } from "lucide-react";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];

export default function CompanyMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("followers");
  const [savedIds, setSavedIds] = useState(new Set());
  const [campaigns, setCampaigns] = useState([]);
  const [addToCampaign, setAddToCampaign] = useState(null);
  const [matchCampaignId, setMatchCampaignId] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);

  useEffect(() => {
    base44.entities.Creator.list("-linkedin_followers", 100).then(setCreators).finally(() => setLoading(false));
    if (user) {
      base44.entities.Favorite.filter({ created_by_id: user.id }).then((favs) => setSavedIds(new Set(favs.map((f) => f.creator_id)))).catch(() => {});
      base44.entities.Campaign.filter({ created_by_id: user.id }).then(setCampaigns).catch(() => {});
    }
  }, [user]);

  const toggleSave = async (creatorId) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (savedIds.has(creatorId)) {
      const favs = await base44.entities.Favorite.filter({ created_by_id: user.id, creator_id: creatorId });
      if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(creatorId); return n; });
    } else {
      await base44.entities.Favorite.create({
        creator_id: creatorId, creator_name: creator.name, creator_avatar: creator.avatar_url,
        creator_niche: creator.niche, creator_headline: creator.headline,
        creator_followers: creator.linkedin_followers, creator_price: creator.price_per_post,
      });
      setSavedIds((prev) => new Set(prev).add(creatorId));
    }
  };

  const addCreatorToCampaign = async (campaignId, creator) => {
    const fitScore = Math.floor(75 + Math.random() * 25);
    const campaign = campaigns.find((c) => c.id === campaignId);
    await base44.entities.CampaignCreator.create({
      campaign_id: campaignId,
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
    setAddToCampaign(null);
    navigate(`/app/campaigns/${campaignId}`);
  };

  const matchCampaign = campaigns.find((c) => c.id === matchCampaignId);

  const filtered = useMemo(() => {
    let result = creators.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.headline?.toLowerCase().includes(search.toLowerCase()) && !c.niche?.toLowerCase().includes(search.toLowerCase())) return false;
      if (niche && c.niche !== niche) return false;
      if (c.linkedin_followers < minFollowers) return false;
      if (c.price_per_post > maxPrice) return false;
      return true;
    });
    if (sortBy === "followers") result.sort((a, b) => b.linkedin_followers - a.linkedin_followers);
    else if (sortBy === "engagement") result.sort((a, b) => b.engagement_rate - a.engagement_rate);
    else if (sortBy === "price_low") result.sort((a, b) => a.price_per_post - b.price_per_post);
    else if (sortBy === "price_high") result.sort((a, b) => b.price_per_post - a.price_per_post);
    else if (sortBy === "match" && matchCampaign) {
      result = rankCreatorsForCampaign(result, matchCampaign).map((r) => r.creator);
    }
    return result;
  }, [creators, search, niche, minFollowers, maxPrice, sortBy, matchCampaign]);

  const toggleSelect = (creatorId) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(creatorId)) n.delete(creatorId);
      else n.add(creatorId);
      return n;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c.id)));
  const clearSelection = () => setSelectedIds(new Set());
  const selectedCreators = creators.filter((c) => selectedIds.has(c.id));

  const bulkSave = async () => {
    for (const creator of selectedCreators) {
      if (savedIds.has(creator.id)) continue;
      await base44.entities.Favorite.create({
        creator_id: creator.id, creator_name: creator.name, creator_avatar: creator.avatar_url,
        creator_niche: creator.niche, creator_headline: creator.headline,
        creator_followers: creator.linkedin_followers, creator_price: creator.price_per_post,
      });
    }
    const favs = await base44.entities.Favorite.filter({ created_by_id: user.id });
    setSavedIds(new Set(favs.map((f) => f.creator_id)));
    setSelectedIds(new Set());
  };

  const bulkInvite = async (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    for (const creator of selectedCreators) {
      const exists = await base44.entities.CampaignCreator.filter({ campaign_id: campaignId, creator_id: creator.id });
      if (exists.length > 0) continue;
      const match = computeCreatorMatch(creator, campaign);
      await base44.entities.CampaignCreator.create({
        campaign_id: campaignId,
        creator_id: creator.id,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url,
        creator_niche: creator.niche,
        creator_followers: creator.linkedin_followers,
        fit_score: match.score,
        price: creator.price_per_post,
        status: "invited",
        tracking_link: `${campaign?.tracking_base_url}/${creator.name.toLowerCase().replace(/\s+/g, "-")}`,
        invited_date: new Date().toISOString().split("T")[0],
      });
    }
    setBulkInviteOpen(false);
    setSelectedIds(new Set());
    navigate(`/app/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Creator marketplace</h1>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} creators available</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={niche} onChange={(e) => setNiche(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">All niches</option>
          {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="followers">Most followers</option>
          <option value="engagement">Highest engagement</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
          {campaigns.length > 0 && <option value="match">Best match</option>}
        </select>
      </div>

      {/* Match campaign selector */}
      {campaigns.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50/50 rounded-xl border border-blue-100 px-4 py-3">
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Match for campaign:</span>
          <select value={matchCampaignId} onChange={(e) => { setMatchCampaignId(e.target.value); if (e.target.value) setSortBy("match"); }} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="">No campaign selected</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {matchCampaignId && (
            <button onClick={() => { setMatchCampaignId(""); setSortBy("followers"); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Selection toolbar with bulk actions */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <button onClick={selectAll} className="text-xs text-blue-300 hover:text-blue-200 underline">Select all ({filtered.length})</button>
          </div>
          <div className="flex gap-2">
            {campaigns.length > 0 && (
              <button onClick={() => setBulkInviteOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500">
                <Plus className="w-3.5 h-3.5" /> Invite to campaign
              </button>
            )}
            <button onClick={bulkSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-medium hover:bg-slate-100">
              <Heart className="w-3.5 h-3.5" /> Save all
            </button>
            <button onClick={() => setShowCompare(true)} disabled={selectedIds.size < 2} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-medium hover:bg-slate-100 disabled:opacity-50">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </button>
            <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-slate-500">Min followers</label>
          <select value={minFollowers} onChange={(e) => setMinFollowers(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1">
            <option value={0}>Any</option>
            <option value={5000}>5K+</option>
            <option value={10000}>10K+</option>
            <option value={20000}>20K+</option>
            <option value={30000}>30K+</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-500">Max price: €{maxPrice}</label>
          <input type="range" min="200" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full mt-3 accent-blue-600" />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="No creators found" description="Try adjusting your filters." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.id} className="relative">
              {/* Bulk selection checkbox */}
              <button
                onClick={() => toggleSelect(c.id)}
                className={`absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedIds.has(c.id) ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 hover:border-blue-400"}`}
                title="Select for bulk actions or comparison"
              >
                {selectedIds.has(c.id) && <Check className="w-3 h-3 text-white" />}
              </button>

              {/* Match score badge */}
              {matchCampaign && (
                <div className="absolute top-3 left-10 z-10">
                  <MatchScoreBadge creator={c} campaign={matchCampaign} />
                </div>
              )}

              <CreatorCard creator={c} saved={savedIds.has(c.id)} onToggleSave={toggleSave} />
              {campaigns.length > 0 && (
                <button
                  onClick={() => setAddToCampaign(c)}
                  className="absolute top-3 right-12 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="Add to campaign"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add to campaign modal */}
      {addToCampaign && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setAddToCampaign(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900 mb-1">Add {addToCampaign.name} to campaign</h3>
            <p className="text-sm text-slate-500 mb-4">Select a campaign to invite this creator.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {campaigns.map((c) => (
                <button key={c.id} onClick={() => addCreatorToCampaign(c.id, addToCampaign)} className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{c.status}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk invite modal */}
      {bulkInviteOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setBulkInviteOpen(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900 mb-1">Invite {selectedIds.size} creators to campaign</h3>
            <p className="text-sm text-slate-500 mb-4">Select a campaign to send bulk invitations. Already-invited creators will be skipped.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {campaigns.map((c) => (
                <button key={c.id} onClick={() => bulkInvite(c.id)} className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{c.status}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparison modal */}
      {showCompare && selectedCreators.length >= 2 && (
        <ComparisonModal
          creators={selectedCreators}
          campaign={matchCampaign}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}