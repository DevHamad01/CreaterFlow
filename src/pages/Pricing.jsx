import { useNavigate } from "react-router-dom";
import { useId, useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Sparkles } from "lucide-react";

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

function FaqItem({ faq, index, isOpen, onToggle }) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition-colors duration-200 ease-smooth ${
      isOpen ? "border-primary/30 shadow-xs" : "border-border/80 hover:border-primary/20"
    }`}>
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/60"
        >
          <span className="font-semibold tracking-tight">{faq.q}</span>
          <span
            aria-hidden="true"
                className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[transform,background-color,color] duration-200 ease-smooth ${
              isOpen ? "rotate-180 bg-primary/10 text-primary" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </h3>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-muted-foreground"
        >
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const faqListId = useId();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Header */}
      <div className="relative overflow-hidden bg-brand-radial">
        <div className="container-page relative py-16 text-center sm:py-20">
          <span className="eyebrow">Pricing</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Start free. <span className="text-gradient">Upgrade when you want your time back.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            No lock-in, no seat fees. You only pay when creators post.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container-page pb-20">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) =>
            plan.featured ? (
              /* Premium: brand gradient, foreground-token contrast throughout */
              <div
                key={plan.key}
                className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-gradient p-8 text-primary-foreground shadow-overlay"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl"
                />
                <div className="relative flex h-full flex-col">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
                      <Sparkles aria-hidden="true" className="h-3 w-3" />
                      {plan.eyebrow}
                    </span>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight">{plan.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                      {plan.blurb}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="font-display text-4xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <p className="mt-1 text-sm text-primary-foreground/85">{plan.cadence}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-primary-foreground/90">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20"
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    onClick={() => navigate("/signup")}
                    className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:brightness-100"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ) : (
              /* Standard */
              <div key={plan.key} className="surface-card flex flex-col p-8">
                <div className="mb-6">
                  <span className="eyebrow">{plan.eyebrow}</span>
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
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" size="lg" onClick={() => navigate("/signup")} className="w-full">
                  {plan.cta}
                </Button>
              </div>
            )
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Campaign spend is separate. No lock-in. Cancel anytime.
        </p>
      </div>

      {/* FAQ */}
      <div className="border-t border-border/60 bg-muted/50">
        <div className="container-page section-y">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div id={faqListId} className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
