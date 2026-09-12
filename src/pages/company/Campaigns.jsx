import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Plus, FolderKanban, Search } from "lucide-react";

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    base44.entities.Campaign.filter({ created_by_id: user.id }, "-created_date")
      .then(setCampaigns)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  const statusFilters = ["all", "draft", "recruiting", "active", "review", "live", "completed"];

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-slate-200 rounded w-48" />{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">{campaigns.length} total campaigns</p>
        </div>
        <button onClick={() => navigate("/app/campaigns/new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={FolderKanban} title="No campaigns found" description={filter === "all" ? "Create your first campaign to get started." : `No ${filter} campaigns yet.`} action={filter === "all" && <button onClick={() => navigate("/app/campaigns/new")} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Create campaign</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Link key={c.id} to={`/app/campaigns/${c.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{c.objective}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>Budget: €{c.budget?.toLocaleString() || 0}</span>
                    {c.start_date && <span>Start: {c.start_date}</span>}
                    {c.end_date && <span>End: {c.end_date}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}