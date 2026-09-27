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
  Search, SlidersHorizontal, RefreshCw, X, Heart, ShieldCheck, BarChart3
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { creators as sampleCreators } from "@/data/creators";
import { Reveal } from "@/components/motion/Reveal";

// Candidate niches for filtering. This is the set the API is expected to
// return; the seed records use their own labels, so a niche with no matching
// records simply yields an empty grid rather than an error.
const NICHES = [
  "AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech",
  "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity",
];
const AVAILABILITY = ["available", "limited", "booked"];
const FOLLOWER_STEPS = [0, 5000, 10000, 20000, 30000];
const MAX_PRICE = 2000;

const selectTriggerClass =
  "h-11 w-full rounded-xl border-input bg-card text-sm transition-colors hover:border-primary/30 focus-visible:border-primary/50";

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
  // Seeded with the sample records so the grid is browsable immediately and
  // every filter has something to act on. A live response with rows replaces
  // them. The sample records use the same field names as the Base44 entity, so
  // the existing CreatorCard and filter pipeline are unchanged either way.
  const [creators, setCreators] = useState(sampleCreators);
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
      .then((rows) => {
        // Only overwrite on a non-empty response. Treating an empty array as
        // authoritative is what made the whole marketplace read as unavailable
        // the moment the backend had nothing to return.
        if (Array.isArray(rows) && rows.length > 0) setCreators(rows);
      })
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
      // Case-insensitive: the filter tokens are lowercase but entity records
      // have been seen storing this as both "available" and "Available",
      // which silently returned an empty grid for a non-empty marketplace.
      if (availability && (c.availability || "").toLowerCase() !== availability) return false;
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
      chips.push({
        key: "price",
        label: `Up to €${maxPrice.toLocaleString("en-US")}`,
        clear: () => setMaxPrice(MAX_PRICE),
      });
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
        <label htmlFor="mk-niche" className="eyebrow mb-2 block">
          Niche
        </label>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger id="mk-niche" className={selectTriggerClass}>
            <SelectValue placeholder="All niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {NICHES.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset>
        <legend className="eyebrow mb-2">Availability</legend>
        {/* min-h-11 on every chip: these are tap targets, and py-1.5 alone
            left them under the 44px minimum at this text size. */}
        <div className="flex flex-wrap gap-2">
          {["", ...AVAILABILITY].map((a) => {
            const active = availability === a;
            return (
              <button
                key={a || "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setAvailability(a)}
                className={`inline-flex min-h-11 items-center rounded-full border px-3.5 text-sm capitalize transition-[border-color,background-color,color] duration-200 ease-smooth ${
                  active
                    ? "border-primary/40 bg-primary/10 font-medium text-primary"
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
        <label htmlFor="mk-followers" className="eyebrow mb-2 block">
          Min followers
        </label>
        <Select
          value={String(minFollowers)}
          onValueChange={(v) => setMinFollowers(Number(v))}
        >
          <SelectTrigger id="mk-followers" className={selectTriggerClass}>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {FOLLOWER_STEPS.map((v) => (
              <SelectItem key={v} value={String(v)}>
                {v === 0 ? "Any" : `${v / 1000}K+`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Label, current value, slider and bounds on four separate rows. The
          previous version put the label and the live value in one flex row
          sharing an eyebrow class, which clipped "Max price" against the
          number at narrow widths. aria-live on the value means a screen reader
          hears the new ceiling as the slider moves. */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label htmlFor="mk-price" className="eyebrow mb-0">
            Max price
          </label>
          <span
            aria-live="off"
            className="text-sm font-semibold tabular-nums text-primary"
          >
            €{maxPrice.toLocaleString("en-US")}
          </span>
        </div>
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
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>€200</span>
          <span>€{MAX_PRICE.toLocaleString("en-US")}</span>
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
              {/* Fixed copy, not a computed count. A live count here reads
                  "Browse 0 vetted creators" whenever the request is in flight
                  or the API is unreachable, which is a marketing sentence
                  reporting a transient state. */}
              Browse vetted B2B creators — filter by niche, audience and price.
              New profiles added weekly.
            </p>
          </StaggerItem>
        </Stagger>
      </div>

      <div className="container-page py-8 pb-16">
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                aria-label="Sort creators"
                className={`${selectTriggerClass} sm:w-52`}
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  : // Zero results is left to the empty state below, which
                    // explains what to do about it. Announcing "0 creators"
                    // in the toolbar too would repeat the same fact twice.
                    filtered.length > 0
                    ? `${filtered.length} ${filtered.length === 1 ? "creator" : "creators"}${
                        hasFilters && creators.length ? ` of ${creators.length}` : ""
                      }`
                    : hasFilters
                    ? "No matches"
                    : "No creators available"}
              </p>
              {!loading && !error && filtered.length > 0 && savedIds.size > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Heart aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                  {savedIds.size} saved
                </span>
              )}
            </div>

            {/* The grid is seeded, so a pending request must not replace
                browsable cards with a skeleton. The skeleton is reserved for
                the case where there is genuinely nothing to show yet, which
                cannot currently happen — kept as the fallback if the seed is
                ever removed rather than a permanent gate. */}
            {loading && creators.length === 0 && <FilterSkeleton />}

            {/* error — the seed records stay in the grid, so a failed refresh
                is a status note above the results rather than a panel that
                replaces content the user can already browse. */}
            {!loading && error && (
              <p
                role="status"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/5 px-3 py-1 text-xs text-warning"
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
                <button
                  type="button"
                  onClick={loadCreators}
                  className="rounded font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </p>
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
            {/* Not gated on `loading`: the grid renders whatever is in state,
                which is the seed records until live rows arrive. Gating it on
                !loading is what produced a blank page whenever the backend was
                slow or unreachable. */}
            {filtered.length > 0 && (
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

        {/* Reassurance strip. Sits above the footer to answer the objection
            the empty state raises — "how do I know these are any good" — with
            the three things the page actually does. */}
        <Reveal className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-border/60 pt-8 text-sm text-muted-foreground">
          {[
            { icon: Search, label: "Search by niche & audience" },
            { icon: ShieldCheck, label: "Vetted before listing" },
            { icon: BarChart3, label: "Performance per post" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-primary" />
              {label}
            </span>
          ))}
        </Reveal>
      </div>

      <PublicFooter />
    </div>
  );
}
