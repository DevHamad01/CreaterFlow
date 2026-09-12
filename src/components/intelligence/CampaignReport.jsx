import { useState } from "react";
import { generateCampaignReport } from "@/lib/campaignAi";
import { formatCurrency, formatNumber } from "@/lib/intelligence";
import { FileText, Loader2, Sparkles, Download, TrendingUp, Target, Award, AlertTriangle } from "lucide-react";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <TrendingUp className="w-4 h-4 text-blue-500 mb-1" />
          <p className="text-xl font-bold text-slate-900">{formatNumber(totalImpressions)}</p>
          <p className="text-xs text-slate-500">Impressions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Target className="w-4 h-4 text-emerald-500 mb-1" />
          <p className="text-xl font-bold text-slate-900">{totalClicks}</p>
          <p className="text-xs text-slate-500">Clicks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Award className="w-4 h-4 text-amber-500 mb-1" />
          <p className="text-xl font-bold text-slate-900">{totalLeads}</p>
          <p className="text-xs text-slate-500">Leads</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totalPipeline)}</p>
          <p className="text-xs text-slate-500">Pipeline value</p>
        </div>
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total spend</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(totalSpend)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Cost per lead</p>
          <p className="text-lg font-bold text-slate-900">€{cpl}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Conversion rate</p>
          <p className="text-lg font-bold text-slate-900">{conversionRate}%</p>
        </div>
      </div>

      {/* Generate report button */}
      {!report && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 p-6 text-center">
          <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">Generate AI campaign report</h3>
          <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
            Get a professional, client-ready executive summary with key results, insights, and recommendations for your next campaign.
          </p>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4" /> Generate report
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-slate-500">Analyzing campaign performance and generating insights...</p>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Executive Summary</h3>
            </div>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          {/* Executive summary */}
          <p className="text-sm text-slate-700 leading-relaxed">{report.executive_summary}</p>

          {/* Key results */}
          {report.key_results?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Key results</h4>
              <ul className="space-y-1.5">
                {report.key_results.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best performing content */}
          {report.best_performing_content && (
            <div className="bg-emerald-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-emerald-900 mb-1">Best performing content</h4>
              <p className="text-sm text-emerald-700">{report.best_performing_content}</p>
            </div>
          )}

          {/* Weakest area */}
          {report.weakest_area && (
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Area for improvement</h4>
                  <p className="text-sm text-amber-700">{report.weakest_area}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key insights */}
          {report.key_insights?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Key insights</h4>
              <ul className="space-y-1.5">
                {report.key_insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" /> {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Recommendations</h4>
              <ul className="space-y-1.5">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-1" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next campaign suggestions */}
          {report.next_campaign_suggestions?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Next campaign suggestions</h4>
              <ul className="space-y-1.5">
                {report.next_campaign_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-1" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}