import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { toast } from "@/hooks/use-toast";
import {
  Search, SlidersHorizontal, AlertTriangle, RefreshCw, X, Heart
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const NICHES = [
  "AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech",
  "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity",
];
const AVAILABILITY = ["available", "limited", "booked"];
const FOLLOWER_STEPS = [0, 5000, 10000, 20000, 30000];
const MAX_PRICE = 2000;

const selectClass =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/30 focus-visible:border-primary/50";

const SORTS = [
  { value: "followers", label: "Most followers" },
  { value: "engagement", label: "Highest engagement" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

function FilterSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
      {[...Array(9)].map((_, i) => (
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
      <span className="sr-only">Loading creators…</span>
    </div>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [availability, setAvailability] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sortBy, setSortBy] = useState("followers");
  const [savedIds, setSavedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);

  const loadCreators = useCallback(() => {
    setLoading(true);
    setError(null);
    base44.entities.Creator.list("-linkedin_followers", 100)
      .then((rows) => setCreators(Array.isArray(rows) ? rows : []))
      .catch((err) => {
        console.error("Marketplace: failed to load creators", err);
        setError(err?.message || "We couldn't reach the marketplace. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    base44.entities.Favorite.filter({ created_by_id: user.id })
      .then((favs) => setSavedIds(new Set((favs || []).map((f) => f.creator_id))))
      .catch(() => {});
  }, [user]);

  const toggleSave = async (creatorId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const creator = creators.find((c) => c.id === creatorId);
    const wasSaved = savedIds.has(creatorId);

    setPendingSave(creatorId);
    try {
      if (wasSaved) {
        const favs = await base44.entities.Favorite.filter({
          created_by_id: user.id,
          creator_id: creatorId,
        });
        if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(creatorId);
          return next;
        });
        toast({ title: "Removed from saved", description: creator?.name });
      } else {
        await base44.entities.Favorite.create({
          creator_id: creatorId,
          creator_name: creator.name,
          creator_avatar: creator.avatar_url,
          creator_niche: creator.niche,
          creator_headline: creator.headline,
          creator_followers: creator.linkedin_followers,
          creator_price: creator.price_per_post,
        });
        setSavedIds((prev) => new Set(prev).add(creatorId));
        toast({ title: "Saved to your shortlist", description: creator?.name });
      }
    } catch (err) {
      console.error("Marketplace: save toggle failed", err);
      toast({
        title: "Couldn't update your shortlist",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingSave(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = creators.filter((c) => {
      if (q) {
        const haystack = `${c.name} ${c.headline || ""} ${c.niche || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (niche && c.niche !== niche) return false;
      if (availability && c.availability !== availability) return false;
      if (c.linkedin_followers < minFollowers) return false;
      if (c.price_per_post > maxPrice) return false;
      return true;
    });

    if (sortBy === "followers") result.sort((a, b) => b.linkedin_followers - a.linkedin_followers);
    else if (sortBy === "engagement") result.sort((a, b) => b.engagement_rate - a.engagement_rate);
    else if (sortBy === "price_low") result.sort((a, b) => a.price_per_post - b.price_per_post);
    else if (sortBy === "price_high") result.sort((a, b) => b.price_per_post - a.price_per_post);

    return result;
  }, [creators, search, niche, availability, minFollowers, maxPrice, sortBy]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (niche) chips.push({ key: "niche", label: niche, clear: () => setNiche("") });
    if (availability) {
      chips.push({
        key: "availability",
        label: availability.charAt(0).toUpperCase() + availability.slice(1),
        clear: () => setAvailability(""),
      });
    }
    if (minFollowers > 0) {
      chips.push({
        key: "followers",
        label: `${(minFollowers / 1000).toFixed(0)}K+ followers`,
        clear: () => setMinFollowers(0),
      });
    }
    if (maxPrice < MAX_PRICE) {
      chips.push({ key: "price", label: `Up to €${maxPrice}`, clear: () => setMaxPrice(MAX_PRICE) });
    }
    return chips;
  }, [niche, availability, minFollowers, maxPrice]);

  const clearFilters = () => {
    setSearch("");
    setNiche("");
    setAvailability("");
    setMinFollowers(0);
    setMaxPrice(MAX_PRICE);
  };

  const hasFilters = Boolean(search) || activeChips.length > 0;

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <label htmlFor="mk-niche" className="eyebrow mb-2 block">Niche</label>
        <select
          id="mk-niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className={selectClass}
        >
          <option value="">All niches</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="eyebrow mb-2">Availability</legend>
        <div className="flex flex-wrap gap-1.5">
          {["", ...AVAILABILITY].map((a) => {
            const active = availability === a;
            return (
              <button
                key={a || "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setAvailability(a)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-[border-color,background-color,color] duration-200 ease-smooth ${
                  active
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground"
                }`}
              >
                {a || "all"}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="mk-followers" className="eyebrow mb-2 block">Min followers</label>
        <select
          id="mk-followers"
          value={minFollowers}
          onChange={(e) => setMinFollowers(Number(e.target.value))}
          className={selectClass}
        >
          {FOLLOWER_STEPS.map((v) => (
            <option key={v} value={v}>{v === 0 ? "Any" : `${v / 1000}K+`}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mk-price" className="eyebrow mb-2 flex items-center justify-between">
          <span>Max price</span>
          <span className="font-display text-sm font-semibold tracking-normal text-primary normal-case">
            €{maxPrice}
          </span>
        </label>
        <input
          id="mk-price"
          type="range"
          min="200"
          max={MAX_PRICE}
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>€200</span>
          <span>€{MAX_PRICE}</span>
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-border/60 bg-brand-radial">
        <Stagger trigger="mount" className="container-page relative py-12 sm:py-14">
          <StaggerItem as="span" className="eyebrow block">
            Marketplace
          </StaggerItem>
          <StaggerItem as="h1" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Find your next creator
          </StaggerItem>
          <StaggerItem className="mt-2 max-w-2xl text-muted-foreground">
            <p>
              {loading
                ? "Loading vetted B2B creators…"
                : `Browse ${creators.length.toLocaleString()} vetted creators. Filter by niche, audience and price.`}
            </p>
          </StaggerItem>
        </Stagger>
      </div>

      <div className="container-page py-8">
        {/* Search + sort */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators, niches, headlines…"
              aria-label="Search creators"
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort creators"
              className={`${selectClass} sm:w-52`}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="mk-filters"
              className="lg:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
              Filters
              {activeChips.length > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {activeChips.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="group inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 py-1 pl-3 pr-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {chip.label}
                <X aria-hidden="true" className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="surface-card sticky top-24 p-5">
              <h2 className="mb-5 text-sm font-semibold">Filters</h2>
              {filterPanel}
            </div>
          </aside>

          {/* Mobile filters */}
          {showFilters && (
            <div id="mk-filters" className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-scrim/40 backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
                aria-hidden="true"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 shadow-overlay"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Close filters">
                    <X aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </div>
                {filterPanel}
                <Button className="mt-6 w-full" onClick={() => setShowFilters(false)}>
                  Show {loading ? "…" : filtered.length} creators
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {loading
                  ? "Loading creators…"
                  : `${filtered.length} ${filtered.length === 1 ? "creator" : "creators"}${
                      hasFilters && creators.length ? ` of ${creators.length}` : ""
                    }`}
              </p>
              {!loading && !error && filtered.length > 0 && savedIds.size > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Heart aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                  {savedIds.size} saved
                </span>
              )}
            </div>

            {/* loading */}
            {loading && <FilterSkeleton />}

            {/* error */}
            {!loading && error && (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 rounded-2xl border border-danger/25 bg-danger/5 px-6 py-16 text-center"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <AlertTriangle aria-hidden="true" className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">Couldn&apos;t load creators</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={loadCreators}>
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            )}

            {/* empty: no results for the current filters */}
            {!loading && !error && filtered.length === 0 && (
              <div className="surface-card">
                <EmptyState
                  illustration={hasFilters ? "search" : "collaboration"}
                  title={creators.length ? "No creators match these filters" : "No creators available yet"}
                  description={
                    creators.length
                      ? "Try widening your price range, lowering the follower minimum, or clearing a niche."
                      : "Creators appear here once they're approved for the marketplace. Check back shortly."
                  }
                  action={
                    hasFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        <X aria-hidden="true" className="h-4 w-4" />
                        Clear all filters
                      </Button>
                    ) : null
                  }
                />
              </div>
            )}

            {/* success — one Stagger drives the whole grid. Each card is an
                observer-free child; the grid itself is the single trigger. */}
            {!loading && !error && filtered.length > 0 && (
              <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" stagger={0.04}>
                {filtered.map((c) => (
                  <StaggerItem
                    key={c.id}
                    className={pendingSave === c.id ? "opacity-60 transition-opacity" : ""}
                  >
                    <CreatorCard
                      creator={c}
                      saved={savedIds.has(c.id)}
                      onToggleSave={toggleSave}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
