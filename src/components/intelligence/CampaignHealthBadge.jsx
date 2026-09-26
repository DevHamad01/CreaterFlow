import { useId, useState } from "react";
import { computeCampaignHealth, getHealthColor, getHealthLabel } from "@/lib/intelligence";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Campaign Health Badge with detailed breakdown.
 * Shows health status (Healthy / Needs Attention / At Risk) with issues.
 *
 * Props: campaign, campaignCreators, posts, metrics, payments, variant ("badge" | "card")
 */
export default function CampaignHealthBadge({
  campaign,
  campaignCreators = [],
  posts = [],
  metrics = [],
  payments = [],
  variant = "badge",
}) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();
  const health = computeCampaignHealth(campaign, campaignCreators, posts, metrics, payments);
  const color = getHealthColor(health.status);
  const label = getHealthLabel(health.status);

  const colorClasses = {
    emerald: {
      bg: "bg-success/10", text: "text-success", border: "border-success/25", dot: "bg-success/60",
    },
    amber: {
      bg: "bg-warning/10", text: "text-warning", border: "border-warning/25", dot: "bg-warning/60",
    },
    red: {
      bg: "bg-danger/10", text: "text-danger", border: "border-danger/25", dot: "bg-danger/60",
    },
    slate: {
      bg: "bg-muted", text: "text-muted-foreground", border: "border-border", dot: "bg-primary",
    },
  };
  const c = colorClasses[color] || colorClasses.slate;

  const detail = (
    <div id={detailId} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity aria-hidden="true" className={`h-4 w-4 ${c.text}`} />
          <h3 className="text-sm font-semibold tracking-tight">Campaign Health</h3>
        </div>
        <p className="flex items-baseline gap-1">
          <span className={`font-display text-2xl font-semibold tabular-nums ${c.text}`}>
            {health.score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
          <span className="sr-only">health score</span>
        </p>
      </div>

      <p className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text} ${c.border}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
        {label}
      </p>

      {health.issues.length > 0 && (
        <ul className="mb-3 space-y-2">
          {health.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <AlertCircle
                aria-hidden="true"
                className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${
                  issue.severity === "warning" ? "text-warning" : "text-muted-foreground"
                }`}
              />
              <span>{issue.text}</span>
            </li>
          ))}
        </ul>
      )}

      {health.highlights.length > 0 && (
        <ul className="space-y-2 border-t border-border pt-3">
          {health.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (variant === "badge") {
    return (
      <div className="inline-flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          aria-expanded={expanded}
          aria-controls={detailId}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${c.bg} ${c.text} ${c.border}`}
        >
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
          {label}
          <span className="sr-only">— show health score breakdown</span>
        </button>
        {expanded && detail}
      </div>
    );
  }

  return detail;
}
