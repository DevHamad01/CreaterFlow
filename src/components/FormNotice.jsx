import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  error: {
    wrap: "border-danger/25 bg-danger/5 text-danger",
    Icon: AlertTriangle,
  },
  success: {
    wrap: "border-success/25 bg-success/5 text-success",
    Icon: CheckCircle2,
  },
  info: {
    wrap: "border-info/25 bg-info/5 text-foreground",
    Icon: Info,
  },
};

/**
 * Inline form feedback for the auth screens: an announced, icon-led banner.
 *
 * @typedef {object} FormNoticeProps
 * @property {string} [message]
 * @property {"error" | "success" | "info"} [tone]
 * @property {boolean} [busy] renders a spinner instead of the tone icon
 * @property {string} [className]
 */

/** @param {FormNoticeProps} props */
export function FormNotice({ message, tone = "error", busy = false, className }) {
  if (!message) return null;
  const { wrap, Icon } = TONES[tone] || TONES.error;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm",
        wrap,
        className
      )}
    >
      {busy ? (
        <Loader2 aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin" />
      ) : (
        <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}

/**
 * @typedef {object} AuthDividerProps
 * @property {string} [label]
 * @property {string} [className]
 */

/**
 * The "or" divider used between the social button and the email form.
 *
 * @param {AuthDividerProps} props
 */
export function AuthDivider({ label = "or", className }) {
  return (
    <div className={cn("relative mb-6", className)} aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

export default FormNotice;
