import { useEffect, useState, useMemo } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "@/components/EmptyState";
import { Search, SlidersHorizontal, X, SearchX } from "lucide-react";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];
const AVAILABILITY = ["available", "limited", "booked"];

export default function Marketplace() {
  const { user } = useAuth();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [availability, setAvailability] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("followers");
  const [savedIds, setSavedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    base44.entities.Creator.list("-linkedin_followers", 100)
      .then(setCreators)
      .finally(() => setLoading(false));

    if (user) {
      base44.entities.Favorite.filter({ created_by_id: user.id })
        .then((favs) => setSavedIds(new Set(favs.map((f) => f.creator_id))))
        .catch(() => {});
    }
  }, [user]);

  const toggleSave = async (creatorId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const creator = creators.find((c) => c.id === creatorId);
    if (savedIds.has(creatorId)) {
      const favs = await base44.entities.Favorite.filter({ created_by_id: user.id, creator_id: creatorId });
      if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(creatorId); return n; });
    } else {
      await base44.entities.Favorite.create({
        creator_id: creatorId,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url,
        creator_niche: creator.niche,
        creator_headline: creator.headline,
        creator_followers: creator.linkedin_followers,
        creator_price: creator.price_per_post,
      });
      setSavedIds((prev) => new Set(prev).add(creatorId));
    }
  };

  const filtered = useMemo(() => {
    let result = creators.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.headline?.toLowerCase().includes(search.toLowerCase()) && !c.niche?.toLowerCase().includes(search.toLowerCase())) return false;
      if (niche && c.niche !== niche) return false;
      if (availability && c.availability !== availability) return false;
      if (c.linkedin_followers < minFollowers) return false;
      if (c.price_per_post > maxPrice) return false;
      return true;
    });

    if (sortBy === "followers") result.sort((a, b) => b.linkedin_followers - a.linkedin_followers);
    else if (sortBy === "engagement") result.sort((a, b) => b.engagement_rate - a.engagement_rate);
    else if (sortBy === "price_low") result.sort((a, b) => a.price_per_post - b.price_per_post);
    else if (sortBy === "price_high") result.sort((a, b) => b.price_per_post - a.price_per_post);

    return result;
  }, [creators, search, niche, availability, minFollowers, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearch(""); setNiche(""); setAvailability(""); setMinFollowers(0); setMaxPrice(2000);
  };

  const hasFilters = search || niche || availability || minFollowers > 0 || maxPrice < 2000;

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="bg-gradient-to-b from-sky-50/50 to-white py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Creator marketplace</h1>
          <p className="mt-2 text-slate-600">Browse {creators.length}+ vetted B2B creators. Filter by niche, audience, and price.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        {/* Search & sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search creators, niches, headlines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="followers">Most followers</option>
            <option value="engagement">Highest engagement</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700">Clear all</button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Niche</label>
                  <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    <option value="">All niches</option>
                    {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Availability</label>
                  <div className="space-y-1.5">
                    <button onClick={() => setAvailability("")} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${availability === "" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"}`}>All</button>
                    {AVAILABILITY.map((a) => (
                      <button key={a} onClick={() => setAvailability(a)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize ${availability === a ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"}`}>{a}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Min followers</label>
                  <select value={minFollowers} onChange={(e) => setMinFollowers(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    <option value={0}>Any</option>
                    <option value={5000}>5K+</option>
                    <option value={10000}>10K+</option>
                    <option value={20000}>20K+</option>
                    <option value={30000}>30K+</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Max price: €{maxPrice}</label>
                  <input type="range" min="200" max="2000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{filtered.length} creators found</p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200" />
                      <div className="space-y-2 flex-1"><div className="h-3 bg-slate-200 rounded w-24" /><div className="h-2 bg-slate-200 rounded w-32" /></div>
                    </div>
                    <div className="h-16 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={SearchX} title="No creators found" description="Try adjusting your filters or search query." action={<button onClick={clearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-700">Clear filters</button>} />
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((c) => (
                  <CreatorCard key={c.id} creator={c} saved={savedIds.has(c.id)} onToggleSave={toggleSave} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}