import AudiencePage from "@/components/AudiencePage";
import {
  Search, Sparkles, Users, BarChart3, Wallet,
  Check, TrendingUp, MousePointerClick, Target,
  ShieldCheck, FileText, Zap, X
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

function ProblemSolution() {
  return (
    <section className="section-y border-t border-border/60 bg-card">
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-danger/25 bg-danger/5 p-7">
            <span className="eyebrow">The problem</span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              B2B buyers don't click ads. They trust people.
            </h2>
            <ul className="mt-5 space-y-2.5">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" strokeWidth={2.5} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-success/25 bg-success/5 p-7">
            <span className="eyebrow text-success">The CreatorFlow way</span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              Reach buyers through the creators they already follow.
            </h2>
            <ul className="mt-5 space-y-2.5">
              {SOLUTIONS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
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

        <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3">
          {items.map(({ icon: Icon, label, desc }) => (
            <li key={label} className="surface-card surface-card-hover p-6 text-center">
              <span
                aria-hidden="true"
                className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold tracking-tight">{label}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
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
      benefits={[
        {
          icon: Search,
          title: "Discover creators",
          body: "Search 3,000+ vetted B2B creators by niche, audience, geography, and price. See fit scores, engagement, and average performance before you book.",
        },
        {
          icon: Sparkles,
          title: "Generate your brief",
          body: "Enter your product and objective. AI generates key messages, creator guidelines, and tracking links. Edit and launch in minutes.",
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
        { icon: TrendingUp, label: "Attributed pipeline", display: "€48.2K", change: "+24%" },
        { icon: MousePointerClick, label: "Qualified clicks", display: "418", change: "+18%" },
        { icon: Target, label: "Leads generated", display: "124", change: "+31%" },
      ]}
      extra={<Trust />}
      intro={<ProblemSolution />}
      faqs={FAQS}
    />
  );
}
