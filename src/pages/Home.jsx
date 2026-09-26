import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Carousel from "@/components/Carousel";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import {
  Search, Sparkles, Users, FileText, BarChart3, Wallet,
  ArrowRight, TrendingUp, MousePointerClick, Target,
  Building2, Megaphone, Layers, AlertTriangle, RefreshCw, Quote
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const AUDIENCES = [
  {
    to: "/for-companies",
    icon: Building2,
    chip: "bg-primary/10 ring-primary/20",
    iconClass: "text-primary",
    title: "For companies",
    body: "Find creators your buyers follow, launch campaigns, and track pipeline attributed to every post.",
    cta: "Explore for companies",
  },
  {
    to: "/for-agencies",
    icon: Layers,
    chip: "bg-iris/10 ring-iris/20",
    iconClass: "text-iris",
    title: "For agencies",
    body: "Manage multiple client campaigns, build shared shortlists, and report on attributed pipeline.",
    cta: "Explore for agencies",
  },
  {
    to: "/for-creators",
    icon: Megaphone,
    chip: "bg-success/10 ring-success/20",
    iconClass: "text-success",
    title: "For creators",
    body: "Choose deals from B2B brands, post in your own voice, and get paid within 24 hours.",
    cta: "Explore for creators",
  },
];

const STEPS = [
  { icon: Search, title: "Find creators", desc: "Search 3,000+ vetted B2B creators matched to your buyers.", num: "01" },
  { icon: FileText, title: "AI brief", desc: "Generate campaign briefs with objectives, guidelines and tracking.", num: "02" },
  { icon: Users, title: "Collaborate", desc: "Creators accept, submit drafts, and you review in one place.", num: "03" },
  { icon: BarChart3, title: "Track results", desc: "See impressions, clicks, leads and pipeline attributed per post.", num: "04" },
  { icon: Wallet, title: "Pay creators", desc: "Automatic payouts handled by CreatorFlow. No admin, no chasing.", num: "05" },
];

const STATS = [
  { value: "5M+", label: "Impressions generated" },
  { value: "30K+", label: "Leads generated" },
  { value: "3,000+", label: "Creators on CreatorFlow" },
  { value: "5K+", label: "Posts published" },
];

const CASE_METRICS = [
  { icon: TrendingUp, label: "Attributed pipeline", value: "€48.2K", change: "+24%" },
  { icon: MousePointerClick, label: "Qualified clicks", value: "418", change: "+18%" },
  { icon: Target, label: "Leads generated", value: "124", change: "+31%" },
];

const TRUST_LOGOS = ["Lemlist", "Attio", "Folk", "Leadbay", "Ringover", "Abyssale"];

export default function Home() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCreators = useCallback(() => {
    setLoading(true);
    setError(null);
    base44.entities.Creator.list("-linkedin_followers", 6)
      .then((rows) => setCreators(Array.isArray(rows) ? rows : []))
      .catch((err) => {
        console.error("Home: failed to load featured creators", err);
        setError(err?.message || "We couldn't reach the marketplace. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-brand-radial">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <Stagger
          trigger="mount"
          stagger={0.09}
          className="container-page relative pt-16 pb-20 text-center sm:pt-24 sm:pb-28"
        >
          <StaggerItem className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            3,000+ vetted B2B creators across 100 countries
          </StaggerItem>

          <StaggerItem as="h1" className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            The B2B LinkedIn
            <br />
            <span className="text-gradient">creator marketplace</span>
          </StaggerItem>

          <StaggerItem className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            <p>
              Find the creators your buyers already trust, launch campaigns in days, and track the
              clicks, leads and pipeline generated by every post.
            </p>
          </StaggerItem>

          <StaggerItem className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/signup")} className="group w-full sm:w-auto">
              Launch a campaign
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/marketplace")}
              className="w-full sm:w-auto"
            >
              Browse the marketplace
            </Button>
          </StaggerItem>

          <StaggerItem className="mt-16 sm:mt-20">
            <p className="eyebrow mb-6">Trusted by modern B2B teams</p>
            {/* Seamless CSS marquee: the track holds two identical copies and
                translates exactly -50%, so it lands on a pixel-identical frame.
                No scroll listener and no per-frame JS — the compositor advances
                it. It pauses on hover so the logos are readable. */}
            <div className="marquee-mask overflow-hidden">
              <ul className="marquee-track">
                {[...TRUST_LOGOS, ...TRUST_LOGOS].map((brand, i) => (
                  <li
                    key={`${brand}-${i}`}
                    aria-hidden={i >= TRUST_LOGOS.length ? "true" : undefined}
                    className="flex shrink-0 items-center px-5 text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    {brand}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* ---------------- Three audiences ---------------- */}
      <section className="section-y border-t border-border/60 bg-card">
        <div className="container-page">
          <Stagger className="mx-auto mb-14 max-w-2xl text-center">
            <StaggerItem as="span" className="eyebrow block">
              Who it&apos;s for
            </StaggerItem>
            <StaggerItem as="h2" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for everyone in the creator economy
            </StaggerItem>
            <StaggerItem className="mt-4 text-muted-foreground">
              <p>
                Whether you&apos;re running campaigns, managing clients, or creating content —
                CreatorFlow has you covered.
              </p>
            </StaggerItem>
          </Stagger>

          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map(({ to, icon: Icon, chip, iconClass, title, body, cta }) => (
              <StaggerItem key={to} className="surface-card card-lift group focus-within:border-primary/40">
                <Link to={to} className="flex h-full flex-col rounded-2xl p-7 focus-visible:outline-none">
                  <span
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${chip}`}
                  >
                    <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${iconClass}`}>
                    {cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="section-y border-t border-border/60 bg-muted/50">
        <div className="container-page">
          <Stagger className="mx-auto mb-14 max-w-2xl text-center">
            <StaggerItem as="span" className="eyebrow block">
              How it works
            </StaggerItem>
            <StaggerItem as="h2" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From brief to pipeline in 5 steps
            </StaggerItem>
            <StaggerItem className="mt-4 text-muted-foreground">
              <p>
                Everything you need to run creator-led campaigns that drive measurable demand.
              </p>
            </StaggerItem>
          </Stagger>

          <Stagger as="ol" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(({ icon: Icon, title, desc, num }) => (
              <StaggerItem key={num} as="li" className="surface-card group flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-bold tracking-widest text-foreground/20 transition-colors duration-200 group-hover:text-primary/60">
                    {num}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- Featured creators ---------------- */}
      <section className="section-y border-t border-border/60 bg-card">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="eyebrow">Marketplace</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Featured creators</h2>
              <p className="mt-2 text-muted-foreground">
                A curated selection from our B2B creator marketplace.
              </p>
            </div>
            <Button variant="ghost" asChild className="group">
              <Link to="/marketplace">
                View all creators
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* loading — same slide count as the success state so the strip
              doesn't reflow when data lands */}
          {loading && (
            <div aria-busy="true" aria-live="polite">
              <Carousel label="Featured creators" showControls={false}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="surface-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                    <div className="mb-4 flex gap-1.5">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((__, j) => (
                        <Skeleton key={j} className="h-12" />
                      ))}
                    </div>
                  </div>
                ))}
              </Carousel>
              <span className="sr-only">Loading featured creators…</span>
            </div>
          )}

          {/* error */}
          {!loading && error && (
            <div
              role="alert"
              className="flex flex-col items-center gap-4 rounded-2xl border border-danger/25 bg-danger/5 px-6 py-14 text-center"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">Couldn&apos;t load featured creators</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={loadCreators}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
                <Button asChild>
                  <Link to="/marketplace">Go to marketplace</Link>
                </Button>
              </div>
            </div>
          )}

          {/* empty */}
          {!loading && !error && creators.length === 0 && (
            <div className="surface-card">
              <EmptyState
                illustration="collaboration"
                title="No creators to show yet"
                description="Featured creators appear here as soon as they're approved for the marketplace. Browse the full directory in the meantime."
                action={
                  <Button asChild>
                    <Link to="/marketplace">
                      Browse the marketplace
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                }
              />
            </div>
          )}

          {/* success — Embla strip. Dragging and snapping run on a single
              compositor transform, so it stays at 60fps even mid-scroll. */}
          {!loading && !error && creators.length > 0 && (
            <Carousel label="Featured creators">
              {creators.map((c) => (
                <CreatorCard key={c.id} creator={c} />
              ))}
            </Carousel>
          )}
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="section-y border-t border-border/60 bg-muted/50">
        <div className="container-page">
          <Stagger as="ul" className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label} as="li">
                <span className="font-display text-4xl font-semibold tracking-tight lg:text-5xl">
                  {s.value}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">{s.label}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------- Case study ---------------- */}
      <section className="relative overflow-hidden bg-brand-gradient section-y text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="container-page relative">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <Quote className="h-8 w-8 text-primary-foreground/40" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                How BlogSEO turned creator content into product signups
              </h2>
              <p className="mt-4 leading-relaxed text-primary-foreground/85">
                BlogSEO briefed SEO &amp; SaaS creators on LinkedIn, then traced every trial back to
                the post that drove it — all in CreatorFlow.
              </p>
              <Stagger as="ul" className="mt-8 grid grid-cols-3 gap-6" stagger={0.08}>
                {[
                  { v: "9", l: "creators activated" },
                  { v: "2,940", l: "qualified clicks" },
                  { v: "512", l: "trials started" },
                ].map((item) => (
                  <StaggerItem key={item.l} as="li">
                    <p className="font-display text-2xl font-semibold">{item.v}</p>
                    <p className="mt-1 text-xs text-primary-foreground/85">{item.l}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <Reveal variant="left" delay={0.1} className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 shadow-overlay backdrop-blur-sm sm:p-8">
              <Stagger as="ul" className="space-y-3">
                {CASE_METRICS.map(({ icon: Icon, label, value, change }) => (
                  <StaggerItem
                    key={label}
                    as="li"
                    className="flex items-center justify-between gap-4 rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.07] px-4 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate text-sm text-primary-foreground/85">{label}</span>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold">{value}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
                        {change}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="section-y bg-background">
        <div className="container-page">
          <Reveal className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card px-6 py-14 text-center shadow-card sm:px-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-brand-radial" />
            <Stagger trigger="mount" className="relative">
              <StaggerItem as="h2" className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your next creator campaign starts here
              </StaggerItem>
              <StaggerItem className="mx-auto mt-4 max-w-xl text-muted-foreground">
                <p>
                  Get a clear creator strategy, campaign format and estimated budget for your next
                  launch.
                </p>
              </StaggerItem>
              <StaggerItem className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/signup")} className="group w-full sm:w-auto">
                  Start for free
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/pricing")}
                  className="w-full sm:w-auto"
                >
                  See pricing
                </Button>
              </StaggerItem>
              <StaggerItem className="mt-5 text-xs text-muted-foreground">
                <p>Free to join · No credit card required · Cancel anytime</p>
              </StaggerItem>
            </Stagger>
          </Reveal>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
