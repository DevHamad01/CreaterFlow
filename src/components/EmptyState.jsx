import { getIllustration } from "@/components/illustrations/EmptyIllustrations";

/**
 * @typedef {object} EmptyStateProps
 * @property {any} [icon] Lucide icon, shown in the muted chip.
 * @property {string} [illustration] Name of a decorative SVG illustration. Takes
 *   precedence over `icon` when both are supplied. Illustrations are
 *   `aria-hidden` — the title carries the meaning for assistive tech.
 * @property {string} title
 * @property {string} [description]
 * @property {any} [action]
 * @property {"sm" | "md" | "lg"} [size]
 * @property {string} [className]
 */

/** @param {EmptyStateProps} props */
export default function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  size = "md",
  className,
}) {
  const dims = {
    sm: { wrap: "py-10", chip: "h-11 w-11 rounded-xl", icon: "h-5 w-5", art: "w-28" },
    md: { wrap: "py-16", chip: "h-14 w-14 rounded-2xl", icon: "h-6 w-6", art: "w-40" },
    lg: { wrap: "py-20", chip: "h-16 w-16 rounded-2xl", icon: "h-7 w-7", art: "w-48" },
  }[size];

  const Illustration = illustration ? getIllustration(illustration) : null;

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${dims.wrap}${
        className ? ` ${className}` : ""
      }`}
    >
      {Illustration ? (
        <div className={`mb-6 flex justify-center ${dims.art}`}>
          <Illustration />
        </div>
      ) : (
        Icon && (
          <span
            aria-hidden="true"
            className={`mb-5 inline-flex ${dims.chip} items-center justify-center bg-muted ring-1 ring-inset ring-border/70`}
          >
            <Icon className={`${dims.icon} text-muted-foreground`} />
          </span>
        )
      )}
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
