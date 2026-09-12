import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import {
  FolderKanban, Users, Wallet, Target, Plus, ArrowRight,
  TrendingUp, MousePointerClick, Search, BarChart3
} from "lucide-react";

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Campaign.filter({ created_by_id: user.id }, "-created_date"),
      base44.entities.Payment.filter({ created_by_id: user.id }),
      base44.entities.Lead.filter({ created_by_id: user.id }),
    ]).then(([c, p, l]) => {
      setCampaigns(c); setPayments(p); setLeads(l);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}</div></div>;

  const activeCampaigns = campaigns.filter((c) => ["active", "recruiting", "review", "live"].includes(c.status)).length;
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + 0, 0); // would come from metrics

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your creator campaigns.</p>
        </div>
        <button onClick={() => navigate("/app/campaigns/new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active campaigns" value={activeCampaigns} icon={FolderKanban} accent="blue" />
        <StatCard label="Total spend" value={`€${totalSpend.toLocaleString()}`} icon={Wallet} accent="emerald" />
        <StatCard label="Leads generated" value={totalLeads} icon={Target} accent="purple" />
        <StatCard label="Pipeline value" value={`€${(totalPipeline / 1000).toFixed(1)}K`} icon={TrendingUp} accent="amber" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/app/marketplace" className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Search className="w-5 h-5 text-blue-600" /></div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Browse marketplace</h3>
          <p className="text-sm text-slate-500 mt-1">Find creators for your next campaign</p>
        </Link>
        <Link to="/app/campaigns/new" className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3"><Plus className="w-5 h-5 text-purple-600" /></div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Create campaign</h3>
          <p className="text-sm text-slate-500 mt-1">Generate an AI brief and invite creators</p>
        </Link>
        <Link to="/app/analytics" className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">View analytics</h3>
          <p className="text-sm text-slate-500 mt-1">Track clicks, leads and pipeline</p>
        </Link>
      </div>

      {/* Recent campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent campaigns</h2>
          <Link to="/app/campaigns" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState icon={FolderKanban} title="No campaigns yet" description="Create your first campaign to start collaborating with creators." action={<button onClick={() => navigate("/app/campaigns/new")} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium">Create campaign</button>} />
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/app/campaigns/${c.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{c.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{c.objective}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-slate-500 hidden sm:block">€{c.budget?.toLocaleString() || 0}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}