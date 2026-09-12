export function StatusBadge({ status }) {
  const styles = {
    draft: "bg-slate-100 text-slate-600",
    recruiting: "bg-purple-100 text-purple-700",
    active: "bg-blue-100 text-blue-700",
    review: "bg-amber-100 text-amber-700",
    scheduled: "bg-indigo-100 text-indigo-700",
    live: "bg-emerald-100 text-emerald-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-700",
    invited: "bg-slate-100 text-slate-600",
    accepted: "bg-blue-100 text-blue-700",
    draft_submitted: "bg-amber-100 text-amber-700",
    in_review: "bg-amber-100 text-amber-700",
    revision_requested: "bg-orange-100 text-orange-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    scheduled_pay: "bg-indigo-100 text-indigo-700",
    failed: "bg-red-100 text-red-700",
    new: "bg-blue-100 text-blue-700",
    qualified: "bg-emerald-100 text-emerald-700",
    contacted: "bg-amber-100 text-amber-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
  };

  const labels = {
    draft_submitted: "Draft submitted",
    in_review: "In review",
    revision_requested: "Revision requested",
    scheduled_pay: "Scheduled",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function FitScore({ score }) {
  const color = score >= 90 ? "text-emerald-600 bg-emerald-50" : score >= 80 ? "text-blue-600 bg-blue-50" : "text-slate-600 bg-slate-50";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {score}% fit
    </span>
  );
}