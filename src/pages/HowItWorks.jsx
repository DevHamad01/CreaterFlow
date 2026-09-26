import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import {
  Search, FileText, Users, BarChart3, Wallet, ArrowRight, Check
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find the right creators",
    desc: "Search 3,000+ vetted B2B creators by niche, audience, geography and price. Every creator profile shows audience type, engagement rate, and average performance per post.",
    points: ["Filter by niche, followers, price", "See fit scores for your campaign", "Save creators to shortlists"],
  },
  {
    icon: FileText,
    title: "Build your campaign brief with AI",
    desc: "Enter your product, target audience and objective. CreatorFlow's AI generates a structured brief with key messages, creator guidelines, and tracking links.",
    points: ["AI-generated key messages", "Creator guidelines", "Tracking links ready"],
  },
  {
    icon: Users,
    title: "Invite and collaborate with creators",
    desc: "Select creators from your shortlist, invite them to your campaign, and manage the entire collaboration in one place — from draft to approval.",
    points: ["One-click creator invites", "Draft review and approval", "Revision workflow"],
  },
  {
    icon: BarChart3,
    title: "Track attributed pipeline",
    desc: "Every post gets a unique tracking link. See impressions, clicks, qualified clicks, leads, and pipeline value — attributed to each creator and post.",
    points: ["Real-time performance tracking", "Per-creator attribution", "Lead capture and scoring"],
  },
  {
    icon: Wallet,
    title: "Pay creators without the admin",
    desc: "CreatorFlow handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no spreadsheets.",
    points: ["Automatic payouts", "Paid within 24h", "No invoice management"],
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="relative overflow-hidden bg-brand-radial">
        <div className="container-page relative py-16 text-center sm:py-20">
          <span className="eyebrow">How it works</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            From brief to pipeline in <span className="text-gradient">five steps</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            The complete workflow for B2B creator campaigns — no spreadsheets, no chasing.
          </p>
        </div>
      </div>

      <div className="container-page pb-20">
        <ol className="relative mx-auto max-w-3xl">
          {/* Connector rail — desktop only */}
          <div
            aria-hidden="true"
            className="absolute left-[27px] top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-primary/30 via-border to-transparent sm:block"
          />

          {STEPS.map(({ icon: Icon, title, desc, points }, i) => (
            <li key={title} className="relative flex gap-5 pb-10 last:pb-0 sm:gap-6">
              <div className="relative z-10 flex flex-col items-center">
                <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-glow">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 font-display text-xs font-bold tracking-widest text-muted-foreground sm:hidden"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <span aria-hidden="true" className="eyebrow">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
                <p className="mt-2.5 leading-relaxed text-muted-foreground">{desc}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {points.map((p) => (
                    <li
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <Check aria-hidden="true" className="h-3 w-3 text-success" strokeWidth={3} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <div className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card px-6 py-12 text-center shadow-card sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-brand-radial" />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to launch your first campaign?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Pay per post when you&apos;re ready.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/signup")} className="w-full sm:w-auto">
                Get started
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/pricing")} className="w-full sm:w-auto">
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
