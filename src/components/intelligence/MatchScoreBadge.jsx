import { useState } from "react";
import { computeCreatorMatch } from "@/lib/intelligence";

/**
 * Match Score Badge with detailed breakdown.
 * Shows "94% Match" and explains WHY on hover/expand.
 * 
 * Props: creator, campaign, size
 */
export default function MatchScoreBadge({ creator, campaign, size = "sm" }) {
  const [expanded, setExpanded] = useState(false);
  const match = computeCreatorMatch(creator, campaign);

  const colorClass =
    match.score >= 85 ? "text-emerald-700 bg-emerald-50"
    : match.score >= 70 ? "text-blue-700 bg-blue-50"
    : match.score >= 55 ? "text-amber-700 bg-amber-50"
    : "text-slate-600 bg-slate-100";

  const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
        className={`${sizeClass} font-semibold rounded-full ${colorClass} hover:opacity-80 transition-opacity flex items-center gap-1`}
      >
        <span>{match.score}%</span>
        <span className="font-medium opacity-75">Match</span>
      </button>

      {expanded && (
        <div className="absolute z-50 mt-2 right-0 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900">Why {match.score}% match?</h4>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(false); }} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
          <div className="space-y-2.5">
            {match.breakdown.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">{f.label}</span>
                  <span className={`font-medium ${f.score >= 75 ? "text-emerald-600" : f.score >= 50 ? "text-amber-600" : "text-slate-500"}`}>
                    {f.score}/100
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.score >= 75 ? "bg-emerald-500" : f.score >= 50 ? "bg-amber-400" : "bg-slate-300"}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}