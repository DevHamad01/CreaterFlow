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
      <div className="surface-card p-8 text-center">
        <Gauge aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Select creators to see estimated campaign outcomes
        </p>
      </div>
    );
  }

  const overBudget = budget < sim.totalCost;
  const scenarios = [
    {
      label: "Conservative",
      data: sim.conservative,
      bgClass: "bg-card",
      textClass: "",
      borderClass: "border-border",
    },
    {
      label: "Expected",
      data: sim.expected,
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/25",
    },
    {
      label: "Optimistic",
      data: sim.optimistic,
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/25",
    },
  ];

  const rows = [
    { key: "reach", label: "Reach", Icon: Eye },
    { key: "impressions", label: "Impressions", Icon: TrendingUp },
    { key: "clicks", label: "Clicks", Icon: MousePointerClick },
    { key: "leads", label: "Leads", Icon: Target },
  ];

  return (
    <div className="space-y-4">
      {/* Budget summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="mb-1 text-xs text-muted-foreground">Total creator cost</p>
          <p className="font-display text-lg font-semibold tabular-nums">
            {formatCurrency(sim.totalCost)}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="mb-1 text-xs text-muted-foreground">Budget remaining</p>
          <p
            className={`font-display text-lg font-semibold tabular-nums ${
              overBudget ? "text-danger" : "text-success"
            }`}
          >
            {formatCurrency(Math.max(budget - sim.totalCost, 0))}
          </p>
          {overBudget && (
            <p className="mt-1 text-xs text-danger">
              Over budget by {formatCurrency(sim.totalCost - budget)}
            </p>
          )}
        </div>
        <div className="surface-card p-4">
          <p className="mb-1 text-xs text-muted-foreground">Creators selected</p>
          <p className="font-display text-lg font-semibold tabular-nums">{creators.length}</p>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarios.map((s) => (
          <section
            key={s.label}
            aria-label={`${s.label} scenario`}
            className={`rounded-2xl border p-5 ${s.borderClass} ${s.bgClass}`}
          >
            <h4 className={`mb-4 text-sm font-semibold ${s.textClass}`}>{s.label}</h4>
            <dl className="space-y-3">
              {rows.map(({ key, label, Icon }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    {label}
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">{formatNumber(s.data[key])}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wallet aria-hidden="true" className="h-3.5 w-3.5" />
                  Est. CPL
                </dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {s.data.cpl > 0 ? formatCurrency(s.data.cpl) : "—"}
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 text-xs leading-relaxed text-warning">
        <strong className="flex-shrink-0">Estimates only.</strong>
        <span>
          These figures are projections based on historical creator performance data and industry
          benchmarks. Actual results will vary based on content quality, timing, audience response,
          and market conditions.
        </span>
      </p>
    </div>
  );
}
