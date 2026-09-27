import { Check } from "lucide-react";

const TONES = {
  green: "bg-success/10 text-success",
  violet: "bg-primary/10 text-primary",
  white: "bg-white/15 text-white",
};

/**
 * The single checkmark token.
 *
 * Every "yes" row in the site used to hand-roll its own green circle, which is
 * why the icon size and ring colour drifted between pages. One component
 * means one size, one weight, one colour.
 *
 * `iconOnly` drops the text colour classes for use beside existing copy.
 */
export function FeatureCheck({ tone = "green", iconOnly = false, children }) {
  return (
    <span className="inline-flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
      >
        <Check size={16} strokeWidth={2.5} />
      </span>
      {children ? (
        <span
          className={`text-sm ${iconOnly ? "" : tone === "white" ? "text-white/90" : "text-foreground/80"}`}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}

export default FeatureCheck;
