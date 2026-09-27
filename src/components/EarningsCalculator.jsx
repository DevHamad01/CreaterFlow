import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCheck } from "@/components/FeatureCheck";
import { Star } from "lucide-react";
import { CREATOR_EARNINGS, CREATOR_TESTIMONIAL } from "@/data/stats";

const euro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Earnings calculator.
 *
 * The point is to let a creator find their own band rather than read a site-wide
 * average, because "creators earn €500 on average" is useless to someone with
 * 4,000 followers and insulting to someone with 80,000.
 *
 * Every number here is an illustrative sample benchmark, and the panel says so.
 * A calculator that presents invented rates as a quote is worse than no
 * calculator: it produces a specific figure a creator will then hold the
 * marketplace to.
 */
export default function EarningsCalculator() {
  const [bandKey, setBandKey] = useState(CREATOR_EARNINGS.bands[2].key);
  const navigate = useNavigate();

  const { band, monthly, yearly, perPost } = useMemo(() => {
    const b = CREATOR_EARNINGS.bands.find((x) => x.key === bandKey);
    const accepted = b.postsPerMonth * CREATOR_EARNINGS.fillRate;
    const m = accepted * b.rate;
    return { band: b, monthly: m, yearly: m * 12, perPost: b.rate };
  }, [bandKey]);

  return (
    <section className="border-t border-border/60 bg-muted/50">
      <div className="container-page section-y">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <span className="eyebrow">Earnings</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              What would you earn?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pick your follower band. You set the final price — this is what the typical
              band tends to command, so you know where you sit before you apply.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "You set your own price per post",
                "Payout lands within 24h of going live",
                "Decline any campaign, no exclusivity",
              ].map((point) => (
                <li key={point}>
                  <FeatureCheck tone="violet">{point}</FeatureCheck>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-6 sm:p-7">
            {/* Radio group, not a set of toggle buttons: this is a single
                choice from mutually exclusive options, and arrow-key movement
                between them is the expected native behaviour. */}
            <fieldset>
              <legend className="eyebrow">Follower band</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CREATOR_EARNINGS.bands.map((b) => {
                  const active = b.key === bandKey;
                  return (
                    <label
                      key={b.key}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                        active
                          ? "border-primary/45 bg-primary/[0.05] font-medium text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/25"
                      }`}
                    >
                      <input
                        type="radio"
                        name="creator-band"
                        value={b.key}
                        checked={active}
                        onChange={() => setBandKey(b.key)}
                        className="h-4 w-4 accent-primary"
                      />
                      {b.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Output is a live region so the recalculated figure is announced
                rather than silently swapping under a screen reader user. */}
            <div
              aria-live="polite"
              className="mt-6 rounded-xl border border-border bg-background p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estimated monthly earnings
              </p>
              <p className="mt-1.5 text-4xl font-semibold tracking-tight tabular-nums">
                {euro.format(monthly)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {euro.format(yearly)} a year · {euro.format(perPost)} per post
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                Assumes {band.postsPerMonth} posts a month at a{" "}
                {Math.round(CREATOR_EARNINGS.fillRate * 100)}% acceptance rate. Sample
                benchmarks, not a quote.
              </p>
            </div>

            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => navigate("/signup")}
            >
              Apply as a creator
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Creator testimonial.
 *
 * Sample copy for a fictional creator drawn from the same sample data set as
 * the marketplace grid, so the name, niche and follower count on this page
 * match a profile a visitor can actually click through to.
 */
export function CreatorTestimonial() {
  const t = CREATOR_TESTIMONIAL;

  return (
    <section className="border-t border-border/60 bg-card">
      <div className="container-page section-y">
        <figure className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="mb-5 flex gap-1 text-primary"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <blockquote className="text-xl leading-relaxed tracking-tight sm:text-2xl">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
              {t.name
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t.name}</span>
              <span className="block text-xs text-muted-foreground">
                {t.role} · {t.handle}
              </span>
            </span>
            <span className="ml-auto rounded-full border border-border bg-background px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Sample creator
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
