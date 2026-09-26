import { Stagger, StaggerItem } from "@/components/motion/Reveal";

/**
 * @typedef {object} PageHeaderProps
 * @property {string} title
 * @property {string} [description]
 * @property {any} [icon]
 * @property {any} [action]
 * @property {any} [meta]
 */

/**
 * Consistent title row for the signed-in screens (app shell already provides
 * the surrounding padding).
 *
 * Animates on mount rather than on scroll: an app page header is always at the
 * top of the viewport when its route mounts, so waiting on an
 * IntersectionObserver would only add a frame of delay before the title
 * settles. The right-hand actions are offset by a slightly longer delay so
 * they land just after the title, which reads as intent rather than as two
 * things happening at once.
 *
 * @param {PageHeaderProps} props
 */
export default function PageHeader({ title, description, icon: Icon, action, meta }) {
  return (
    <Stagger
      as="header"
      trigger="mount"
      stagger={0.05}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <StaggerItem className="min-w-0">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
          )}
          <h1 className="truncate font-display text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        {meta && <div className="mt-3">{meta}</div>}
      </StaggerItem>
      {action && (
        <StaggerItem className="flex flex-wrap items-center gap-2.5" delay={0.08}>
          {action}
        </StaggerItem>
      )}
    </Stagger>
  );
}
