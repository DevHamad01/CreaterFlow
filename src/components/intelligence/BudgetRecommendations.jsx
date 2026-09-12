import { computeBudgetRecommendations } from "@/lib/intelligence";
import { TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

/**
 * Budget Allocation Recommendations — Differentiator #10
 * 
 * Provides recommendations for future budget allocation based on creator performance.
 * Does NOT move money — provides recommendations only.
 * 
 * Props: campaignCreators, metrics
 */
export default function BudgetRecommendations({ campaignCreators, metrics }) {
  const recs = computeBudgetRecommendations(campaignCreators, metrics);

  if (recs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-slate-900 text-sm">Budget Allocation Insights</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Recommendations for your next campaign. These are suggestions only — CreatorFlow does not automatically move money.
      </p>
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-xl ${
              rec.type === "increase" ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            {rec.type === "increase" ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm leading-relaxed ${rec.type === "increase" ? "text-emerald-700" : "text-amber-700"}`}>
              {rec.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}