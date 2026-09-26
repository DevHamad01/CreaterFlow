import { useMemo } from "react";
import { computeCreatorMatch, formatNumber, formatCurrency } from "@/lib/intelligence";
import { GitCompare, ArrowRight, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} ComparisonModalProps
 * @property {any[]} creators
 * @property {any} [campaign]
 * @property {() => void} onClose
 */

/**
 * @typedef {object} ComparisonRow
 * @property {string} label
 * @property {(creator: any, match: any) => any} render
 * @property {boolean} [highlight]
 */

/**
 * Creator Comparison Modal — Differentiator #3
 *
 * Allows selecting multiple creators and comparing them side-by-side.
 * Compare: audience, followers, engagement, industry, match score, price,
 * historical performance, estimated campaign outcome, availability.
 *
 * @param {ComparisonModalProps} props
 */
export default function ComparisonModal({ creators, campaign, onClose }) {
  const navigate = useNavigate();

  const comparisons = useMemo(() => {
    return creators.map((creator) => ({
      creator,
      match: campaign ? computeCreatorMatch(creator, campaign) : null,
    }));
  }, [creators, campaign]);

  const bestMatch = comparisons.reduce((best, c) => {
    if (!c.match) return best;
    if (!best || c.match.score > best.match?.score) return c;
    return best;
  }, null);

  const bestPrice = creators.reduce((min, c) =>
    !min || c.price_per_post < min.price_per_post ? c : min, null);

  const bestFollowers = creators.reduce((max, c) =>
    !max || c.linkedin_followers > max.linkedin_followers ? c : max, null);

  const bestEngagement = creators.reduce((max, c) =>
    !max || c.engagement_rate > max.engagement_rate ? c : max, null);

  /** @type {(props: ComparisonRow) => any} */
  const Row = ({ label, render, highlight }) => (
    <tr className={cn("border-b border-border/70 last:border-b-0", highlight && "bg-primary/5")}>
      <th
        scope="row"
        className="sticky left-0 z-10 w-32 min-w-32 border-r border-border/70 bg-card px-4 py-3 text-left align-top text-xs font-semibold text-muted-foreground"
      >
        {label}
      </th>
      {comparisons.map(({ creator, match }) => (
        <td key={creator.id} className="min-w-40 px-4 py-3 align-top text-sm">
          {render(creator, match)}
        </td>
      ))}
    </tr>
  );

  /** @type {(props: { text: any; best: boolean; label: string }) => any} */
  const Leader = ({ text, best, label }) => (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-semibold tabular-nums">{text}</span>
      {best && (
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
          <Trophy aria-hidden="true" className="h-3 w-3" />
          {label}
        </span>
      )}
    </span>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] flex-col p-0 sm:max-w-5xl"
        showClose={false}
      >
        <DialogHeader className="border-b border-border/80 px-6 py-5 pr-14">
          <DialogTitle className="inline-flex items-center gap-2">
            <GitCompare aria-hidden="true" className="h-5 w-5 text-primary" />
            Compare creators
          </DialogTitle>
          <DialogDescription>
            {creators.length} creators side by side
            {campaign ? `, scored against ${campaign.name}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Side-by-side comparison of {creators.length} creators
            </caption>
            <thead>
              <tr className="sticky top-0 z-20 bg-card">
                <th
                  scope="col"
                  className="sticky left-0 z-30 w-32 min-w-32 border-b border-r border-border/70 bg-card px-4 py-4 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Metric
                </th>
                {comparisons.map(({ creator, match }) => (
                  <th
                    key={creator.id}
                    scope="col"
                    className="min-w-40 border-b border-border/70 bg-card px-4 py-3 text-left align-top font-normal"
                  >
                    <span className="flex items-center gap-2.5">
                      <img
                        src={
                          creator.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            creator.name || "creator"
                          )}&backgroundColor=2563eb`
                        }
                        alt=""
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{creator.name}</span>
                        <span className="block truncate text-xs font-normal text-muted-foreground">
                          {creator.niche}
                        </span>
                        {match && (
                          <span
                            className={cn(
                              "mt-1 inline-block text-[11px] font-semibold tabular-nums",
                              match.score >= 80
                                ? "text-success"
                                : match.score >= 65
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {match.score}% match
                          </span>
                        )}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row
                label="Followers"
                render={(c) => (
                  <Leader
                    text={formatNumber(c.linkedin_followers)}
                    best={bestFollowers?.id === c.id && comparisons.length > 1}
                    label="Highest"
                  />
                )}
              />
              <Row
                label="Engagement"
                render={(c) => (
                  <Leader
                    text={`${c.engagement_rate}%`}
                    best={bestEngagement?.id === c.id && comparisons.length > 1}
                    label="Best"
                  />
                )}
              />
              <Row
                label="Price per post"
                render={(c) => (
                  <Leader
                    text={formatCurrency(c.price_per_post)}
                    best={bestPrice?.id === c.id && comparisons.length > 1}
                    label="Best value"
                  />
                )}
              />
              <Row
                label="Match score"
                render={(c, match) =>
                  match ? (
                    <Leader
                      text={`${match.score}%`}
                      best={bestMatch?.creator.id === c.id && comparisons.length > 1}
                      label="Best match"
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Row
                label="Audience type"
                render={(c) => <span className="text-muted-foreground">{c.audience_type || "—"}</span>}
              />
              <Row
                label="Audience industries"
                render={(c) => (
                  <span className="flex flex-wrap gap-1">
                    {(c.audience_industries || []).slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {ind}
                      </span>
                    ))}
                  </span>
                )}
              />
              <Row
                label="Geography"
                render={(c) => (
                  <span className="flex flex-wrap gap-1">
                    {(c.audience_geography || []).slice(0, 3).map((geo) => (
                      <span
                        key={geo}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {geo}
                      </span>
                    ))}
                  </span>
                )}
              />
              <Row
                label="Avg impressions"
                render={(c) => (
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(c.avg_impressions || 0)}
                  </span>
                )}
              />
              <Row
                label="Avg clicks"
                render={(c) => (
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(c.avg_clicks || 0)}
                  </span>
                )}
              />
              <Row
                label="Avg leads"
                render={(c) => (
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(c.avg_leads || 0)}
                  </span>
                )}
              />
              <Row
                label="Total campaigns"
                render={(c) => <span className="tabular-nums text-muted-foreground">{c.total_campaigns || 0}</span>}
              />
              <Row
                label="Rating"
                render={(c) => (
                  <span className="text-muted-foreground">
                    {c.rating || "—"} ({c.reviews_count || 0} reviews)
                  </span>
                )}
              />
              <Row
                label="Availability"
                render={(c) => (
                  <span
                    className={cn(
                      "text-xs font-semibold capitalize",
                      c.availability === "available"
                        ? "text-success"
                        : c.availability === "limited"
                        ? "text-warning"
                        : "text-muted-foreground"
                    )}
                  >
                    {c.availability || "—"}
                  </span>
                )}
              />
              <Row
                label="Location"
                render={(c) => (
                  <span className="text-xs text-muted-foreground">
                    {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                  </span>
                )}
              />
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-muted/50 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {bestMatch
              ? `Best match for this campaign: ${bestMatch.creator.name}`
              : "Select a campaign to score these creators."}
          </p>
          <div className="flex gap-2">
            {campaign && bestMatch && (
              <Button
                onClick={() => {
                  onClose();
                  navigate(`/creators/${bestMatch.creator.id}`);
                }}
              >
                View best match
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
