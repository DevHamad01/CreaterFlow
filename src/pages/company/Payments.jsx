import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CheckCircle2, Clock, FileText, AlertTriangle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Payments() {
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
    base44.entities.Payment.filter({ created_by_id: user.id }, "-created_date")
      .then((rows) => setPayments(rows || []))
      .catch((err) => {
        console.error("Payments: load failed", err);
        setError("We couldn't load your payments. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading payments</span>
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
          title="We couldn't load your payments"
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

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending" || p.status === "scheduled").reduce((s, p) => s + p.amount, 0);
  const totalAll = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        icon={Wallet}
        description="Creator payouts and campaign spend"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total spend" value={`€${totalAll.toLocaleString()}`} icon={Wallet} accent="neutral" />
        <StatCard label="Paid" value={`€${totalPaid.toLocaleString()}`} icon={CheckCircle2} accent="success" />
        <StatCard label="Pending" value={`€${totalPending.toLocaleString()}`} icon={Clock} accent="warning" />
      </div>

      {payments.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="earnings"
              title="No payments yet"
            description="Creator payments will appear here once your campaigns go live."
          />
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Creator payouts for your campaigns</caption>
              <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Creator</th>
                  <th scope="col" className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Campaign</th>
                  <th scope="col" className="hidden px-4 py-3 text-left font-semibold md:table-cell">Invoice</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold">{p.creator_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{p.campaign_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.invoice_number || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">€{p.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">Payments are handled automatically</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Naano manages creator payouts. Creators are paid within 24h of their post going live. No
            invoices or admin needed.
          </p>
        </div>
      </div>
    </div>
  );
}
