import AudiencePage from "@/components/AudiencePage";
import { FeatureCheck } from "@/components/FeatureCheck";
import { Reveal } from "@/components/motion/Reveal";
import { COMPANY_ATTRIBUTION, CREATORS_LISTED } from "@/data/stats";
import {
  Search, Sparkles, Users, BarChart3, Wallet,
  TrendingUp, MousePointerClick, Target,
  ShieldCheck, FileText, Zap
} from "lucide-react";

const FAQS = [
  {
    q: "How is CreatorFlow different from a creator agency?",
    a: "CreatorFlow is a self-serve marketplace. You find creators directly, see their price per post upfront, and manage campaigns yourself — no middleman, no markups. You stay in control of every collaboration.",
  },
  {
    q: "How do I know a creator will reach my buyers?",
    a: "Every creator profile shows their audience type, audience industries, geography, languages, and engagement rate. You can also see their average performance per post — impressions, clicks, and leads — before you book.",
  },
  {
    q: "What does the AI brief generator do?",
    a: "Enter your product, target audience, and objective. CreatorFlow generates a structured campaign brief with key messages, creator guidelines, content direction, and tracking links — in seconds. You can edit everything before sending.",
  },
  {
    q: "How does attribution work?",
    a: "Every creator gets a unique tracking link for each campaign. CreatorFlow tracks clicks, qualified clicks, and leads generated from each post, so you can see exactly which creators drove pipeline — not just impressions.",
  },
  {
    q: "Do you handle creator payments?",
    a: "Yes. CreatorFlow handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no spreadsheets on your side.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "No. The self-serve plan is free forever. You only pay for creator posts when you launch a campaign. Managed campaigns can be cancelled with 30 days notice.",
  },
];

const PROBLEMS = [
  "Ads are expensive and increasingly ignored",
  "Cold outreach response rates keep dropping",
  "In-house content takes months to build an audience",
  "Sponsored posts on random creators waste budget",
  "You can't measure what actually drove the lead",
];

const SOLUTIONS = [
  "Find creators your buyers already trust",
  "Pay per post — no retainer, no markup",
  "AI-assisted campaign briefs in seconds",
  "Full content review before anything goes live",
  "Click-to-pipeline attribution per post",
];

/**
 * Problem / solution pair.
 *
 * Both columns are neutral. This was red-vs-green, which is the same fix
 * applied to the agency comparison: the two sides are two workflows, not one
 * being wrong. The differentiator is the checkmark token, so the left column
 * reads as "absent" rather than "failing".
 */
function ProblemSolution() {
  return (
    <section className="section-y border-t border-border/60 bg-card">
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-7">
            <span className="eyebrow">The problem</span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              B2B buyers don&apos;t click ads. They trust people.
            </h2>
            <ul className="mt-5 space-y-2.5">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-border"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-7">
            <span className="eyebrow text-primary">The CreatorFlow way</span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              Reach buyers through the creators they already follow.
            </h2>
            <ul className="mt-5 space-y-2.5">
              {SOLUTIONS.map((p) => (
                <li key={p}>
                  <FeatureCheck tone="violet">{p}</FeatureCheck>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Mock AI brief for the "Generate your brief" bento card.
 *
 * Sample copy. It exists so the card shows the shape of the output — a
 * headline, three messages, a tracking line — instead of asking the reader to
 * take the claim on faith. Decorative container, so its inner text is hidden
 * from assistive tech; the card's own body text carries the meaning.
 */
function BriefMock() {
  const messages = [
    "Lead with the ICP problem, not the product",
    "One concrete number per post",
    "End on the tracking link, not a discount",
  ];

  return (
    <div aria-hidden="true" className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold tracking-tight">Generated brief</p>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[0.625rem] font-semibold text-primary">
          Sample
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold tracking-tight">
        Why RevOps teams consolidate their stack
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {messages.map((m) => (
          <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
            {m}
          </li>
        ))}
      </ul>
      <p className="mt-3 truncate rounded-md bg-background px-2.5 py-1.5 font-mono text-[0.625rem] text-muted-foreground">
        cf.link/northbeam-q4
      </p>
    </div>
  );
}

function Trust() {
  const items = [
    {
      icon: ShieldCheck,
      label: "Vetted creators only",
      desc: "Every creator is reviewed before joining the marketplace.",
    },
    {
      icon: FileText,
      label: "AI-assisted briefs",
      desc: "Generate structured campaign briefs in seconds.",
    },
    {
      icon: BarChart3,
      label: "Pipeline attribution",
      desc: "Track clicks, leads, and revenue per post.",
    },
  ];

  return (
    <section className="section-y border-t border-border/60 bg-muted/50">
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="eyebrow">Trust</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for B2B marketing teams
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trusted by modern SaaS companies to run their creator channels.
          </p>
        </div>

        {/* A row, not a grid of three cards. These are three supporting
            claims, so they sit on one line of icons and read as a strip
            between sections rather than competing with the bento for
            attention. */}
        <Reveal className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {items.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2.5 text-sm font-medium">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              {label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default function ForCompanies() {
  return (
    <AudiencePage
      badge="For companies & brands"
      badgeIcons={[Zap]}
      headline="Turn LinkedIn creators"
      accentWord="into pipeline"
      sub="Find the creators your buyers already follow, launch campaigns in days, and track every click, lead, and dollar of pipeline — attributed to each post."
      ctaLabel="Launch a campaign"
      ctaNote="Free to start · No credit card required · Cancel anytime"
      benefitsHeading="From brief to pipeline"
      benefitsSub="Everything you need to discover, launch, and measure creator campaigns."
      benefitsLayout="bento"
      benefits={[
        {
          icon: Search,
          title: "Discover creators",
          body: `Search ${CREATORS_LISTED} vetted B2B creators by niche, audience, geography, and price. See fit scores, engagement, and average performance before you book.`,
        },
        {
          icon: Sparkles,
          title: "Generate your brief",
          body: "Enter your product and objective. AI generates key messages, creator guidelines, and tracking links. Edit and launch in minutes.",
          visual: <BriefMock />,
        },
        {
          icon: Users,
          title: "Invite & collaborate",
          body: "Select creators, send invites, and manage the whole collaboration — drafts, revisions, approvals — in one place.",
        },
        {
          icon: BarChart3,
          title: "Track attribution",
          body: "Every post gets a tracking link. See impressions, clicks, qualified clicks, leads, and pipeline attributed per creator.",
          // Wide card: attribution is the reason buyers replace their current
          // stack, so it gets double width rather than one sixth of the grid.
          span: "lg:col-span-2",
        },
        {
          icon: Target,
          title: "Measure ROI",
          body: "Compare cost per lead, cost per click, and pipeline value across creators. Know exactly what drove results.",
        },
        {
          icon: Wallet,
          title: "Pay creators",
          body: "Automatic payouts within 24h of each post going live. No invoices, no chasing, no admin on your side.",
        },
      ]}
      statsVariant="panel"
      stats={[
        { icon: TrendingUp, ...COMPANY_ATTRIBUTION.stats[0] },
        { icon: MousePointerClick, ...COMPANY_ATTRIBUTION.stats[1] },
        { icon: Target, ...COMPANY_ATTRIBUTION.stats[2] },
      ]}
      extra={<Trust />}
      intro={<ProblemSolution />}
      faqs={FAQS}
    />
  );
}
