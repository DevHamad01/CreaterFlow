import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import FaqAccordion from "@/components/FaqAccordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Shared layout for the three audience landing pages (companies / agencies /
 * creators) so hero, benefits, workflow, stats, FAQ and CTA stay identical in
 * structure and only differ in content + accent.
 *
 * @typedef {object} AudiencePageProps
 * @property {string} badge
 * @property {any[]} badgeIcons
 * @property {string} headline        plain-text first line
 * @property {string} accentWord      rendered with the accent gradient
 * @property {string} sub
 * @property {string} ctaLabel
 * @property {string} ctaNote
 * @property {{ title: string, body: string, icon: any }[]} benefits
 * @property {{ num: string, title: string, body: string, icon: any }[]} [steps]
 * @property {{ value: string, label: string, icon: any, change?: string }[]} stats
 * @property {"cards" | "panel"} [statsVariant]
 * @property {{ q: string, a: string }[]} faqs
 * @property {string} [benefitsHeading]
 * @property {string} [benefitsSub]
 * @property {string} [stepsHeading]
 * @property {any} [intro]            optional section rendered right after the hero
 * @property {any} [extra]            optional section rendered after the stats
 */

/**
 * @param {AudiencePageProps} props
 */
export default function AudiencePage({
  badge,
  badgeIcons = [],
  headline,
  accentWord,
  sub,
  ctaLabel,
  ctaNote,
  benefits,
  benefitsHeading,
  benefitsSub,
  steps,
  stepsHeading = "How it works",
  stats,
  statsVariant = "cards",
  faqs,
  intro,
  extra,
}) {
  const navigate = useNavigate();
  const BadgeIcons = badgeIcons;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-radial">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="container-page relative py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-sm">
            {BadgeIcons.map((Icon, i) => (
              <Icon key={i} aria-hidden="true" className="h-3.5 w-3.5" />
            ))}
            {badge}
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
            <br />
            <span className="text-gradient">{accentWord}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {sub}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/signup")}>
              {ctaLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">{ctaNote}</p>
          </div>
        </div>
      </section>

      {intro}

      {/* Benefits */}
      <section className="section-y border-t border-border/60 bg-card">
        <div className="container-page">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow">Why CreatorFlow</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {benefitsHeading}
            </h2>
            {benefitsSub && <p className="mt-4 text-muted-foreground">{benefitsSub}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-card surface-card-hover p-7">
                <span
                  aria-hidden="true"
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      {steps && steps.length > 0 && (
        <section className="section-y border-t border-border/60 bg-muted/50">
          <div className="container-page">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="eyebrow">Workflow</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {stepsHeading}
              </h2>
            </div>

            <ol className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
              {steps.map(({ num, icon: Icon, title, body }) => (
                <li key={num} className="surface-card flex gap-5 p-6">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span aria-hidden="true" className="eyebrow">
                      {num}
                    </span>
                    <h3 className="mt-1 font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Stats */}
      {statsVariant === "panel" ? (
        <section className="section-y border-t border-border/60 bg-card">
          <div className="container-page">
            <div className="surface-card-strong grid items-center gap-10 bg-brand-gradient p-8 text-primary-foreground sm:p-12 lg:grid-cols-2">
              <div>
                <span className="eyebrow text-primary-foreground/80">Attribution</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Know which creators drove pipeline
                </h2>
                <p className="mt-4 leading-relaxed text-primary-foreground/85">
                  Every creator gets a unique tracking link per campaign. CreatorFlow attributes
                  clicks, qualified clicks, and leads back to the exact post — so you can prove ROI
                  to your team and double down on what works.
                </p>
              </div>
              <ul className="space-y-3">
                {stats.map(({ icon: Icon, label, value, change }) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm">{label}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-base font-semibold">{value}</span>
                      {change && (
                        <span className="block text-xs font-medium text-primary-foreground">{change}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className="section-y border-t border-border/60 bg-card">
          <div className="container-page">
            <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3">
              {stats.map(({ value, label, icon: Icon }) => (
                <li key={label} className="surface-card p-7 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {extra}

      {/* FAQ */}
      <section className="section-y border-t border-border/60 bg-muted/50">
        <div className="container-page">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand-gradient section-y text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="container-page relative text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {ctaLabel}
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-primary-foreground/85">
            {ctaNote}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:brightness-100"
          >
            {ctaLabel}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
