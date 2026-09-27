import { useState } from "react";
import { generateCampaignReport } from "@/lib/campaignAi";
import { formatCurrency, formatNumber } from "@/lib/intelligence";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Sparkles, Download, TrendingUp, Target, Award, AlertTriangle, Loader2, RefreshCw
} from "lucide-react";

/**
 * Post-Campaign AI Report — Differentiator #11
 *
 * Automatically generates an executive summary when a campaign finishes.
 * Client-ready format with insights and recommendations.
 *
 * Props: campaign, creators, posts, metrics, leads, payments
 */
export default function CampaignReport({ campaign, creators, posts, metrics, leads, payments }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0";
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : "0";

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCampaignReport(campaign, creators, posts, metrics, leads, payments);
      setReport(result);
    } catch (err) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Impressions", value: formatNumber(totalImpressions), Icon: TrendingUp, tone: "text-primary" },
          { label: "Clicks", value: formatNumber(totalClicks), Icon: Target, tone: "text-success" },
          { label: "Leads", value: formatNumber(totalLeads), Icon: Award, tone: "text-warning" },
          { label: "Pipeline value", value: formatCurrency(totalPipeline), Icon: null, tone: "" },
        ].map(({ label, value, Icon, tone }) => (
          <div key={label} className="surface-card p-4">
            {Icon && <Icon aria-hidden="true" className={`mb-1 h-4 w-4 ${tone}`} />}
            <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total spend", value: formatCurrency(totalSpend) },
          { label: "Cost per lead", value: `€${cpl}` },
          { label: "Conversion rate", value: `${conversionRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-lg font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Generate report button */}
      {!report && !loading && (
        <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-6 text-center">
          <Sparkles aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="mb-2 font-semibold tracking-tight">Generate AI campaign report</h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-muted-foreground">
            Get a professional, client-ready executive summary with key results, insights, and
            recommendations for your next campaign.
          </p>
          {error && (
            <p role="alert" className="mb-3 text-sm text-danger">
              {error}
            </p>
          )}
          <Button onClick={generate}>
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Generate report
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-3 py-8" aria-busy="true" aria-live="polite">
          <span className="sr-only">Analyzing campaign performance and generating insights</span>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
            Analyzing campaign performance and generating insights…
          </p>
          <Skeleton className="mx-auto h-40 max-w-2xl rounded-2xl" />
        </div>
      )}

      {report && (
        <article className="surface-card space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-semibold tracking-tight">
              <FileText aria-hidden="true" className="h-5 w-5 text-primary" />
              Executive Summary
            </h3>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              Export
              <span className="sr-only">report to PDF via the print dialog</span>
            </Button>
          </div>

          {/* Executive summary */}
          <p className="text-sm leading-relaxed">{report.executive_summary}</p>

          {/* Key results */}
          {report.key_results?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Key results</h4>
              <ul className="space-y-1.5">
                {report.key_results.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/40" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best performing content */}
          {report.best_performing_content && (
            <div className="rounded-xl border border-success/25 bg-success/10 p-4">
              <h4 className="mb-1 text-sm font-semibold text-success">Best performing content</h4>
              <p className="text-sm text-success">{report.best_performing_content}</p>
            </div>
          )}

          {/* Weakest area */}
          {report.weakest_area && (
            <div className="rounded-xl border border-warning/25 bg-warning/10 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-warning">Area for improvement</h4>
                  <p className="text-sm text-warning">{report.weakest_area}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key insights */}
          {report.key_insights?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Key insights</h4>
              <ul className="space-y-1.5">
                {report.key_insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold">Recommendations</h4>
              <ul className="space-y-1.5">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp aria-hidden="true" className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next campaign suggestions */}
          {report.next_campaign_suggestions?.length > 0 && (
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
              <h4 className="mb-2 text-sm font-semibold text-primary">Next campaign suggestions</h4>
              <ul className="space-y-1.5">
                {report.next_campaign_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-primary">
                    <Sparkles aria-hidden="true" className="mt-1 h-3.5 w-3.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            Regenerate report
          </Button>
        </article>
      )}
    </div>
  );
}
