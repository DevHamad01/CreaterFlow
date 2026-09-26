import { useEffect, useId, useRef, useState } from "react";
import { computeCreatorMatch } from "@/lib/intelligence";
import { X } from "lucide-react";

/**
 * Match Score Badge with detailed breakdown.
 * Shows "94% Match" and explains WHY on expand.
 *
 * Props: creator, campaign, size
 */
export default function MatchScoreBadge({ creator, campaign, size = "sm" }) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);
  const panelId = useId();
  const match = computeCreatorMatch(creator, campaign);

  const colorClass =
    match.score >= 85 ? "text-success bg-success/10"
    : match.score >= 70 ? "text-primary bg-primary/10"
    : match.score >= 55 ? "text-warning bg-warning/10"
    : "text-muted-foreground bg-muted";

  const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`inline-flex items-center gap-1 rounded-full font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${sizeClass} ${colorClass}`}
      >
        <span className="tabular-nums">{match.score}%</span>
        <span className="font-medium opacity-75">Match</span>
      </button>

      {expanded && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`Why ${match.score}% match`}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-overlay"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold tracking-tight">Why {match.score}% match?</h4>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(false);
              }}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">Close match breakdown</span>
            </button>
          </div>
          <ul className="space-y-2.5">
            {match.breakdown.map((f) => (
              <li key={f.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span
                    className={`font-medium tabular-nums ${
                      f.score >= 75 ? "text-success" : f.score >= 50 ? "text-warning" : "text-muted-foreground"
                    }`}
                  >
                    {f.score}/100
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${f.label} match score`}
                  aria-valuenow={f.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={`h-full rounded-full ${
                      f.score >= 75 ? "bg-success/60" : f.score >= 50 ? "bg-warning/60" : "bg-border"
                    }`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
