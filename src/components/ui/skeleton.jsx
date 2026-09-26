import { cn } from "@/lib/utils"

/**
 * Loading placeholder.
 *
 * The sweep is a single continuous `transform: translateX()` animation, which
 * the compositor runs without touching layout or paint — nothing here animates
 * a layout property, so the skeleton never triggers reflow while it's on screen.
 *
 * `.shimmer-sweep` supplies the pre-translate offset plus `will-change`, which
 * is appropriate here (and only here) because the element animates
 * continuously for as long as the skeleton is mounted: promoting it once beats
 * re-deciding every frame. Hover transitions deliberately don't do this, since
 * they're short and numerous.
 *
 * Under `prefers-reduced-motion` the global rule in index.css hides the sweep
 * and leaves the muted block, which is still a valid loading indicator.
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="shimmer-sweep animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent"
      />
    </div>
  )
}

export { Skeleton }
