import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @typedef {object} StatCardProps
 * @property {string} label
 * @property {any} value
 * @property {number} [change]
 * @property {any} [icon]
 * @property {"primary" | "success" | "warning" | "iris" | "neutral"} [accent]
 * @property {string} [hint]
 * @property {boolean} [loading]
 * @property {boolean} [dense]
 * @property {string} [className]
 */

const ACCENTS = {
  primary: { chip: "bg-primary/10 text-primary", positive: "text-success", negative: "text-danger" },
  success: { chip: "bg-success/10 text-success", positive: "text-success", negative: "text-danger" },
  warning: { chip: "bg-warning/10 text-warning", positive: "text-success", negative: "text-danger" },
  iris: { chip: "bg-iris/10 text-iris", positive: "text-success", negative: "text-danger" },
  neutral: { chip: "bg-muted text-muted-foreground", positive: "text-success", negative: "text-danger" },
};

/**
 * @param {StatCardProps} props
 */
export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent = "primary",
  hint,
  loading = false,
  dense = false,
  className,
}) {
  const tone = ACCENTS[accent] || ACCENTS.primary;
  const up = change > 0;
  const flat = change === 0;

  return (
    <div className={cn("surface-card surface-card-hover", dense ? "p-4" : "p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex flex-shrink-0 items-center justify-center rounded-lg",
              dense ? "h-8 w-8" : "h-9 w-9",
              tone.chip
            )}
          >
            <Icon aria-hidden="true" className={dense ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                "font-display font-semibold tracking-tight",
                dense ? "text-lg" : "text-2xl"
              )}
            >
              {value}
            </span>
            {change !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  flat ? "text-muted-foreground" : up ? tone.positive : tone.negative
                }`}
              >
                {!flat && (
                  <svg
                    viewBox="0 0 12 12"
                    className={`h-2.5 w-2.5 ${up ? "" : "rotate-180"}`}
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    <path d="M6 1.5 11 8H1z" />
                  </svg>
                )}
                {up ? "+" : ""}
                {change}%
              </span>
            )}
          </div>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </>
      )}
    </div>
  );
}

