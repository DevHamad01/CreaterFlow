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
    <section className="surface-card p-5" aria-labelledby="budget-insights">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="h-4 w-4 text-warning" />
        <h3 id="budget-insights" className="text-sm font-semibold tracking-tight">
          Budget Allocation Insights
        </h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Recommendations for your next campaign. These are suggestions only — CreatorFlow does not
        automatically move money.
      </p>
      <ul className="space-y-3">
        {recs.map((rec, i) => {
          const isIncrease = rec.type === "increase";
          const Icon = isIncrease ? TrendingUp : AlertCircle;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                isIncrease ? "border-success/25 bg-success/10" : "border-warning/25 bg-warning/10"
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isIncrease ? "text-success" : "text-warning"}`}
              />
              <p
                className={`text-sm leading-relaxed ${
                  isIncrease ? "text-success" : "text-warning"
                }`}
              >
                {rec.text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
