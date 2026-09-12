import { useState } from "react";
import { computeCampaignHealth, getHealthColor, getHealthLabel } from "@/lib/intelligence";
import { Activity, AlertCircle, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";

/**
 * Campaign Health Badge with detailed breakdown.
 * Shows health status (Healthy / Needs Attention / At Risk) with issues.
 * 
 * Props: campaign, campaignCreators, posts, metrics, payments, variant ("badge" | "card")
 */
export default function CampaignHealthBadge({ campaign, campaignCreators = [], posts = [], metrics = [], payments = [], variant = "badge" }) {
  const [expanded, setExpanded] = useState(false);
  const health = computeCampaignHealth(campaign, campaignCreators, posts, metrics, payments);
  const color = getHealthColor(health.status);
  const label = getHealthLabel(health.status);

  const icon =
    health.status === "healthy" ? CheckCircle2 :
    health.status === "needs_attention" ? AlertCircle :
    AlertTriangle;

  const colorClasses = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  };
  const c = colorClasses[color] || colorClasses.slate;

  if (variant === "badge") {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} ${c.border} border hover:opacity-80 transition-opacity`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {label}
      </button>
    );
  }

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${c.text}`} />
          <h3 className="font-semibold text-slate-900 text-sm">Campaign Health</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${c.text}`}>{health.score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border} mb-4`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {label}
      </div>

      {health.issues.length > 0 && (
        <div className="space-y-2 mb-3">
          {health.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${issue.severity === "warning" ? "text-amber-500" : "text-slate-400"}`} />
              <span className="text-slate-700">{issue.text}</span>
            </div>
          ))}
        </div>
      )}

      {health.highlights.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-200/50">
          {health.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span className="text-slate-700">{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}