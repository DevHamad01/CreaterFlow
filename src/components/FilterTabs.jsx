import { cn } from "@/lib/utils";

/**
 * @typedef {object} FilterTab
 * @property {string} value
 * @property {string} label
 * @property {number} [count]
 *
 * @typedef {object} FilterTabsProps
 * @property {FilterTab[]} tabs
 * @property {string} value
 * @property {(next: string) => void} onChange
 * @property {string} [ariaLabel]
 * @property {string} [className]
 */

/**
 * Scrollable status filter used by the campaign / opportunity lists.
 *
 * @param {FilterTabsProps} props
 */
export default function FilterTabs({ tabs, value, onChange, ariaLabel = "Filter", className }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-[background-color,color,border-color,box-shadow] duration-200 ease-smooth",
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-input bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
