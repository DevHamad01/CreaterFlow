import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { FeatureCheck } from "@/components/FeatureCheck";
import { Stat } from "@/components/Stat";
import { CTABand } from "@/components/CTABand";
import FaqAccordion from "@/components/FaqAccordion";
import { PRICING_PROOF } from "@/data/stats";
import { Sparkles } from "lucide-react";

const PLANS = [
  {
    key: "self-serve",
    eyebrow: "Self-serve",
    title: "Run it yourself",
    blurb: "For teams that want the infrastructure to run creator campaigns in-house.",
    price: "€0",
    cadence: "/month",
    features: [
      "Creator marketplace access",
      "AI-powered brief creation",
      "Track clicks, leads and pipeline",
      "Automatic creator payouts",
      "Unlimited campaigns",
      "Performance analytics",
    ],
    cta: "Start for free",
    featured: false,
  },
  {
    key: "managed",
    eyebrow: "Managed campaigns",
    title: "Get your time back",
    blurb: "For teams that want CreatorFlow to operate their creator channel end to end.",
    price: "Custom",
    cadence: "Based on campaign scope",
    features: [
      "Campaign strategy and positioning",
      "Creator sourcing and coordination",
      "Brief creation and campaign launch",
      "Reporting and optimisation",
      "Dedicated account manager",
      "Monthly performance reviews",
    ],
    cta: "Book a campaign call",
    featured: true,
  },
];

const FAQS = [
  {
    q: "What is CreatorFlow?",
    a: "CreatorFlow is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator.",
  },
  {
    q: "How does per-post pricing work?",
    a: "Each creator sets their own price per sponsored post. You see the price upfront in the marketplace — no negotiating, no back-and-forth. You pay per post, not per hour or per campaign.",
  },
  {
    q: "How does attribution work?",
    a: "Every creator gets a unique tracking link for each campaign. CreatorFlow tracks clicks, qualified clicks, and leads generated from each post, so you can see exactly which creators drive pipeline.",
  },
  {
    q: "Do you handle creator payouts?",
    a: "Yes. CreatorFlow handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no admin on your side.",
  },
  {
    q: "Can I upgrade or cancel anytime?",
    a: "Yes. The self-serve plan is free forever. You only pay for creator posts when you launch a campaign. Managed campaigns can be cancelled with 30 days notice.",
  },
];

/**
 * Social proof.
 *
 * Sample data for a fictional client, and labelled as such on the page. Sourced
 * from PRICING_PROOF so the numbers match the Home case band rather than
 * inventing a second set of figures for the same fictional company.
 */
function SocialProof() {
  return (
    <section className="border-t border-border/60 bg-muted/50">
      <div className="container-page section-y">
        <div className="mx-auto max-w-3xl">
          <figure className="surface-card p-7 sm:p-9">
            <blockquote className="text-lg leading-relaxed tracking-tight sm:text-xl">
              &ldquo;{PRICING_PROOF.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {PRICING_PROOF.client
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{PRICING_PROOF.client}</span>
                <span className="block text-xs text-muted-foreground">
                  {PRICING_PROOF.clientRole}
                </span>
              </span>
              <span className="ml-auto rounded-full border border-border bg-background px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Sample client
              </span>
            </figcaption>
          </figure>

          {/* Same figures as the Home case band, counted up. */}
          <dl className="mt-6 grid gap-5 sm:grid-cols-3">
            {PRICING_PROOF.stats.map((s) => (
              <div key={s.label} className="surface-card p-6 text-center">
                <Stat value={s.value} label={s.label} />
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Header — flat dotted hero, solid primary accent, .text-display. */}
      <div className="relative overflow-hidden bg-dots">
        <div className="container-page relative py-16 text-center sm:py-20">
          <span className="eyebrow">Pricing</span>
          <h1 className="mx-auto mt-3 max-w-3xl text-display font-semibold">
            Start free. <span className="text-primary">Upgrade when you want your time back.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            No lock-in, no seat fees. You only pay when creators post.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container-page pb-20">
        {/* Both plans are neutral cards. The featured plan used to be a brand
            gradient with white-on-violet body text, which put the pricing
            page's most important number behind the lowest-contrast treatment
            on the site. Emphasis is now a border + badge, not a colour wash. */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
                key={plan.key}
                // card-lift gives both plans the same hover/focus affordance, so
                // the featured plan is distinguished by its border and badge
                // rather than by being the only card that responds.
                className={`card-lift relative flex flex-col rounded-3xl bg-card p-8 ${
                  plan.featured
                    ? "border-2 border-primary/40 shadow-overlay"
                    : "border border-border shadow-xs"
                }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles aria-hidden="true" className="h-3 w-3" />
                  {plan.eyebrow}
                </span>
              ) : null}

              <div className="mb-6">
                {!plan.featured ? <span className="eyebrow">{plan.eyebrow}</span> : null}
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{plan.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>
              </div>

              <div className="mb-6">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">{plan.cadence}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f}>
                    <FeatureCheck tone="violet">{f}</FeatureCheck>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Scope note. "Campaign spend is separate" is the single most
            load-bearing sentence on a pricing page for a product whose cost is
            per post, and it was 14px grey under the grid. */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          Campaign spend is separate — you pay each creator their per-post price, and nothing
          else. CreatorFlow charges no platform fee on the self-serve plan. No lock-in. Cancel
          anytime.
        </p>
      </div>

      <SocialProof />

      {/* FAQ. Was a local FaqItem copy of the shared FaqAccordion — same markup,
          same ids, one extra component to keep in sync. */}
      <div className="border-t border-border/60 bg-muted/50">
        <div className="container-page section-y">
          <FaqAccordion faqs={FAQS} />
        </div>
      </div>

      <div className="container-page section-y">
        <CTABand
          title="Start with one post, not a retainer"
          body="Free to start, and you only pay when a creator publishes."
          primary={{ label: "Start for free", href: "/signup" }}
          secondary={{ label: "Browse creators", href: "/marketplace" }}
        />
      </div>

      <PublicFooter />
    </div>
  );
}
