import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { TrendingUp, MousePointerClick, Target, Wallet, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, PieChart, Pie, Cell
} from "recharts";

export default function Analytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Campaign.filter({ created_by_id: user.id }),
      base44.entities.CampaignMetric.filter({}),
      base44.entities.Lead.filter({ created_by_id: user.id }),
      base44.entities.Payment.filter({ created_by_id: user.id }),
    ]).then(([c, m, l, p]) => {
      // Filter metrics to only this user's campaigns
      const campaignIds = new Set(c.map((camp) => camp.id));
      setCampaigns(c);
      setMetrics(m.filter((mt) => campaignIds.has(mt.campaign_id)));
      setLeads(l);
      setPayments(p);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}</div></div>;

  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalQualifiedClicks = metrics.reduce((s, m) => s + (m.qualified_clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Performance across all your campaigns</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Impressions" value={totalImpressions.toLocaleString()} icon={TrendingUp} accent="purple" />
        <StatCard label="Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} accent="blue" />
        <StatCard label="Leads" value={totalLeads} icon={Target} accent="emerald" />
        <StatCard label="Pipeline" value={`€${(totalPipeline / 1000).toFixed(1)}K`} icon={Wallet} accent="amber" />
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Cost per click</p>
          <p className="text-2xl font-bold text-slate-900">€{cpc}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Cost per lead</p>
          <p className="text-2xl font-bold text-slate-900">€{cpl}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500 mb-1">Conversion rate</p>
          <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      {campaigns.length > 0 && metrics.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Performance bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Reach & engagement by campaign</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campaigns.map((c) => {
                const cm = metrics.filter((m) => m.campaign_id === c.id);
                return {
                  name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
                  impressions: cm.reduce((s, m) => s + (m.impressions || 0), 0),
                  clicks: cm.reduce((s, m) => s + (m.clicks || 0), 0),
                  leads: cm.reduce((s, m) => s + (m.leads || 0), 0),
                };
              })}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-20} textAnchor="end" height={60} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline by campaign */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Pipeline value by campaign</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={campaigns.map((c) => {
                const cLeads = leads.filter((l) => l.campaign_id === c.id);
                return {
                  name: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
                  pipeline: cLeads.reduce((s, l) => s + (l.value || 0), 0),
                };
              }).filter((d) => d.pipeline > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => `€${v.toLocaleString()}`} />
                <Bar dataKey="pipeline" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spend vs pipeline */}
      {campaigns.length > 0 && payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Spend vs. pipeline by campaign</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaigns.map((c) => {
              const cSpend = payments.filter((p) => p.campaign_id === c.id && p.status === "paid").reduce((s, p) => s + p.amount, 0);
              const cPipeline = leads.filter((l) => l.campaign_id === c.id).reduce((s, l) => s + (l.value || 0), 0);
              return {
                name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
                spend: cSpend,
                pipeline: cPipeline,
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-20} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => `€${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="spend" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pipeline" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Campaign performance</h2>
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState icon={BarChart3} title="No data yet" description="Create a campaign to start tracking performance." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Campaign</th>
                    <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Impressions</th>
                    <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Clicks</th>
                    <th className="text-right px-4 py-3 font-medium">Leads</th>
                    <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Pipeline</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((c) => {
                    const cMetrics = metrics.filter((m) => m.campaign_id === c.id);
                    const cLeads = leads.filter((l) => l.campaign_id === c.id);
                    const cPipeline = cLeads.reduce((s, l) => s + (l.value || 0), 0);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">{cMetrics.reduce((s, m) => s + (m.impressions || 0), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">{cMetrics.reduce((s, m) => s + (m.clicks || 0), 0)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{cLeads.length}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 hidden md:table-cell">€{cPipeline.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}