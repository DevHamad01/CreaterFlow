import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Wallet, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function Earnings() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const creatorName = user.full_name || "";
    base44.entities.Payment.filter({ creator_name: creatorName }, "-created_date")
      .then(setPayments)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}</div></div>;

  const totalEarned = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingEarnings = payments.filter((p) => p.status === "pending" || p.status === "scheduled").reduce((s, p) => s + p.amount, 0);
  const totalAll = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">Your payouts and payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total earnings" value={`€${totalAll.toLocaleString()}`} icon={Wallet} accent="slate" />
        <StatCard label="Paid out" value={`€${totalEarned.toLocaleString()}`} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Pending" value={`€${pendingEarnings.toLocaleString()}`} icon={Clock} accent="amber" />
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={Wallet} title="No earnings yet" description="Your payouts will appear here once your posts go live." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Campaign</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Brand</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Invoice</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.campaign_name}</td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{p.company_name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.invoice_number || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{p.paid_date || p.due_date || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">€{p.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-emerald-50 rounded-2xl p-5 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-900">Paid within 24h</p>
          <p className="text-xs text-slate-600 mt-1">Naano handles payouts automatically. You get paid within 24h of your post going live. No invoices or chasing needed.</p>
        </div>
      </div>
    </div>
  );
}