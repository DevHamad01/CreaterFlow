import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp, MousePointerClick, Target, Wallet, BarChart3,
  AlertTriangle, RefreshCw, Coins, HandCoins, Percent
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { base44 } from "@/api/base44Client";
import { CHART_COLORS, CHART_TOOLTIP, CHART_AXIS_TICK } from "@/lib/chartTheme";

const CHART = CHART_COLORS;

export default function Analytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      base44.entities.Campaign.filter({ created_by_id: user.id }),
      base44.entities.CampaignMetric.filter({}),
      base44.entities.Lead.filter({ created_by_id: user.id }),
      base44.entities.Payment.filter({ created_by_id: user.id }),
    ])
      .then(([c, m, l, p]) => {
        // Filter metrics to only this user's campaigns
        const campaignIds = new Set(c.map((camp) => camp.id));
        setCampaigns(c || []);
        setMetrics((m || []).filter((mt) => campaignIds.has(mt.campaign_id)));
        setLeads(l || []);
        setPayments(p || []);
      })
      .catch((err) => {
        console.error("Analytics: load failed", err);
        setError("We couldn't load your performance data. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading analytics</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your analytics"
          description={error}
          action={
            <Button onClick={load}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : "0.0";

  const reachData = campaigns.map((c) => {
    const cm = metrics.filter((m) => m.campaign_id === c.id);
    return {
      name: c.name.length > 18 ? `${c.name.slice(0, 18)}…` : c.name,
      impressions: cm.reduce((s, m) => s + (m.impressions || 0), 0),
      clicks: cm.reduce((s, m) => s + (m.clicks || 0), 0),
      leads: cm.reduce((s, m) => s + (m.leads || 0), 0),
    };
  });

  const pipelineData = campaigns
    .map((c) => {
      const cLeads = leads.filter((l) => l.campaign_id === c.id);
      return {
        name: c.name.length > 15 ? `${c.name.slice(0, 15)}…` : c.name,
        pipeline: cLeads.reduce((s, l) => s + (l.value || 0), 0),
      };
    })
    .filter((d) => d.pipeline > 0);

  const spendData = campaigns.map((c) => {
    const cSpend = payments
      .filter((p) => p.campaign_id === c.id && p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);
    const cPipeline = leads
      .filter((l) => l.campaign_id === c.id)
      .reduce((s, l) => s + (l.value || 0), 0);
    return {
      name: c.name.length > 18 ? `${c.name.slice(0, 18)}…` : c.name,
      spend: cSpend,
      pipeline: cPipeline,
    };
  });

  const hasChartData = campaigns.length > 0 && metrics.length > 0;
  const hasSpendData = campaigns.length > 0 && payments.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        icon={BarChart3}
        description="Performance across all your campaigns"
      />

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.05}>
        <StatCard label="Impressions" value={totalImpressions.toLocaleString()} icon={TrendingUp} accent="iris" />
        <StatCard label="Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} accent="primary" />
        <StatCard label="Leads" value={totalLeads} icon={Target} accent="success" />
        <StatCard label="Pipeline" value={`€${(totalPipeline / 1000).toFixed(1)}K`} icon={Wallet} accent="warning" />
      </Stagger>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-3" stagger={0.05}>
        <StatCard dense label="Cost per click" value={`€${cpc}`} icon={Coins} accent="neutral" />
        <StatCard dense label="Cost per lead" value={`€${cpl}`} icon={HandCoins} accent="neutral" />
        <StatCard dense label="Conversion rate" value={`${conversionRate}%`} icon={Percent} accent="neutral" className="col-span-2 lg:col-span-1" />
      </Stagger>

      {hasChartData && (
        <Stagger className="grid gap-4 lg:grid-cols-2" stagger={0.09}>
          <StaggerItem className="surface-card p-6">
            <h3 className="mb-4 font-semibold tracking-tight">Reach &amp; engagement by campaign</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis
                  dataKey="name"
                  tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  stroke={CHART.grid}
                />
                <YAxis tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }} stroke={CHART.grid} />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: CHART.muted }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="impressions" fill={CHART.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill={CHART.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill={CHART.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </StaggerItem>

          <StaggerItem className="surface-card p-6">
            <h3 className="mb-4 font-semibold tracking-tight">Pipeline value by campaign</h3>
            {pipelineData.length === 0 ? (
              <EmptyState
                illustration="earnings"
                title="No pipeline value yet"
                description="Lead values will show up here once creators start converting."
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart layout="vertical" data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis
                    type="number"
                    tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }}
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`}
                    stroke={CHART.grid}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }}
                    width={100}
                    stroke={CHART.grid}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP}
                    cursor={{ fill: CHART.muted }}
                    formatter={(v) => `€${v.toLocaleString()}`}
                  />
                  <Bar dataKey="pipeline" fill={CHART.iris} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </StaggerItem>
        </Stagger>
      )}

      {hasSpendData && (
        <div className="surface-card p-6">
          <h3 className="mb-4 font-semibold tracking-tight">Spend vs. pipeline by campaign</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis
                dataKey="name"
                tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }}
                angle={-20}
                textAnchor="end"
                height={60}
                interval={0}
                stroke={CHART.grid}
              />
              <YAxis
                tick={{ ...CHART_AXIS_TICK, fill: CHART.axis }}
                tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`}
                stroke={CHART.grid}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                cursor={{ fill: CHART.muted }}
                formatter={(v) => `€${v.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="spend" fill={CHART.neutral} radius={[4, 4, 0, 0]} />
              <Bar dataKey="pipeline" fill={CHART.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">Campaign performance</h2>
        {campaigns.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              illustration="search"
              title="No data yet"
              description="Create a campaign to start tracking performance."
              action={
                <Button asChild>
                  <Link to="/app/campaigns/new">New campaign</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Performance for each of your campaigns</caption>
                <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">Campaign</th>
                    <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Impressions</th>
                    <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Clicks</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Leads</th>
                    <th scope="col" className="hidden px-4 py-3 text-right font-semibold md:table-cell">Pipeline</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {campaigns.map((c) => {
                    const cMetrics = metrics.filter((m) => m.campaign_id === c.id);
                    const cLeads = leads.filter((l) => l.campaign_id === c.id);
                    const cPipeline = cLeads.reduce((s, l) => s + (l.value || 0), 0);
                    return (
                      <tr key={c.id} className="transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link
                            to={`/app/campaigns/${c.id}`}
                            className="font-semibold transition-colors hover:text-primary"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                          {cMetrics.reduce((s, m) => s + (m.impressions || 0), 0).toLocaleString()}
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                          {cMetrics.reduce((s, m) => s + (m.clicks || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{cLeads.length}</td>
                        <td className="hidden px-4 py-3 text-right font-semibold tabular-nums md:table-cell">
                          €{cPipeline.toLocaleString()}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
