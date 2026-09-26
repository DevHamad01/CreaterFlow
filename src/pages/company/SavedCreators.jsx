import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Trash2, StickyNote, Tag, ChevronDown, Filter, X, Check,
  AlertTriangle, RefreshCw, Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { id: "discovered", label: "Discovered", dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground" },
  { id: "contacted", label: "Contacted", dot: "bg-primary", chip: "bg-primary/10 text-primary" },
  { id: "negotiating", label: "Negotiating", dot: "bg-warning", chip: "bg-warning/10 text-warning" },
  { id: "contracted", label: "Contracted", dot: "bg-success", chip: "bg-success/10 text-success" },
  { id: "passed", label: "Passed", dot: "bg-danger", chip: "bg-danger/10 text-danger" },
];

const TAGS = [
  { id: "hot", label: "Hot", dot: "bg-danger", chip: "bg-danger/10 text-danger" },
  { id: "warm", label: "Warm", dot: "bg-warning", chip: "bg-warning/10 text-warning" },
  { id: "cold", label: "Cold", dot: "bg-primary", chip: "bg-primary/10 text-primary" },
  { id: "contacted", label: "Contacted", dot: "bg-iris", chip: "bg-iris/10 text-iris" },
  { id: "negotiating", label: "Negotiating", dot: "bg-iris", chip: "bg-iris/10 text-iris" },
  { id: "booked", label: "Booked", dot: "bg-success", chip: "bg-success/10 text-success" },
];

export default function SavedCreators() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStage, setFilterStage] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [pendingNote, setPendingNote] = useState(false);
  const menuRef = useRef(null);

  const loadFavorites = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    base44.entities.Favorite.filter({ created_by_id: user.id }, "-created_date")
      .then((rows) => setFavorites(rows || []))
      .catch((err) => {
        console.error("SavedCreators: load failed", err);
        setError("We couldn't load your pipeline. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // close the open dropdown on Escape or an outside click
  useEffect(() => {
    if (!openMenu) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

  const patchFavorite = useCallback((id, data) => {
    setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, []);

  const updateFavorite = async (id, data, successMessage) => {
    setPendingId(id);
    try {
      await base44.entities.Favorite.update(id, data);
      patchFavorite(id, data);
      if (successMessage) toast({ title: successMessage });
    } catch (err) {
      console.error("SavedCreators: update failed", err);
      toast({
        title: "We couldn't save that change",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
      setOpenMenu(null);
    }
  };

  const removeFavorite = async (id, name) => {
    setPendingId(id);
    try {
      await base44.entities.Favorite.delete(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Removed from pipeline", description: name });
    } catch (err) {
      console.error("SavedCreators: delete failed", err);
      toast({
        title: "We couldn't remove this creator",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const saveNote = async (id, name) => {
    setPendingNote(true);
    try {
      await base44.entities.Favorite.update(id, { notes: noteText });
      patchFavorite(id, { notes: noteText });
      setEditingNotes(null);
      setNoteText("");
      toast({ title: noteText ? "Note saved" : "Note cleared", description: name });
    } catch (err) {
      console.error("SavedCreators: note save failed", err);
      toast({
        title: "We couldn't save your note",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingNote(false);
    }
  };

  const filtered = useMemo(
    () =>
      favorites.filter((f) => {
        if (filterStage && f.pipeline_stage !== filterStage) return false;
        if (filterTag && f.tag !== filterTag) return false;
        return true;
      }),
    [favorites, filterStage, filterTag]
  );

  const stageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach((s) => {
      counts[s.id] = favorites.filter((f) => f.pipeline_stage === s.id).length;
    });
    return counts;
  }, [favorites]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your creator pipeline</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your pipeline"
          description={error}
          action={
            <Button onClick={loadFavorites}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator CRM"
        description={`${favorites.length} ${favorites.length === 1 ? "creator" : "creators"} in your pipeline`}
      />

      {favorites.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PIPELINE_STAGES.map((stage) => {
              const active = filterStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setFilterStage(active ? "" : stage.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all duration-200 ease-smooth",
                    active
                      ? "border-primary/40 bg-primary/5 ring-1 ring-inset ring-primary/25"
                      : "border-border/80 hover:border-primary/25 hover:bg-muted/50"
                  )}
                >
                  <span className="mb-1.5 flex items-center gap-2">
                    <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", stage.dot)} />
                    <span className="text-xs font-semibold text-muted-foreground">{stage.label}</span>
                  </span>
                  <span className="block font-display text-xl font-semibold tabular-nums">
                    {stageCounts[stage.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Filter aria-hidden="true" className="h-3.5 w-3.5" />
              Filter
            </span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              aria-label="Filter by pipeline stage"
              className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
            >
              <option value="">All stages</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              aria-label="Filter by tag"
              className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
            >
              <option value="">All tags</option>
              {TAGS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {(filterStage || filterTag) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStage("");
                  setFilterTag("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </>
      )}

      {favorites.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="collaboration"
              title="No saved creators yet"
            description="Browse the marketplace and save creators to build your pipeline."
            action={
              <Button asChild>
                <Link to="/app/marketplace">Browse marketplace</Link>
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card">
              <EmptyState
                illustration="search"
                title="No creators match your filters"
            description="Try clearing some filters to see more of your pipeline."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStage("");
                  setFilterTag("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <Stagger as="ul" className="space-y-3" ref={menuRef} stagger={0.04}>
          {filtered.map((f) => {
            const stage =
              PIPELINE_STAGES.find((s) => s.id === f.pipeline_stage) || PIPELINE_STAGES[0];
            const tag = TAGS.find((t) => t.id === f.tag);
            const busy = pendingId === f.id;

            return (
              <StaggerItem key={f.id} className={cn("surface-card p-4", busy && "opacity-70")}>
                <div className="flex flex-wrap items-start gap-4">
                  <Link
                    to={`/creators/${f.creator_id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <img
                      src={
                        f.creator_avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          f.creator_name || "creator"
                        )}&backgroundColor=2563eb`
                      }
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-full border border-border/60 bg-muted object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold tracking-tight transition-colors hover:text-primary">
                        {f.creator_name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {f.creator_niche}
                        {f.creator_followers
                          ? ` · ${f.creator_followers.toLocaleString()} followers`
                          : ""}
                      </span>
                    </span>
                  </Link>

                  <div className="text-right">
                    <p className="font-display font-semibold">€{f.creator_price ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">per post</p>
                  </div>

                  {/* Tag menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === `tag-${f.id}` ? null : `tag-${f.id}`)}
                      aria-expanded={openMenu === `tag-${f.id}`}
                      aria-haspopup="menu"
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                        tag ? tag.chip : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Tag aria-hidden="true" className="h-3 w-3" />
                      {tag ? tag.label : "Tag"}
                      <ChevronDown aria-hidden="true" className="h-3 w-3" />
                    </button>
                    {openMenu === `tag-${f.id}` && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-border/80 bg-card py-1 shadow-overlay"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => updateFavorite(f.id, { tag: "" }, "Tag removed")}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          No tag
                        </button>
                        {TAGS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            role="menuitem"
                            onClick={() => updateFavorite(f.id, { tag: t.id }, `Tagged ${t.label}`)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                          >
                            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", t.dot)} />
                            {t.label}
                            {f.tag === t.id && (
                              <Check aria-hidden="true" className="ml-auto h-3 w-3 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stage menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === `stage-${f.id}` ? null : `stage-${f.id}`)}
                      aria-expanded={openMenu === `stage-${f.id}`}
                      aria-haspopup="menu"
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                        stage.chip
                      )}
                    >
                      {stage.label}
                      <ChevronDown aria-hidden="true" className="h-3 w-3" />
                    </button>
                    {openMenu === `stage-${f.id}` && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-border/80 bg-card py-1 shadow-overlay"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            role="menuitem"
                            onClick={() =>
                              updateFavorite(f.id, { pipeline_stage: s.id }, `Moved to ${s.label}`)
                            }
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                          >
                            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", s.dot)} />
                            {s.label}
                            {f.pipeline_stage === s.id && (
                              <Check aria-hidden="true" className="ml-auto h-3 w-3 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-1">
                    {busy && (
                      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotes(editingNotes === f.id ? null : f.id);
                        setNoteText(f.notes || "");
                      }}
                      aria-expanded={editingNotes === f.id}
                      aria-label={`${f.notes ? "Edit" : "Add"} notes for ${f.creator_name}`}
                      className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        f.notes
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <StickyNote aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavorite(f.id, f.creator_name)}
                      disabled={busy}
                      aria-label={`Remove ${f.creator_name} from pipeline`}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {editingNotes === f.id && (
                  <div className="mt-4 border-t border-border/70 pt-4">
                    <label
                      htmlFor={`notes-${f.id}`}
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Notes
                    </label>
                    <textarea
                      id={`notes-${f.id}`}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add notes about this creator..."
                      rows={2}
                      className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
                    />
                    <div className="mt-2.5 flex gap-2">
                      <Button size="sm" onClick={() => saveNote(f.id, f.creator_name)} disabled={pendingNote}>
                        {pendingNote ? (
                          <>
                            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save note"
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {f.notes && editingNotes !== f.id && (
                  <p className="mt-3 border-t border-border/70 pt-3 text-sm italic text-muted-foreground">
                    “{f.notes}”
                  </p>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
