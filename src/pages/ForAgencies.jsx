import AudiencePage from "@/components/AudiencePage";
import {
  Search, FolderKanban, BarChart3, Users, Link2, Check,
  Building2, Layers, Target, X
} from "lucide-react";

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
          <div className="rounded-2xl border border-danger/25 bg-danger/5 p-6">
            <h3 className="mb-5 flex items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-danger" />
              Manual creator management
            </h3>
            <ul className="space-y-3">
              {MANUAL.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" strokeWidth={2.5} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-success/25 bg-success/5 p-6">
            <h3 className="mb-5 flex items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
              With CreatorFlow
            </h3>
            <ul className="space-y-3">
              {WITH_PLATFORM.map((p) => (
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
          body: "Search 3,000+ vetted B2B creators by niche, audience, geography, and price. Build shortlists you can reuse across clients.",
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
      stats={[
        { icon: Users, value: "3,000+", label: "Vetted B2B creators" },
        { icon: FolderKanban, value: "Unlimited", label: "Client campaigns" },
        { icon: BarChart3, value: "Minutes", label: "To export a client report" },
      ]}
      extra={<Comparison />}
      faqs={FAQS}
    />
  );
}
