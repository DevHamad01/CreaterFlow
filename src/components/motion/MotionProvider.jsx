import { MotionConfig } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Single mount point for the motion layer.
 *
 * Wrapped around the whole app in `App.jsx` so there is exactly one
 * `MotionConfig` and one reduced-motion decision for every animated surface,
 * including portals (dialogs, sheets, toasts), which inherit React context
 * through the portal.
 *
 * `reducedMotion="user"` makes framer read `prefers-reduced-motion` and drop
 * transform animations on its own while still allowing opacity cross-fades.
 * Every `Reveal`/`Stagger` therefore respects the OS setting for free, with no
 * per-component checks to forget.
 *
 * The global CSS in `index.css` also clamps animation/transition durations for
 * reduced-motion users; that covers the CSS-driven layer (shimmer, marquee,
 * button and card micro-interactions) which framer has no visibility into.
 *
 * `LazyMotion` + a feature bundle was deliberately not used. The reveal
 * primitives import `motion` directly, so they already get framer's full
 * component set and there is nothing left for `LazyMotion` to defer; wrapping
 * it would add a provider to the tree and a first-paint stall (features
 * resolve asynchronously) for no size benefit, since the app uses motion on
 * nearly every page and the bundle is tree-shaken to the components actually
 * referenced either way.
 */
export default function MotionProvider({ children }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: DURATION.enter, ease: EASE.out }}
    >
      {children}
    </MotionConfig>
  );
}
