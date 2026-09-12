import { useState, useMemo } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { computeCreatorMatch, formatNumber, formatCurrency } from "@/lib/intelligence";
import { X, Check, Users, TrendingUp, MousePointerClick, Target, Wallet, GitCompare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];

/**
 * Creator Comparison Modal — Differentiator #3
 * 
 * Allows selecting multiple creators and comparing them side-by-side.
 * Compare: audience, followers, engagement, industry, match score, price, 
 * historical performance, estimated campaign outcome, availability.
 * 
 * Props: creators (array of creator objects), campaign (optional, for match scoring)
 */
export default function ComparisonModal({ creators, campaign, onClose }) {
  const navigate = useNavigate();

  const comparisons = useMemo(() => {
    return creators.map((creator) => ({
      creator,
      match: campaign ? computeCreatorMatch(creator, campaign) : null,
    }));
  }, [creators, campaign]);

  const bestMatch = comparisons.reduce((best, c) => {
    if (!c.match) return best;
    if (!best || c.match.score > best.match?.score) return c;
    return best;
  }, null);

  const bestPrice = creators.reduce((min, c) =>
    !min || c.price_per_post < min.price_per_post ? c : min, null);

  const bestFollowers = creators.reduce((max, c) =>
    !max || c.linkedin_followers > max.linkedin_followers ? c : null);

  const bestEngagement = creators.reduce((max, c) =>
    !max || c.engagement_rate > max.engagement_rate ? c : null);

  const Row = ({ label, render, highlight }) => (
    <div className={`flex border-b border-slate-100 ${highlight ? "bg-blue-50/30" : ""}`}>
      <div className="w-32 flex-shrink-0 px-4 py-3 text-xs font-medium text-slate-500 border-r border-slate-100">
        {label}
      </div>
      {comparisons.map(({ creator, match }) => (
        <div key={creator.id} className="flex-1 px-4 py-3 text-sm text-slate-900 min-w-0">
          {render(creator, match)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Compare creators</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Header row with avatars */}
          <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="w-32 flex-shrink-0 px-4 py-4 border-r border-slate-100">
              <span className="text-xs font-medium text-slate-400 uppercase">Creator</span>
            </div>
            {comparisons.map(({ creator }) => (
              <div key={creator.id} className="flex-1 px-4 py-3 min-w-0">
                <div className="flex items-center gap-2">
                  <img
                    src={creator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}&backgroundColor=2563eb`}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate text-sm">{creator.name}</p>
                    <p className="text-xs text-slate-500 truncate">{creator.niche}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          <Row label="Followers" highlight={false}
            render={(c) => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatNumber(c.linkedin_followers)}</span>
                {bestFollowers?.id === c.id && <span className="text-xs text-emerald-600 font-medium">★ Highest</span>}
              </div>
            )}
          />
          <Row label="Engagement"
            render={(c) => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.engagement_rate}%</span>
                {bestEngagement?.id === c.id && <span className="text-xs text-emerald-600 font-medium">★ Best</span>}
              </div>
            )}
          />
          <Row label="Price per post"
            render={(c) => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(c.price_per_post)}</span>
                {bestPrice?.id === c.id && <span className="text-xs text-emerald-600 font-medium">★ Best value</span>}
              </div>
            )}
          />
          <Row label="Match score"
            render={(c, match) => match ? (
              <div className="flex items-center gap-2">
                <span className={`font-bold ${match.score >= 80 ? "text-emerald-600" : match.score >= 65 ? "text-blue-600" : "text-slate-600"}`}>
                  {match.score}%
                </span>
                {bestMatch?.creator.id === c.id && <span className="text-xs text-emerald-600 font-medium">★ Best match</span>}
              </div>
            ) : <span className="text-slate-400">—</span>}
          />
          <Row label="Audience type"
            render={(c) => <span className="text-xs text-slate-600">{c.audience_type || "—"}</span>}
          />
          <Row label="Audience industries"
            render={(c) => (
              <div className="flex flex-wrap gap-1">
                {(c.audience_industries || []).slice(0, 3).map((ind) => (
                  <span key={ind} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{ind}</span>
                ))}
              </div>
            )}
          />
          <Row label="Geography"
            render={(c) => (
              <div className="flex flex-wrap gap-1">
                {(c.audience_geography || []).slice(0, 3).map((geo) => (
                  <span key={geo} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{geo}</span>
                ))}
              </div>
            )}
          />
          <Row label="Avg impressions"
            render={(c) => <span className="text-slate-600">{formatNumber(c.avg_impressions || 0)}</span>}
          />
          <Row label="Avg clicks"
            render={(c) => <span className="text-slate-600">{formatNumber(c.avg_clicks || 0)}</span>}
          />
          <Row label="Avg leads"
            render={(c) => <span className="text-slate-600">{formatNumber(c.avg_leads || 0)}</span>}
          />
          <Row label="Total campaigns"
            render={(c) => <span className="text-slate-600">{c.total_campaigns || 0}</span>}
          />
          <Row label="Rating"
            render={(c) => (
              <span className="text-slate-600">{c.rating || "—"} ({c.reviews_count || 0} reviews)</span>
            )}
          />
          <Row label="Availability"
            render={(c) => (
              <span className={`text-xs font-medium capitalize ${
                c.availability === "available" ? "text-emerald-600" :
                c.availability === "limited" ? "text-amber-600" : "text-slate-500"
              }`}>
                {c.availability || "—"}
              </span>
            )}
          />
          <Row label="Location"
            render={(c) => <span className="text-xs text-slate-600">{c.city}, {c.country}</span>}
          />
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {creators.length} creators compared · {bestMatch ? `Best match: ${bestMatch.creator.name}` : ""}
          </p>
          <div className="flex gap-2">
            {campaign && bestMatch && (
              <button
                onClick={() => navigate(`/creators/${bestMatch.creator.id}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                View best match <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}