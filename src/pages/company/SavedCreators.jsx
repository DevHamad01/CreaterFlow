import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import EmptyState from "@/components/EmptyState";
import { Heart, Trash2, StickyNote, Tag, ChevronDown, Filter, X, Plus, Check } from "lucide-react";

const PIPELINE_STAGES = [
  { id: "discovered", label: "Discovered", color: "bg-slate-100 text-slate-600" },
  { id: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  { id: "negotiating", label: "Negotiating", color: "bg-amber-100 text-amber-700" },
  { id: "contracted", label: "Contracted", color: "bg-emerald-100 text-emerald-700" },
  { id: "passed", label: "Passed", color: "bg-red-50 text-red-600" },
];

const TAGS = [
  { id: "hot", label: "🔥 Hot", color: "bg-red-100 text-red-700" },
  { id: "warm", label: "🌤️ Warm", color: "bg-amber-100 text-amber-700" },
  { id: "cold", label: "❄️ Cold", color: "bg-blue-100 text-blue-700" },
  { id: "contacted", label: "✉️ Contacted", color: "bg-purple-100 text-purple-700" },
  { id: "negotiating", label: "💬 Negotiating", color: "bg-indigo-100 text-indigo-700" },
  { id: "booked", label: "✅ Booked", color: "bg-emerald-100 text-emerald-700" },
];

export default function SavedCreators() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [stageDropdown, setStageDropdown] = useState(null);
  const [tagDropdown, setTagDropdown] = useState(null);

  useEffect(() => {
    if (!user) return;
    base44.entities.Favorite.filter({ created_by_id: user.id }, "-created_date")
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, [user]);

  const updateFavorite = async (id, data) => {
    await base44.entities.Favorite.update(id, data);
    setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const removeFavorite = async (id) => {
    await base44.entities.Favorite.delete(id);
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const saveNote = async (id) => {
    await updateFavorite(id, { notes: noteText });
    setEditingNotes(null);
    setNoteText("");
  };

  const filtered = useMemo(() => {
    return favorites.filter((f) => {
      if (filterStage && f.pipeline_stage !== filterStage) return false;
      if (filterTag && f.tag !== filterTag) return false;
      return true;
    });
  }, [favorites, filterStage, filterTag]);

  const stageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach((s) => {
      counts[s.id] = favorites.filter((f) => f.pipeline_stage === s.id).length;
    });
    return counts;
  }, [favorites]);

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-slate-200 rounded w-48" />{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Creator CRM</h1>
          <p className="text-sm text-slate-500 mt-1">{favorites.length} creators in your pipeline</p>
        </div>
      </div>

      {/* Pipeline stage overview */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className={`rounded-xl border border-slate-200 p-3 ${filterStage === stage.id ? "ring-2 ring-blue-400" : ""}`}>
              <button onClick={() => setFilterStage(filterStage === stage.id ? "" : stage.id)} className="w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${stage.color.split(" ")[0]}`} />
                  <span className="text-xs font-medium text-slate-600">{stage.label}</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{stageCounts[stage.id]}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="">All tags</option>
            {TAGS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {(filterStage || filterTag) && (
            <button onClick={() => { setFilterStage(""); setFilterTag(""); }} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Creator list */}
      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={Heart} title="No saved creators yet" description="Browse the marketplace and save creators to build your pipeline." action={<Link to="/app/marketplace" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Browse marketplace</Link>} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No creators match your filters" description="Try clearing some filters to see more results." />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const stage = PIPELINE_STAGES.find((s) => s.id === f.pipeline_stage) || PIPELINE_STAGES[0];
            const tag = TAGS.find((t) => t.id === f.tag);
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar + name */}
                  <Link to={`/creators/${f.creator_id}`} className="flex items-center gap-3 flex-shrink-0">
                    <img src={f.creator_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${f.creator_name}&backgroundColor=2563eb`} alt="" className="w-12 h-12 rounded-full bg-slate-100" />
                    <div>
                      <h3 className="font-medium text-slate-900 hover:text-blue-600">{f.creator_name}</h3>
                      <p className="text-xs text-slate-500">{f.creator_niche} · {f.creator_followers?.toLocaleString()} followers</p>
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0" />

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-slate-900">€{f.creator_price}</p>
                    <p className="text-xs text-slate-400">per post</p>
                  </div>

                  {/* Tag selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setTagDropdown(tagDropdown === f.id ? null : f.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${tag ? tag.color : "bg-slate-100 text-slate-500"}`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag ? tag.label.split(" ")[1] : "Tag"}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {tagDropdown === f.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg z-10 py-1">
                        <button onClick={() => { updateFavorite(f.id, { tag: "" }); setTagDropdown(null); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">No tag</button>
                        {TAGS.map((t) => (
                          <button key={t.id} onClick={() => { updateFavorite(f.id, { tag: t.id }); setTagDropdown(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${t.color.split(" ")[0]}`} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pipeline stage selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setStageDropdown(stageDropdown === f.id ? null : f.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stage.color}`}
                    >
                      {stage.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {stageDropdown === f.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-slate-200 shadow-lg z-10 py-1">
                        {PIPELINE_STAGES.map((s) => (
                          <button key={s.id} onClick={() => { updateFavorite(f.id, { pipeline_stage: s.id }); setStageDropdown(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${s.color.split(" ")[0]}`} />
                            {s.label}
                            {f.pipeline_stage === s.id && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes toggle */}
                  <button
                    onClick={() => { setEditingNotes(editingNotes === f.id ? null : f.id); setNoteText(f.notes || ""); }}
                    className={`p-1.5 rounded-lg flex-shrink-0 ${f.notes ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"}`}
                    title="Notes"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button onClick={() => removeFavorite(f.id)} className="p-1.5 text-slate-300 hover:text-red-500 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Notes section */}
                {editingNotes === f.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add notes about this creator..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveNote(f.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Save note</button>
                      <button onClick={() => setEditingNotes(null)} className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-medium hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Inline notes display */}
                {f.notes && editingNotes !== f.id && (
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <p className="text-xs text-slate-500 italic">"{f.notes}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}