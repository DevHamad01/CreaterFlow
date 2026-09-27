import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { CTABand } from "@/components/CTABand";
import { FeatureCheck } from "@/components/FeatureCheck";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CREATORS_LISTED } from "@/data/stats";
import {
  Search, FileText, Users, BarChart3, Wallet
} from "lucide-react";

const n = new Intl.NumberFormat("en-US");

const STEPS = [
  {
    icon: Search,
    title: "Find the right creators",
    desc: `Search ${CREATORS_LISTED} vetted B2B creators by niche, audience, geography and price. Every creator profile shows audience type, engagement rate, and average performance per post.`,
    points: ["Filter by niche, followers, price", "See fit scores for your campaign", "Save creators to shortlists"],
    visual: (
      <ul className="space-y-2.5">
        {[
          { name: "Maya Lindqvist", niche: "AI & SaaS", fit: 94, price: 640 },
          { name: "Diego Ramos", niche: "Sales & GTM", fit: 88, price: 520 },
          { name: "Aisha Bello", niche: "HR & Recruiting", fit: 81, price: 480 },
        ].map((c) => (
          <li key={c.name} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            >
              {c.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{c.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{c.niche}</span>
            </span>
            <span className="flex flex-shrink-0 flex-col items-end">
              <span className="text-xs font-semibold text-primary">{c.fit}% fit</span>
              <span className="text-xs text-muted-foreground">€{n.format(c.price)}</span>
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: FileText,
    title: "Build your campaign brief with AI",
    desc: "Enter your product, target audience and objective. CreatorFlow's AI generates a structured brief with key messages, creator guidelines, and tracking links.",
    points: ["AI-generated key messages", "Creator guidelines", "Tracking links ready"],
    visual: (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold tracking-tight">Why RevOps teams consolidate</p>
        <ul className="mt-2.5 space-y-1.5">
          {["Lead with the ICP problem", "One number per post", "Close on the tracking link"].map((m) => (
            <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span aria-hidden="true" className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-3 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-[0.625rem] text-muted-foreground">
          cf.link/northbeam-q4
        </p>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Invite and collaborate with creators",
    desc: "Select creators from your shortlist, invite them to your campaign, and manage the entire collaboration in one place — from draft to approval.",
    points: ["One-click creator invites", "Draft review and approval", "Revision workflow"],
    visual: (
      <ul className="space-y-2.5">
        {[
          { label: "Draft received", state: "done" },
          { label: "Review & comment", state: "done" },
          { label: "Revision requested", state: "active" },
          { label: "Approved for publish", state: "next" },
        ].map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                row.state === "done"
                  ? "bg-success"
                  : row.state === "active"
                  ? "bg-primary ring-4 ring-primary/15"
                  : "bg-border"
              }`}
            />
            <span className={row.state === "next" ? "text-muted-foreground" : "font-medium"}>
              {row.label}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: BarChart3,
    title: "Track attributed pipeline",
    desc: "Every post gets a unique tracking link. See impressions, clicks, qualified clicks, leads, and pipeline value — attributed to each creator and post.",
    points: ["Real-time performance tracking", "Per-creator attribution", "Lead capture and scoring"],
    visual: (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attributed this month
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">€48,200</p>
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          role="img"
          aria-label="Attributed pipeline trending upward over the last 12 weeks"
          className="mt-2 h-12 w-full text-primary"
        >
          <polyline
            points="0,24 9.1,22 18.2,20 27.3,21 36.4,17 45.5,15 54.5,16 63.6,12 72.7,10 81.8,11 90.9,7 100,5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    ),
  },
  {
    icon: Wallet,
    title: "Pay creators without the admin",
    desc: "CreatorFlow handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no spreadsheets.",
    points: ["Automatic payouts", "Paid within 24h", "No invoice management"],
    visual: (
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Payout to Maya Lindqvist</span>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            Paid
          </span>
        </div>
        <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">€640.00</p>
        <p className="mt-1 text-xs text-muted-foreground">Settled 6h after the post went live</p>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Flat dotted hero, solid primary accent. The gradient wash and the
          gradient headline were decoration competing with the page's only job,
          which is explaining the sequence. */}
      <div className="relative overflow-hidden bg-dots">
        <div className="container-page relative py-16 text-center sm:py-20">
          <span className="eyebrow">How it works</span>
          <h1 className="mt-3 text-display font-semibold">
            From brief to pipeline in <span className="text-primary">five steps</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            The complete workflow for B2B creator campaigns — no spreadsheets, no chasing.
          </p>
        </div>
      </div>

      <div className="container-page pb-20">
        {/* Alternating two-column rows. Previously every step stacked copy and
            chips in one narrow column, so a five-step page was a column of
            near-identical text blocks with nothing to anchor the eye. The
            visual on the inside edge gives each step a thing to land on, and
            the flip keeps the reader moving down the page. */}
        <Stagger as="ol" className="relative mx-auto max-w-4xl space-y-14" stagger={0.07}>
          {/* Connector rail, desktop only. Scroll-revealed so it draws itself as
              the reader descends rather than sitting fully drawn behind steps
              that have not been reached yet. */}
          <StaggerItem
            aria-hidden="true"
            className="absolute left-[27px] top-8 hidden h-[calc(100%-6rem)] w-px bg-border sm:block"
          />

          {STEPS.map(({ icon: Icon, title, desc, points, visual }, i) => {
            const flipped = i % 2 === 1;
            return (
              <li
                key={title}
                className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8"
              >
                <div className="relative z-10 flex flex-col items-center sm:w-14 sm:flex-shrink-0">
                  <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-2 font-display text-xs font-bold tracking-widest text-muted-foreground sm:hidden"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span aria-hidden="true" className="eyebrow">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
                  <p className="mt-2.5 leading-relaxed text-muted-foreground">{desc}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                    {points.map((p) => (
                      <li key={p} className="min-w-0">
                        <FeatureCheck tone="violet" iconOnly>
                          <span className="text-xs leading-snug">{p}</span>
                        </FeatureCheck>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual sits on the alternating side: right for odd steps,
                    left for even, so the two columns do not line up into a
                    single hard edge down the page. */}
                <div
                  className={`min-w-0 sm:w-5/12 ${flipped ? "sm:order-first sm:pr-2" : "sm:pl-2"}`}
                >
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
                    {visual}
                  </div>
                </div>
              </li>
            );
          })}
        </Stagger>

        {/* CTA — the shared flat ink band. The local card had a radial wash
            bleeding out of its own top edge, which clipped visibly against the
            page background. */}
        <div className="mt-16">
          <CTABand
            title="Ready to launch your first campaign?"
            body="Start free. Pay per post when you're ready."
            primary={{ label: "Get started", href: "/signup" }}
            secondary={{ label: "See pricing", href: "/pricing" }}
          />
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
