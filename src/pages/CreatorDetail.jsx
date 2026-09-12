import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { FitScore } from "@/components/StatusBadge";
import {
  MapPin, BadgeCheck, Star, Globe, TrendingUp, MousePointerClick,
  Target, ArrowLeft, Heart, MessageSquare, Users, Award
} from "lucide-react";

export default function CreatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    base44.entities.Creator.get(id)
      .then(setCreator)
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));

    if (user) {
      base44.entities.Favorite.filter({ created_by_id: user.id, creator_id: id })
        .then((favs) => setSaved(favs.length > 0))
        .catch(() => {});
    }
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) { navigate("/login"); return; }
    if (saved) {
      const favs = await base44.entities.Favorite.filter({ created_by_id: user.id, creator_id: id });
      if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
      setSaved(false);
    } else {
      await base44.entities.Favorite.create({
        creator_id: id,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url,
        creator_niche: creator.niche,
        creator_headline: creator.headline,
        creator_followers: creator.linkedin_followers,
        creator_price: creator.price_per_post,
      });
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-5 py-20 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-32 mb-6" />
          <div className="h-48 bg-slate-100 rounded-2xl mb-6" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Creator not found</h1>
          <Link to="/marketplace" className="mt-4 inline-block text-blue-600">← Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const formatNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : n.toString();

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        {/* Header card */}
        <div className="bg-gradient-to-b from-sky-50/60 to-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}&backgroundColor=2563eb,0ea5e9,6366f1`}
              alt={creator.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{creator.name}</h1>
                {creator.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-slate-600">{creator.headline}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{creator.city}, {creator.country}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />{creator.rating} ({creator.reviews_count} reviews)</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{creator.total_campaigns} campaigns</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="text-center bg-white rounded-xl border border-slate-200 px-5 py-3">
                <p className="text-2xl font-bold text-slate-900">€{creator.price_per_post}</p>
                <p className="text-xs text-slate-500">per sponsored post</p>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleSave} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${saved ? "bg-blue-50 text-blue-700 border border-blue-200" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
                </button>
                <button onClick={() => user ? navigate("/app/campaigns/new") : navigate("/signup")} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800">
                  Start campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: bio & performance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3">About</h2>
              <p className="text-slate-600 leading-relaxed">{creator.bio}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Average performance per post</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{formatNum(creator.avg_impressions)}</p>
                  <p className="text-xs text-slate-500">Impressions</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <MousePointerClick className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{creator.avg_clicks}</p>
                  <p className="text-xs text-slate-500">Clicks</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Target className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{creator.avg_leads}</p>
                  <p className="text-xs text-slate-500">Leads</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Sub-niches & expertise</h2>
              <div className="flex flex-wrap gap-2">
                {creator.sub_niches?.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: audience info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Audience</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Audience type</p>
                  <p className="text-sm font-medium text-slate-900">{creator.audience_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Followers</p>
                  <p className="text-sm font-medium text-slate-900">{formatNum(creator.linkedin_followers)} on LinkedIn</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Engagement rate</p>
                  <p className="text-sm font-medium text-slate-900">{creator.engagement_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Audience industries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.audience_industries?.map((ind) => (
                      <span key={ind} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">{ind}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Geography</p>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.audience_geography?.map((geo) => (
                      <span key={geo} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">{geo}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.languages?.map((lang) => (
                      <span key={lang} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Availability</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${creator.availability === "available" ? "bg-emerald-500" : creator.availability === "limited" ? "bg-amber-500" : "bg-red-500"}`} />
                <span className="text-sm font-medium text-slate-900 capitalize">{creator.availability}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {creator.availability === "available" ? "Ready to take on new campaigns" : creator.availability === "limited" ? "Few slots remaining this month" : "Fully booked this month"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}