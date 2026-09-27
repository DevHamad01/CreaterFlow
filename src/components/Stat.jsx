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
 *
 * `size` is for the places a stat is not a hero figure — a dense ink panel
 * row, where 4xl would dominate the row it shares with a label. Omit `label`
 * to render the number alone.
 *
 * @param {object} props
 * @param {number} [props.value]
 * @param {string} [props.display]   fixed string; renders instead of counting
 * @param {string} [props.prefix]
 * @param {string} [props.suffix]
 * @param {string} [props.label]
 * @param {"light" | "dark"} [props.tone]
 * @param {"lg" | "sm"} [props.size]
 * @param {string} [props.delta]
 * @param {string} [props.className]
 */
export function Stat({
  value,
  display = null,
  prefix = "",
  suffix = "",
  label,
  tone = "light",
  size = "lg",
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
          className={`font-semibold tracking-tight tabular-nums ${
            size === "sm" ? "text-xl" : "text-4xl"
          } ${tone === "dark" ? "text-white" : "text-foreground"}`}
        >
          {shown}
        </span>
        {delta ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            {delta}
          </span>
        ) : null}
      </div>
      {label ? (
        <p
          className={`mt-1 text-sm ${
            tone === "dark" ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}

export default Stat;
