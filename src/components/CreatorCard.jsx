import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, Star } from "lucide-react";

/**
 * @typedef {object} CreatorCardProps
 * @property {any} creator
 * @property {number} [fitScore]
 * @property {boolean} [saved]
 * @property {(id: any) => void} [onToggleSave]
 */

/** @param {CreatorCardProps} props */
export default function CreatorCard({ creator, fitScore, saved, onToggleSave }) {
  const formatFollowers = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toString();
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card card-lift">
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link to={`/creators/${creator.id}`} className="flex items-center gap-3 min-w-0">
            <img
              src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}&backgroundColor=2563eb,0ea5e9,6366f1`}
              alt={creator.name}
              className="w-12 h-12 rounded-full bg-muted object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{creator.name}</h3>
                {creator.verified && (
                  <>
                    <BadgeCheck aria-hidden="true" className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="sr-only">Verified creator</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{creator.headline}</p>
            </div>
          </Link>
          {onToggleSave && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleSave(creator.id); }}
              className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${saved ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              aria-label={saved ? "Unsave creator" : "Save creator"}
            >
              <Star className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Niche tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{creator.niche}</span>
          {creator.sub_niches?.slice(0, 1).map((s) => (
            <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{s}</span>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-muted rounded-lg py-2">
            <p className="text-sm font-semibold text-foreground">{formatFollowers(creator.linkedin_followers)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Followers</p>
          </div>
          <div className="bg-muted rounded-lg py-2">
            <p className="text-sm font-semibold text-foreground">{creator.engagement_rate}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Engagement</p>
          </div>
          <div className="bg-muted rounded-lg py-2">
            <p className="text-sm font-semibold text-foreground">€{creator.price_per_post}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Per post</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin aria-hidden="true" className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{creator.city}, {creator.country}</span>
          </div>
          {fitScore !== undefined && (
            <span className="font-semibold text-success flex-shrink-0">{fitScore}% fit</span>
          )}
        </div>
      </div>
    </div>
  );
}