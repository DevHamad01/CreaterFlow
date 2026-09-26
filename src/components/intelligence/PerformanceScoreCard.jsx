import { useId, useState } from "react";
import { computeCreatorPerformanceScore, getPerformanceGrade } from "@/lib/intelligence";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

// Static classes only — a dynamic `text-${color}-600` would be dropped by the
// Tailwind JIT scanner and would also bypass the approved palette.
const GRADE_TEXT = {
  emerald: "text-success",
  blue: "text-primary",
  sky: "text-info",
  amber: "text-warning",
  slate: "text-muted-foreground",
};

/**
 * Creator Performance Score Card.
 * Shows a composite 0-100 score with grade and breakdown.
 *
 * Props: creator, variant ("card" | "inline")
 */
export default function PerformanceScoreCard({ creator, variant = "card" }) {
  const [expanded, setExpanded] = useState(false);
  const breakdownId = useId();
  const { score, grade, breakdown } = computeCreatorPerformanceScore(creator);
  const gradeInfo = getPerformanceGrade(score);

  const ringColor =
    score >= 75 ? "text-success"
    : score >= 60 ? "text-primary"
    : score >= 40 ? "text-warning"
    : "text-muted-foreground";

  if (variant === "inline") {
    return (
      <p className="inline-flex items-center gap-2">
        <span className={`font-display text-2xl font-semibold tabular-nums ${ringColor}`}>{score}</span>
        <span>
          <span className="block text-xs font-medium text-muted-foreground">Performance score</span>
          <span className="block text-xs text-muted-foreground">/ 100 · {grade}</span>
        </span>
      </p>
    );
  }

  return (
    <section className="surface-card p-5" aria-labelledby={`${breakdownId}-title`}>
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp aria-hidden="true" className="h-4 w-4 text-primary" />
        <h3 id={`${breakdownId}-title`} className="text-sm font-semibold tracking-tight">
          Creator Performance
        </h3>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 36 36"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="currentColor" strokeWidth="3" className="text-muted-foreground"
            />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="currentColor" strokeWidth="3"
              className={ringColor}
              strokeDasharray={`${(score / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span
            role="meter"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Performance score"
            className={`font-display text-xl font-semibold tabular-nums ${ringColor}`}
          >
            {score}
          </span>
        </div>
        <div>
          <p className={`text-sm font-semibold ${GRADE_TEXT[gradeInfo.color] || GRADE_TEXT.slate}`}>
            {grade}
          </p>
          <p className="text-xs text-muted-foreground">Performance score</p>
        </div>
      </div>

      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={breakdownId}
      >
        {expanded ? "Hide breakdown" : "Show breakdown"}
      </Button>

      {expanded && (
        <ul id={breakdownId} className="mt-3 space-y-2.5 border-t border-border/70 pt-3">
          {breakdown.map((c) => (
            <li key={c.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{c.label}</span>
                <span
                  className={`font-medium tabular-nums ${
                    c.score >= 75 ? "text-success" : c.score >= 50 ? "text-warning" : "text-muted-foreground"
                  }`}
                >
                  {c.score}/100
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${c.label} score`}
                aria-valuenow={c.score}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={`h-full rounded-full ${
                    c.score >= 75 ? "bg-success/60" : c.score >= 50 ? "bg-warning/60" : "bg-border"
                  }`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
