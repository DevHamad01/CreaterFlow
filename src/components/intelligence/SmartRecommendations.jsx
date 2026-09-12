import { generateCampaignRecommendations } from "@/lib/intelligence";
import { Lightbulb, Target, Wallet, TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ICONS = {
  target: Target,
  wallet: Wallet,
  trending_down: TrendingDown,
};

/**
 * Smart Recommendations Panel — Differentiator #15
 * 
 * Surfaces data-driven recommendations throughout the platform.
 * Based on actual data — no fake intelligence.
 * 
 * Props: campaign, campaignCreators, allCreators, metrics, navigate (optional)
 */
export default function SmartRecommendations({ campaign, campaignCreators, allCreators, metrics }) {
  const navigate = useNavigate();
  const recs = generateCampaignRecommendations(campaign, campaignCreators, allCreators, metrics);

  if (recs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-sky-50/50 rounded-2xl border border-blue-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Smart Recommendations</h3>
      </div>
      <div className="space-y-3">
        {recs.map((rec, i) => {
          const Icon = ICONS[rec.icon] || Lightbulb;
          return (
            <div key={i} className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">{rec.text}</p>
                {rec.action && (
                  <button
                    onClick={() => {
                      if (rec.type === "better_match" || rec.type === "budget_available") navigate("/app/marketplace");
                      else if (rec.type === "underperforming") navigate("/app/analytics");
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {rec.action} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}