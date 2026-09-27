import { useCountUp } from "@/hooks/useCountUp";

const number = new Intl.NumberFormat("en-US");

/**
 * A single marketing statistic.
 *
 * Numbers are tabular so a counting value does not reflow its own label while
 * it animates — without this the digits shift horizontally mid-count.
 *
 * Pass `display` to render a fixed string instead of counting (for figures
 * that are not quantities, like "Unlimited" or "24h").
 */
export function Stat({
  value,
  display = null,
  prefix = "",
  suffix = "",
  label,
  tone = "light",
  delta = null,
  className = "",
}) {
  const isFixed = display != null;
  const { ref, value: animated } = useCountUp(isFixed ? 0 : value);
  const shown = isFixed ? display : `${prefix}${number.format(animated)}${suffix}`;

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          ref={isFixed ? undefined : ref}
          className={`text-4xl font-semibold tracking-tight tabular-nums ${
            tone === "dark" ? "text-white" : "text-foreground"
          }`}
        >
          {shown}
        </span>
        {delta ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            {delta}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-1 text-sm ${
          tone === "dark" ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export default Stat;
