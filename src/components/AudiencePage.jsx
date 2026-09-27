import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import FaqAccordion from "@/components/FaqAccordion";
import { Button } from "@/components/ui/button";
import { CTABand } from "@/components/CTABand";
import { Stat } from "@/components/Stat";
import { StepCard } from "@/components/StepCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
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
 * @property {{ title: string, body: string, icon: any, span?: string, visual?: any }[]} benefits
 *   `span` is an optional col-span class for the bento layout; `visual` is an
 *   optional node rendered under the copy (mock table, brief, chart).
 * @property {"grid" | "bento"} [benefitsLayout]
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
  benefitsLayout = "grid",
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
        {/* Above-the-fold, so it animates on mount rather than waiting for an
            IntersectionObserver — the observer would only add a frame of
            latency to content the reader is already looking at. */}
        <Stagger trigger="mount" className="container-page relative py-16 text-center sm:py-24">
          <StaggerItem className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-sm">
            {BadgeIcons.map((Icon, i) => (
              <Icon key={i} aria-hidden="true" className="h-3.5 w-3.5" />
            ))}
            {badge}
          </StaggerItem>

          {/* Both lines use .text-display. The accent line is solid primary,
              not a gradient — the only gradient headline left in the site is
              the Home hero H1. */}
          <StaggerItem as="h1" className="mx-auto mt-7 max-w-4xl text-display font-semibold">
            {headline}
            <br />
            <span className="text-primary">{accentWord}</span>
          </StaggerItem>

          <StaggerItem as="p" className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {sub}
          </StaggerItem>

          <StaggerItem className="mt-9 flex flex-col items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/signup")}>
              {ctaLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">{ctaNote}</p>
          </StaggerItem>
        </Stagger>
      </section>

      {intro}

      {/* Benefits */}
      <section className="section-y border-t border-border/60 bg-card">
        <div className="container-page">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow">Why CreatorFlow</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {benefitsHeading}
            </h2>
            {benefitsSub && <p className="mt-4 text-muted-foreground">{benefitsSub}</p>}
          </Reveal>

          {/* Bento: cards declare their own col-span so the page has rhythm
              instead of six identical boxes. Span applies from lg only, so the
              single-column mobile stack is unaffected. */}
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, body, span, visual }) => (
              <StaggerItem
                key={title}
                className={`surface-card surface-card-hover p-7 ${
                  benefitsLayout === "bento" ? span || "" : ""
                }`}
              >
                <div className="flex flex-wrap items-start gap-5">
                  <div className="min-w-0 flex-1">
                    <span
                      aria-hidden="true"
                      className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                  {visual ? <div className="w-full shrink-0">{visual}</div> : null}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Workflow */}
      {steps && steps.length > 0 && (
        <section className="section-y border-t border-border/60 bg-muted/50">
          <div className="container-page">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="eyebrow">Workflow</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {stepsHeading}
              </h2>
            </Reveal>

            {/* `as="ol"`: the steps are numbered and read as a sequence, so the
                ordered-list semantics stay on the animated element rather than
                being dropped to a generic div. */}
            <Stagger as="ol" className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map(({ num, icon: Icon, title, body }) => (
                <StaggerItem key={num} as="li" className="min-w-0">
                  <StepCard number={num} icon={Icon} title={title} body={body} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Stats */}
      {statsVariant === "panel" ? (
        /* Flat ink, not bg-brand-gradient. Saturated brand fill behind
           primary-foreground text was the lowest-contrast text pairing on the
           page, and the "attribution" numbers are the ones a buyer reads most
           carefully. Ink plus white text gives them the contrast they need. */
        <section className="section-y border-t border-border/60 bg-ink text-white">
          <div className="container-page">
            <Reveal className="surface-card-strong grid items-center gap-10 bg-ink p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div>
                <span className="eyebrow text-white/60">Attribution</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-white">
                  Know which creators drove pipeline
                </h2>
                <p className="mt-4 leading-relaxed text-white/70">
                  Every creator gets a unique tracking link per campaign. CreatorFlow attributes
                  clicks, qualified clicks, and leads back to the exact post — so you can prove ROI
                  to your team and double down on what works.
                </p>
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Attributed pipeline over the last 12 weeks, trending upward"
                  className="mt-8 h-16 w-full text-primary"
                >
                  <polyline
                    points="0,32 0,28 9.1,26.5 18.2,25.2 27.3,25.7 36.4,22.4 45.5,20.1 54.5,21.2 63.6,17.6 72.7,15.2 81.8,16.2 90.9,12.9 100,11.6 100,32"
                    fill="currentColor"
                    fillOpacity="0.12"
                    stroke="none"
                  />
                  <polyline
                    points="0,28 9.1,26.5 18.2,25.2 27.3,25.7 36.4,22.4 45.5,20.1 54.5,21.2 63.6,17.6 72.7,15.2 81.8,16.2 90.9,12.9 100,11.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <ul className="space-y-3">
                {stats.map(({ icon: Icon, label, value, display, prefix = "", suffix = "", change }) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.07] p-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm text-white/85">{label}</span>
                    </span>
                    <span className="text-right">
                      <Stat
                        value={value}
                        display={display}
                        prefix={prefix}
                        suffix={suffix}
                        tone="dark"
                        size="sm"
                      />
                      {change ? (
                        <span className="mt-1 block text-xs font-medium text-primary">{change}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="section-y border-t border-border/60 bg-card">
          <div className="container-page">
            {/* `md:gap-2` — the three stat cards are short and wide, so the
                default 1.25rem gutter left visible voids between them at the
                breakpoint where they sit side by side. */}
            <Stagger as="ul" className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3 sm:gap-3">
                {stats.map(({ value, label, icon: Icon, display, prefix = "", suffix = "" }) => (
                  <StaggerItem key={label} as="li" className="surface-card p-6 text-center">
                    {Icon ? (
                      <span
                        aria-hidden="true"
                        className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    ) : null}
                    <Stat value={value} display={display} prefix={prefix} suffix={suffix} label={label} />
                  </StaggerItem>
                ))}
              </Stagger>
          </div>
        </section>
      )}

      {extra}

      {/* FAQ */}
      <section className="section-y border-t border-border/60 bg-muted/50">
        <div className="container-page">
          <Reveal>
            <FaqAccordion faqs={faqs} />
          </Reveal>
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
