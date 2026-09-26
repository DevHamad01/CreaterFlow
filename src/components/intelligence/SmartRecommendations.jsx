import { generateCampaignRecommendations } from "@/lib/intelligence";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lightbulb, Target, Wallet, TrendingDown, ArrowRight } from "lucide-react";

const ICONS = {
  target: Target,
  wallet: Wallet,
  trending_down: TrendingDown,
};

const ROUTES = {
  better_match: "/app/marketplace",
  budget_available: "/app/marketplace",
  underperforming: "/app/analytics",
};

/**
 * Smart Recommendations Panel — Differentiator #15
 *
 * Surfaces data-driven recommendations throughout the platform.
 * Based on actual data — no fake intelligence.
 *
 * Props: campaign, campaignCreators, allCreators, metrics
 */
export default function SmartRecommendations({ campaign, campaignCreators, allCreators, metrics }) {
  const recs = generateCampaignRecommendations(campaign, campaignCreators, allCreators, metrics);

  if (recs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-background p-5" aria-labelledby="smart-recommendations">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="h-4 w-4 text-primary" />
        <h3 id="smart-recommendations" className="text-sm font-semibold tracking-tight">
          Smart Recommendations
        </h3>
      </div>
      <ul className="space-y-3">
        {recs.map((rec, i) => {
          const Icon = ICONS[rec.icon] || Lightbulb;
          const to = ROUTES[rec.type];
          return (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-card/60 p-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed">{rec.text}</p>
                {rec.action && to && (
                  <Button asChild variant="link" size="sm" className="mt-1.5 h-auto p-0 text-xs">
                    <Link to={to}>
                      {rec.action}
                      <ArrowRight aria-hidden="true" className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
