import { useState } from "react";
import { computeCreatorPerformanceScore, getPerformanceGrade } from "@/lib/intelligence";
import { TrendingUp } from "lucide-react";

/**
 * Creator Performance Score Card.
 * Shows a composite 0-100 score with grade and breakdown.
 * 
 * Props: creator, variant ("card" | "inline")
 */
export default function PerformanceScoreCard({ creator, variant = "card" }) {
  const [expanded, setExpanded] = useState(false);
  const { score, grade, breakdown } = computeCreatorPerformanceScore(creator);
  const gradeInfo = getPerformanceGrade(score);

  const ringColor =
    score >= 75 ? "text-emerald-500"
    : score >= 60 ? "text-blue-500"
    : score >= 40 ? "text-amber-500"
    : "text-slate-400";

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2">
        <span className={`text-2xl font-bold ${ringColor}`}>{score}</span>
        <div>
          <p className="text-xs font-medium text-slate-500">Performance score</p>
          <p className="text-xs text-slate-400">/ 100 · {grade}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-slate-900 text-sm">Creator Performance</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
              className={ringColor}
              strokeDasharray={`${(score / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`text-xl font-bold ${ringColor}`}>{score}</span>
        </div>
        <div>
          <p className={`text-sm font-semibold text-${gradeInfo.color}-600`}>{grade}</p>
          <p className="text-xs text-slate-500">Performance score</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        {expanded ? "Hide breakdown" : "Show breakdown"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2.5 pt-3 border-t border-slate-100">
          {breakdown.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{c.label}</span>
                <span className={`font-medium ${c.score >= 75 ? "text-emerald-600" : c.score >= 50 ? "text-amber-600" : "text-slate-500"}`}>
                  {c.score}/100
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.score >= 75 ? "bg-emerald-500" : c.score >= 50 ? "bg-amber-400" : "bg-slate-300"}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}