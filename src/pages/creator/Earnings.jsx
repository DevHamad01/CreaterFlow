import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CheckCircle2, Clock, TrendingUp, AlertTriangle, RefreshCw, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Earnings() {
  const { user } = useAuth();
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
    const creatorName = user.full_name || "";
    base44.entities.Payment.filter({ creator_name: creatorName }, "-created_date")
      .then((rows) => setPayments(rows || []))
      .catch((err) => {
        console.error("Earnings: load failed", err);
        setError("We couldn't load your earnings. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading earnings</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your earnings"
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

  const totalEarned = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingEarnings = payments
    .filter((p) => p.status === "pending" || p.status === "scheduled")
    .reduce((s, p) => s + p.amount, 0);
  const totalAll = payments.reduce((s, p) => s + p.amount, 0);

  if (!user?.full_name) {
    return (
      <div className="space-y-6">
        <PageHeader title="Earnings" icon={Wallet} description="Your payouts and payment history" />
        <div className="surface-card">
          <EmptyState
            icon={UserRound}
            title="Add your name to see your payouts"
            description="Payouts are matched to your profile name. Add it once and your earnings history shows up here."
            action={
              <Button asChild>
                <Link to="/app/profile">Complete your profile</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        icon={Wallet}
        description="Your payouts and payment history"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total earnings" value={`€${totalAll.toLocaleString()}`} icon={Wallet} accent="neutral" />
        <StatCard label="Paid out" value={`€${totalEarned.toLocaleString()}`} icon={CheckCircle2} accent="success" />
        <StatCard label="Pending" value={`€${pendingEarnings.toLocaleString()}`} icon={Clock} accent="warning" />
      </div>

      {payments.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="earnings"
              title="No earnings yet"
            description="Your payouts will appear here once your posts go live."
          />
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Your payouts and payment history</caption>
              <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Campaign</th>
                  <th scope="col" className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Brand</th>
                  <th scope="col" className="hidden px-4 py-3 text-left font-semibold md:table-cell">Invoice</th>
                  <th scope="col" className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Date</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold">{p.campaign_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{p.company_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.invoice_number || "—"}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {p.paid_date || p.due_date || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">€{p.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/5 p-5">
        <TrendingUp aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold">Paid within 24h</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Naano handles payouts automatically. You get paid within 24h of your post going live. No
            invoices or chasing needed.
          </p>
        </div>
      </div>
    </div>
  );
}
