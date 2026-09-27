import AudiencePage from "@/components/AudiencePage";
import { FeatureCheck } from "@/components/FeatureCheck";
import { AGENCY_REPORT_ROWS, AGENCY_STATS, CREATORS_LISTED } from "@/data/stats";
import {
  Search, FolderKanban, BarChart3, Users, Link2,
  Building2, Layers, Target
} from "lucide-react";

const REPORT_COLUMNS = [
  { key: "client", label: "Client", align: "left" },
  { key: "creators", label: "Creators", align: "right" },
  { key: "posts", label: "Posts", align: "right" },
  { key: "clicks", label: "Clicks", align: "right" },
  { key: "leads", label: "Leads", align: "right" },
  { key: "pipeline", label: "Pipeline", align: "right" },
];

const euro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const FAQS = [
  {
    q: "Can I manage multiple clients from one account?",
    a: "Yes. Agencies get a single workspace to manage all client campaigns, creators, and reporting. Each campaign is tagged to a client and isolated, so nothing leaks across accounts.",
  },
  {
    q: "How does creator pricing work for agencies?",
    a: "Each creator sets their own price per post. You see the price upfront in the marketplace — no negotiating, no back-and-forth. You pay per post, not per hour or per campaign.",
  },
  {
    q: "Can I build shared creator shortlists across clients?",
    a: "Yes. Build shortlists once and reuse them across client campaigns. Tag creators by industry, audience fit, or past performance so your team can move fast.",
  },
  {
    q: "Do you offer white-label reporting?",
    a: "Agency plans include exportable reports with per-campaign, per-creator, and per-post breakdowns. Present pipeline and attribution data to your clients in minutes, not days.",
  },
  {
    q: "How does attribution work across multiple campaigns?",
    a: "Every creator gets a unique tracking link per campaign. CreatorFlow attributes clicks, qualified clicks, and leads back to the specific post — so you can compare performance across all client campaigns in one dashboard.",
  },
];

const MANUAL = [
  "Spreadsheets for creator shortlists",
  "DMs and emails for coordination",
  "Manual tracking links per post",
  "No attribution — guess what worked",
  "Hours building client reports",
  "No way to scale across clients",
];

const WITH_PLATFORM = [
  "Searchable marketplace with fit scores",
  "Centralized campaign workspace",
  "Automatic tracking links per post",
  "Click-to-pipeline attribution",
  "Exportable client reports in minutes",
  "Scale top creators across all clients",
];

/**
 * Side-by-side comparison.
 *
 * Neutral on both columns. This used to be red-vs-green, which read as
 * "the left column is wrong" rather than "the left column is a different
 * workflow" — and green-on-white was the lowest-contrast text pairing on the
 * page. The differentiator is now the checkmark token, not a colour wash.
 */
function Comparison() {
  return (
    <section className="section-y border-t border-border/60 bg-card">
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="eyebrow">Comparison</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            CreatorFlow vs. managing creators manually
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop losing hours to spreadsheets, DMs, and disconnected tools.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-5 font-semibold tracking-tight">Manual creator management</h3>
            <ul className="space-y-3">
              {MANUAL.map((p) => (
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

          <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-6">
            <h3 className="mb-5 font-semibold tracking-tight">With CreatorFlow</h3>
            <ul className="space-y-3">
              {WITH_PLATFORM.map((p) => (
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
 * Reporting showcase.
 *
 * The audit asked for "centralized reporting" to be a wide feature rather than
 * one card among four, because it is the reason agencies buy. A mock export
 * table carries that claim better than a paragraph: it shows the actual
 * columns, the per-client breakdown, and that every figure is attributable.
 */
function Reporting() {
  return (
    <section className="section-y border-t border-border/60 bg-card">
      <div className="container-page">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="lg:sticky lg:top-24">
            <span className="eyebrow">Reporting</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Every client, one export
            </h2>
            <p className="mt-4 text-muted-foreground">
              Per-client, per-campaign, per-creator. Pull the numbers your client
              asks for without rebuilding a spreadsheet every Friday.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "One row per client, every metric attributed",
                "Pipeline value in the client's reporting currency",
                "Exports the moment a campaign posts go live",
              ].map((point) => (
                <li key={point}>
                  <FeatureCheck tone="violet">{point}</FeatureCheck>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock export. Sample data. Table is the widest thing on the page,
              so it scrolls horizontally rather than wrapping numbers onto
              two lines at narrow widths. */}
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3.5">
              <p className="text-sm font-semibold tracking-tight">Client performance</p>
              <p className="text-xs text-muted-foreground">Sample data</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <caption className="sr-only">
                  Sample per-client campaign performance for four agency clients
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    {REPORT_COLUMNS.map(({ key, label, align }) => (
                      <th
                        key={key}
                        scope="col"
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                          align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AGENCY_REPORT_ROWS.map((row) => (
                    <tr
                      key={row.client}
                      className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="whitespace-nowrap px-5 py-3.5 font-medium">
                        {row.client}
                      </th>
                      {REPORT_COLUMNS.filter((c) => c.key !== "client").map(({ key }) => (
                        <td
                          key={key}
                          className="px-5 py-3.5 text-right tabular-nums text-muted-foreground"
                        >
                          {key === "pipeline" ? euro.format(row[key]) : row[key].toLocaleString("en-US")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ForAgencies() {
  return (
    <AudiencePage
      badge="For agencies & managed service providers"
      badgeIcons={[Layers]}
      headline="Run creator campaigns"
      accentWord="for every client"
      sub="Discover creators, manage multiple client campaigns, and report on attributed pipeline — all from one workspace. Replace spreadsheets, DMs, and manual tracking with a platform built for scale."
      ctaLabel="Start managing clients"
      ctaNote="One workspace for every client. Switch from spreadsheets to a real creator operation in an afternoon."
      benefitsHeading="Why agencies choose CreatorFlow"
      benefitsSub="Stop juggling tools. Run your entire creator operation in one place."
      benefits={[
        {
          icon: Building2,
          title: "Multi-client management",
          body: "Manage every client campaign from a single workspace. Each campaign is tagged, isolated, and reportable per client.",
        },
        {
          icon: Search,
          title: "Creator discovery at scale",
          body: `Search ${CREATORS_LISTED} vetted B2B creators by niche, audience, geography, and price. Build shortlists you can reuse across clients.`,
        },
        {
          icon: Link2,
          title: "Attribution that holds up",
          body: "Every post gets a unique tracking link. Show clients exactly which creators drove clicks, leads, and pipeline — per post, per campaign.",
        },
        {
          icon: BarChart3,
          title: "Centralized reporting",
          body: "Export per-client, per-campaign, per-creator reports in minutes. Stop building slide decks from scratch every week.",
        },
      ]}
      stepsHeading="The agency workflow"
      steps={[
        {
          num: "01",
          icon: Search,
          title: "Discover & shortlist creators",
          body: "Search by niche, audience industry, geography, and price. Build reusable shortlists tagged by client or industry.",
        },
        {
          num: "02",
          icon: FolderKanban,
          title: "Create client campaigns",
          body: "Set up campaigns per client with objectives, budget, and target audience. Generate AI-assisted briefs in seconds.",
        },
        {
          num: "03",
          icon: Users,
          title: "Invite & coordinate creators",
          body: "Send invites, review drafts, request revisions, and approve content — all within the campaign workspace.",
        },
        {
          num: "04",
          icon: Target,
          title: "Track attributed performance",
          body: "Monitor impressions, clicks, qualified clicks, leads, and pipeline value attributed to each creator and post.",
        },
        {
          num: "05",
          icon: BarChart3,
          title: "Report & scale",
          body: "Export client-ready reports. Identify top-performing creators and scale what works across all your clients.",
        },
      ]}
      stats={AGENCY_STATS.map((stat, i) => ({
        ...stat,
        icon: [Users, FolderKanban, BarChart3][i],
      }))}
      extra={
        <>
          <Reporting />
          <Comparison />
        </>
      }
      faqs={FAQS}
    />
  );
}
