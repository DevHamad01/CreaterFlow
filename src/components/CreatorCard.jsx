import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, Star, TrendingUp, MousePointerClick, Target } from "lucide-react";

export default function CreatorCard({ creator, fitScore, saved, onToggleSave }) {
  const formatFollowers = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toString();
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link to={`/creators/${creator.id}`} className="flex items-center gap-3 min-w-0">
            <img
              src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}&backgroundColor=2563eb,0ea5e9,6366f1`}
              alt={creator.name}
              className="w-12 h-12 rounded-full bg-slate-100 object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{creator.name}</h3>
                {creator.verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{creator.headline}</p>
            </div>
          </Link>
          {onToggleSave && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleSave(creator.id); }}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${saved ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"}`}
              aria-label={saved ? "Unsave creator" : "Save creator"}
            >
              <Star className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Niche tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{creator.niche}</span>
          {creator.sub_niches?.slice(0, 1).map((s) => (
            <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{s}</span>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-slate-50 rounded-lg py-2">
            <p className="text-sm font-semibold text-slate-900">{formatFollowers(creator.linkedin_followers)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Followers</p>
          </div>
          <div className="bg-slate-50 rounded-lg py-2">
            <p className="text-sm font-semibold text-slate-900">{creator.engagement_rate}%</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Engagement</p>
          </div>
          <div className="bg-slate-50 rounded-lg py-2">
            <p className="text-sm font-semibold text-slate-900">€{creator.price_per_post}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Per post</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{creator.city}, {creator.country}</span>
          </div>
          {fitScore !== undefined && (
            <span className="font-semibold text-emerald-600 flex-shrink-0">{fitScore}% fit</span>
          )}
        </div>
      </div>
    </div>
  );
}