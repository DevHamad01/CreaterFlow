const STYLES = {
  draft: "bg-muted text-muted-foreground ring-border",
  recruiting: "bg-iris/10 text-iris ring-iris/25",
  active: "bg-primary/10 text-primary ring-primary/25",
  review: "bg-warning/10 text-warning ring-warning/25",
  scheduled: "bg-iris/10 text-iris ring-iris/25",
  live: "bg-success/10 text-success ring-success/25",
  completed: "bg-muted text-muted-foreground ring-border",
  cancelled: "bg-danger/10 text-danger ring-danger/25",
  invited: "bg-muted text-muted-foreground ring-border",
  accepted: "bg-primary/10 text-primary ring-primary/25",
  draft_submitted: "bg-warning/10 text-warning ring-warning/25",
  in_review: "bg-warning/10 text-warning ring-warning/25",
  revision_requested: "bg-warning/10 text-warning ring-warning/25",
  approved: "bg-success/10 text-success ring-success/25",
  rejected: "bg-danger/10 text-danger ring-danger/25",
  pending: "bg-warning/10 text-warning ring-warning/25",
  paid: "bg-success/10 text-success ring-success/25",
  scheduled_pay: "bg-iris/10 text-iris ring-iris/25",
  failed: "bg-danger/10 text-danger ring-danger/25",
  new: "bg-primary/10 text-primary ring-primary/25",
  qualified: "bg-success/10 text-success ring-success/25",
  contacted: "bg-warning/10 text-warning ring-warning/25",
  converted: "bg-success/10 text-success ring-success/25",
  lost: "bg-danger/10 text-danger ring-danger/25",
};

const LABELS = {
  draft: "Draft",
  recruiting: "Recruiting",
  active: "Active",
  review: "In review",
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
  invited: "Invited",
  accepted: "Accepted",
  draft_submitted: "Draft submitted",
  in_review: "In review",
  revision_requested: "Revision requested",
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  paid: "Paid",
  scheduled_pay: "Payment scheduled",
  failed: "Failed",
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  converted: "Converted",
  lost: "Lost",
};

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset";

/** @param {{ status: string }} props */
export function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  return (
    <span className={`${PILL} ${STYLES[key] || STYLES.draft}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {LABELS[key] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/** @param {{ score: number }} props */
export function FitScore({ score }) {
  const tone =
    score >= 90
      ? "bg-success/10 text-success ring-success/25"
      : score >= 80
        ? "bg-primary/10 text-primary ring-primary/25"
        : "bg-muted text-muted-foreground ring-border";
  return (
    <span className={`${PILL} ${tone}`}>
      {score}% fit
    </span>
  );
}
