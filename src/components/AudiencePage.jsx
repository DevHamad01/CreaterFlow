import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import FaqAccordion from "@/components/FaqAccordion";
import { Button } from "@/components/ui/button";
import { CTABand } from "@/components/CTABand";
import { Stat } from "@/components/Stat";
import { StepCard } from "@/components/StepCard";
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
 * @property {{ value?: number, display?: string, prefix?: string, suffix?: string,
 *   label: string, icon?: any, change?: string }[]} stats
 *   `value` is counted up; `display` is a fixed string for figures that are not
 *   quantities ("Unlimited", "Minutes"). Exactly one of the two is required.
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
      {/* bg-dots, not bg-brand-radial: a soft elliptical wash behind centered
          text is decoration that competes with the headline for attention. A
          static dot field gives the hero texture without a focal gradient. */}
      <section className="relative overflow-hidden bg-dots">
        <div className="container-page relative py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-sm">
            {BadgeIcons.map((Icon, i) => (
              <Icon key={i} aria-hidden="true" className="h-3.5 w-3.5" />
            ))}
            {badge}
          </span>

          {/* Both lines use .text-display. The accent line is solid primary,
              not a gradient — the only gradient headline left in the site is
              the Home hero H1. */}
          <h1 className="mx-auto mt-7 max-w-4xl text-display font-semibold">
            {headline}
            <br />
            <span className="text-primary">{accentWord}</span>
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

            <ol className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map(({ num, icon: Icon, title, body }) => (
                <li key={num} className="min-w-0">
                  <StepCard number={num} icon={Icon} title={title} body={body} />
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
            {/* `md:gap-2` — the three stat cards are short and wide, so the
                default 1.25rem gutter left visible voids between them at the
                breakpoint where they sit side by side. */}
            <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3 sm:gap-3">
              {stats.map(({ value, label, icon: Icon, display, prefix = "", suffix = "" }) => (
                <li key={label} className="surface-card p-6 text-center">
                  {Icon ? (
                    <span
                      aria-hidden="true"
                      className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  ) : null}
                  <Stat value={value} display={display} prefix={prefix} suffix={suffix} label={label} />
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

      {/* CTA — delegated to CTABand so the ink surface, button pair and
          spacing match every other page's closing band. The old inline band
          was a brand gradient, which put saturated colour behind body copy. */}
      <CTABand
        title={ctaLabel}
        body={ctaNote}
        fullBleed
        primary={{ label: ctaLabel, href: "/signup" }}
      />

      <PublicFooter />
    </div>
  );
}
