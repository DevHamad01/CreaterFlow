import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import MatchScoreBadge from "@/components/intelligence/MatchScoreBadge";
import ComparisonModal from "@/components/intelligence/ComparisonModal";
import { computeCreatorMatch, rankCreatorsForCampaign } from "@/lib/intelligence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Search, Plus, GitCompare, X, Check, Heart, Store,
  AlertTriangle, RefreshCw, Loader2, SlidersHorizontal
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];

const SORTS = [
  { value: "followers", label: "Most followers" },
  { value: "engagement", label: "Highest engagement" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
  { value: "match", label: "Best match" },
];

const selectClass =
  "rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40";

export default function CompanyMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState("followers");
  const [savedIds, setSavedIds] = useState(new Set());
  const [campaigns, setCampaigns] = useState([]);
  const [addToCampaign, setAddToCampaign] = useState(null);
  const [matchCampaignId, setMatchCampaignId] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [bulkPending, setBulkPending] = useState(null);

  const loadCreators = useCallback(() => {
    setLoading(true);
    setError(null);
    base44.entities.Creator.list("-linkedin_followers", 100)
      .then((rows) => setCreators(rows || []))
      .catch((err) => {
        console.error("CompanyMarketplace: creators load failed", err);
        setError("We couldn't load the creator directory. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const loadUserData = useCallback(() => {
    if (!user) return;
    base44.entities.Favorite.filter({ created_by_id: user.id })
      .then((favs) => setSavedIds(new Set(favs.map((f) => f.creator_id))))
      .catch(() => {});
    base44.entities.Campaign.filter({ created_by_id: user.id })
      .then((rows) => setCampaigns(rows || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const trackSaving = (creatorId, on) =>
    setSavingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(creatorId);
      else next.delete(creatorId);
      return next;
    });

  const toggleSave = async (creatorId) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (!creator) return;
    trackSaving(creatorId, true);
    try {
      if (savedIds.has(creatorId)) {
        const favs = await base44.entities.Favorite.filter({
          created_by_id: user.id,
          creator_id: creatorId,
        });
        if (favs.length) await base44.entities.Favorite.delete(favs[0].id);
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(creatorId);
          return n;
        });
        toast({ title: "Removed from your pipeline", description: creator.name });
      } else {
        await base44.entities.Favorite.create({
          creator_id: creatorId, creator_name: creator.name, creator_avatar: creator.avatar_url,
          creator_niche: creator.niche, creator_headline: creator.headline,
          creator_followers: creator.linkedin_followers, creator_price: creator.price_per_post,
        });
        setSavedIds((prev) => new Set(prev).add(creatorId));
        toast({ title: "Saved to your pipeline", description: creator.name });
      }
    } catch (err) {
      console.error("CompanyMarketplace: save failed", err);
      toast({
        title: "We couldn't update your pipeline",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      trackSaving(creatorId, false);
    }
  };

  const addCreatorToCampaign = async (campaignId, creator) => {
    setBulkPending(`single-${campaignId}`);
    try {
      const fitScore = Math.floor(75 + Math.random() * 25);
      const campaign = campaigns.find((c) => c.id === campaignId);
      await base44.entities.CampaignCreator.create({
        campaign_id: campaignId,
        creator_id: creator.id,
        creator_name: creator.name,
        creator_avatar: creator.avatar_url,
        creator_niche: creator.niche,
        creator_followers: creator.linkedin_followers,
        fit_score: fitScore,
        price: creator.price_per_post,
        status: "invited",
        tracking_link: `${campaign?.tracking_base_url}/${creator.name.toLowerCase().replace(/\s+/g, "-")}`,
        invited_date: new Date().toISOString().split("T")[0],
      });
      setAddToCampaign(null);
      toast({
        title: "Creator invited",
        description: `${creator.name} was added to ${campaign?.name ?? "your campaign"}.`,
      });
      navigate(`/app/campaigns/${campaignId}`);
    } catch (err) {
      console.error("CompanyMarketplace: add to campaign failed", err);
      toast({
        title: "We couldn't send that invitation",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBulkPending(null);
    }
  };

  const matchCampaign = campaigns.find((c) => c.id === matchCampaignId);

  const filtered = useMemo(() => {
    let result = creators.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.headline?.toLowerCase().includes(search.toLowerCase()) && !c.niche?.toLowerCase().includes(search.toLowerCase())) return false;
      if (niche && c.niche !== niche) return false;
      if (c.linkedin_followers < minFollowers) return false;
      if (c.price_per_post > maxPrice) return false;
      return true;
    });
    if (sortBy === "followers") result.sort((a, b) => b.linkedin_followers - a.linkedin_followers);
    else if (sortBy === "engagement") result.sort((a, b) => b.engagement_rate - a.engagement_rate);
    else if (sortBy === "price_low") result.sort((a, b) => a.price_per_post - b.price_per_post);
    else if (sortBy === "price_high") result.sort((a, b) => b.price_per_post - a.price_per_post);
    else if (sortBy === "match" && matchCampaign) {
      result = rankCreatorsForCampaign(result, matchCampaign).map((r) => r.creator);
    }
    return result;
  }, [creators, search, niche, minFollowers, maxPrice, sortBy, matchCampaign]);

  const toggleSelect = (creatorId) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(creatorId)) n.delete(creatorId);
      else n.add(creatorId);
      return n;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c.id)));
  const clearSelection = () => setSelectedIds(new Set());
  const selectedCreators = creators.filter((c) => selectedIds.has(c.id));
  const hasActiveFilters = Boolean(search || niche || minFollowers > 0 || maxPrice < 2000 || sortBy !== "followers");

  const bulkSave = async () => {
    setBulkPending("save");
    try {
      for (const creator of selectedCreators) {
        if (savedIds.has(creator.id)) continue;
        await base44.entities.Favorite.create({
          creator_id: creator.id, creator_name: creator.name, creator_avatar: creator.avatar_url,
          creator_niche: creator.niche, creator_headline: creator.headline,
          creator_followers: creator.linkedin_followers, creator_price: creator.price_per_post,
        });
      }
      const favs = await base44.entities.Favorite.filter({ created_by_id: user.id });
      setSavedIds(new Set(favs.map((f) => f.creator_id)));
      setSelectedIds(new Set());
      toast({ title: "Saved to your pipeline" });
    } catch (err) {
      console.error("CompanyMarketplace: bulk save failed", err);
      toast({
        title: "We couldn't save those creators",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBulkPending(null);
    }
  };

  const bulkInvite = async (campaignId) => {
    setBulkPending(`invite-${campaignId}`);
    try {
      const campaign = campaigns.find((c) => c.id === campaignId);
      for (const creator of selectedCreators) {
        const exists = await base44.entities.CampaignCreator.filter({ campaign_id: campaignId, creator_id: creator.id });
        if (exists.length > 0) continue;
        const match = computeCreatorMatch(creator, campaign);
        await base44.entities.CampaignCreator.create({
          campaign_id: campaignId,
          creator_id: creator.id,
          creator_name: creator.name,
          creator_avatar: creator.avatar_url,
          creator_niche: creator.niche,
          creator_followers: creator.linkedin_followers,
          fit_score: match.score,
          price: creator.price_per_post,
          status: "invited",
          tracking_link: `${campaign?.tracking_base_url}/${creator.name.toLowerCase().replace(/\s+/g, "-")}`,
          invited_date: new Date().toISOString().split("T")[0],
        });
      }
      setBulkInviteOpen(false);
      setSelectedIds(new Set());
      toast({
        title: "Invitations sent",
        description: `${selectedCreators.length} creators invited to ${campaign?.name ?? "the campaign"}.`,
      });
      navigate(`/app/campaigns/${campaignId}`);
    } catch (err) {
      console.error("CompanyMarketplace: bulk invite failed", err);
      toast({
        title: "We couldn't send those invitations",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBulkPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator marketplace"
        icon={Store}
        description={
          loading
            ? "Loading the creator directory"
            : `${filtered.length} of ${creators.length} ${creators.length === 1 ? "creator" : "creators"} available`
        }
      />

      <div className="surface-card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search creators"
              className="pl-10"
            />
          </div>

          <div>
            <Label htmlFor="niche-filter" className="sr-only">Niche</Label>
            <select
              id="niche-filter"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className={cn(selectClass, "h-[42px] w-full")}
            >
              <option value="">All niches</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="sort-filter" className="sr-only">Sort by</Label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={cn(selectClass, "h-[42px] w-full")}
            >
              {SORTS.filter((s) => s.value !== "match" || campaigns.length > 0).map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="followers-filter" className="sr-only">Minimum followers</Label>
            <select
              id="followers-filter"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
              className={cn(selectClass, "h-[42px] w-full")}
            >
              <option value={0}>Any followers</option>
              <option value={5000}>5K+ followers</option>
              <option value={10000}>10K+ followers</option>
              <option value={20000}>20K+ followers</option>
              <option value={30000}>30K+ followers</option>
            </select>
          </div>

          <div className="sm:col-span-2 xl:col-span-1 xl:col-start-4">
            <label
              htmlFor="price-filter"
              className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
                Max price
              </span>
              <span className="font-display font-semibold text-foreground">€{maxPrice}</span>
            </label>
            <input
              id="price-filter"
              type="range"
              min="200"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-[42px] w-full cursor-pointer accent-primary"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setNiche("");
                setMinFollowers(0);
                setMaxPrice(2000);
                setSortBy("followers");
              }}
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {campaigns.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
          <label
            htmlFor="match-campaign"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Match for campaign
          </label>
          <select
            id="match-campaign"
            value={matchCampaignId}
            onChange={(e) => {
              setMatchCampaignId(e.target.value);
              if (e.target.value) setSortBy("match");
            }}
            className={cn(selectClass, "h-9 max-w-xs flex-1 py-1.5")}
          >
            <option value="">No campaign selected</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {matchCampaignId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMatchCampaignId("");
                setSortBy("followers");
              }}
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-card px-4 py-3 shadow-overlay">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Select all ({filtered.length})
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {campaigns.length > 0 && (
              <Button size="sm" onClick={() => setBulkInviteOpen(true)}>
                <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                Invite to campaign
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={bulkSave} disabled={bulkPending === "save"}>
              {bulkPending === "save" ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Heart aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              Save all
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowCompare(true)}
              disabled={selectedIds.size < 2}
            >
              <GitCompare aria-hidden="true" className="h-3.5 w-3.5" />
              Compare
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading creators</span>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="surface-card mx-auto max-w-lg p-8" role="alert">
          <EmptyState
            icon={AlertTriangle}
            title="We couldn't load the marketplace"
            description={error}
            action={
              <Button onClick={loadCreators}>
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Try again
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="search"
              title="No creators found"
            description={
              creators.length === 0
                ? "The creator directory is empty right now. Check back soon."
                : "Try adjusting your filters to widen your search."
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setNiche("");
                    setMinFollowers(0);
                    setMaxPrice(2000);
                    setSortBy("followers");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" stagger={0.04}>
          {filtered.map((c) => {
            const selected = selectedIds.has(c.id);
            const saving = savingIds.has(c.id);
            return (
              <StaggerItem key={c.id} className={cn("relative", saving && "opacity-70")}>
                <button
                  type="button"
                  onClick={() => toggleSelect(c.id)}
                  aria-pressed={selected}
                  aria-label={`Select ${c.name} for bulk actions or comparison`}
                  className={cn(
                    "absolute left-3 top-3 z-10 inline-flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors",
                    selected
                      ? "border-primary/40 bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  {selected && <Check aria-hidden="true" className="h-3 w-3" />}
                </button>

                {matchCampaign && (
                  <div className="absolute left-10 top-3 z-10">
                    <MatchScoreBadge creator={c} campaign={matchCampaign} />
                  </div>
                )}

                <CreatorCard
                  creator={c}
                  saved={savedIds.has(c.id)}
                  onToggleSave={toggleSave}
                />

                {campaigns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddToCampaign(c)}
                    aria-label={`Add ${c.name} to a campaign`}
                    className="absolute right-12 top-3 rounded-lg bg-primary p-1.5 text-primary-foreground shadow-xs transition-all duration-200 ease-smooth hover:bg-primary/90"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      )}

      <Dialog open={Boolean(addToCampaign)} onOpenChange={(open) => !open && setAddToCampaign(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add {addToCampaign?.name} to campaign</DialogTitle>
            <DialogDescription>Select a campaign to invite this creator.</DialogDescription>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={bulkPending === `single-${c.id}`}
                onClick={() => addCreatorToCampaign(c.id, addToCampaign)}
                className="w-full rounded-xl border border-border/80 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/60 disabled:opacity-60"
              >
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">{c.status}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkInviteOpen} onOpenChange={(open) => !open && setBulkInviteOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite {selectedIds.size} creators to a campaign</DialogTitle>
            <DialogDescription>
              Select a campaign to send bulk invitations. Already-invited creators will be skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={bulkPending === `invite-${c.id}`}
                onClick={() => bulkInvite(c.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/80 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/60 disabled:opacity-60"
              >
                <span>
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="mt-0.5 block text-xs capitalize text-muted-foreground">{c.status}</span>
                </span>
                {bulkPending === `invite-${c.id}` && (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showCompare && selectedCreators.length >= 2 && (
        <ComparisonModal
          creators={selectedCreators}
          campaign={matchCampaign}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
