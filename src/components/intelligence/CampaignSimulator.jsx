import { simulateCampaign, formatNumber, formatCurrency } from "@/lib/intelligence";
import { TrendingUp, MousePointerClick, Target, Eye, Wallet, Gauge } from "lucide-react";

/**
 * Campaign Simulator — Differentiator #4
 * 
 * Shows conservative/expected/optimistic scenarios for estimated campaign outcomes.
 * All figures are clearly labeled as estimates, not guarantees.
 * 
 * Props: creators (selected creators), budget, campaign
 */
export default function CampaignSimulator({ creators, budget }) {
  const sim = simulateCampaign(creators, budget);

  if (creators.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Gauge className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Select creators to see estimated campaign outcomes</p>
      </div>
    );
  }

  const scenarios = [
    { label: "Conservative", data: sim.conservative, color: "slate", bgClass: "bg-slate-50", textClass: "text-slate-700", borderClass: "border-slate-200" },
    { label: "Expected", data: sim.expected, color: "blue", bgClass: "bg-blue-50", textClass: "text-blue-700", borderClass: "border-blue-200" },
    { label: "Optimistic", data: sim.optimistic, color: "emerald", bgClass: "bg-emerald-50", textClass: "text-emerald-700", borderClass: "border-emerald-200" },
  ];

  return (
    <div className="space-y-4">
      {/* Budget summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total creator cost</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(sim.totalCost)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Budget remaining</p>
          <p className={`text-lg font-bold ${budget >= sim.totalCost ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(Math.max(budget - sim.totalCost, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Creators selected</p>
          <p className="text-lg font-bold text-slate-900">{creators.length}</p>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid md:grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.borderClass} ${s.bgClass} p-5`}>
            <h4 className={`font-semibold text-sm mb-4 ${s.textClass}`}>{s.label}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Reach</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatNumber(s.data.reach)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Impressions</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatNumber(s.data.impressions)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Clicks</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatNumber(s.data.clicks)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Leads</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatNumber(s.data.leads)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Est. CPL</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{s.data.cpl > 0 ? formatCurrency(s.data.cpl) : "—"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
        <span className="text-xs text-amber-700 leading-relaxed">
          <strong>Estimates only.</strong> These figures are projections based on historical creator performance data and industry benchmarks. Actual results will vary based on content quality, timing, audience response, and market conditions.
        </span>
      </div>
    </div>
  );
}