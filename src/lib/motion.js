/**
 * Motion design tokens + shared variants for the Electric Iris motion layer.
 *
 * Performance contract (why these values are what they are):
 *  - Every variant animates ONLY `opacity` and `transform`. Those are the two
 *    properties a compositor can handle without re-running layout or paint, so
 *    reveals stay on the GPU and off the main thread.
 *  - Nothing animates `height`, `width`, `top`, `margin` or `box-shadow` in a
 *    loop. Those force layout/paint per frame and are the usual cause of jank.
 *  - Reveal distances are small (8–16px). Larger travel reads as "floaty" and
 *    needs a longer duration, which is exactly when users start noticing lag.
 *  - Easing is `easeOut`-weighted so elements decelerate into place. A linear
 *    or `easeIn` entrance feels like the UI is still loading.
 *  - Elements animate FROM a visible-hidden state but always occupy their final
 *    layout box, so nothing shifts (zero CLS) when a reveal fires.
 */

/** @typedef {0.2 | 0.3 | 0.35 | 0.45 | 0.6} MotionDuration */

/** Durations in seconds. Keep entrances under 0.5s — longer reads as lag. */
export const DURATION = {
  /** Micro-interactions: button press, chip toggle, icon nudge. */
  instant: 0.2,
  /** Default for reveals and layout-adjacent transitions. */
  enter: 0.35,
  /** Staggered container children (each child is faster than the sum). */
  stagger: 0.3,
  /** Deliberate, attention-drawing motion (drawers, sheet entrances). */
  emphasis: 0.45,
  /** Decorative loops (marquee, float). */
  ambient: 0.6,
};

/**
 * Shared easing curves. Framer accepts these as strings; they map to
 * cubic-bezier() under the hood.
 */
export const EASE = {
  /** Default for anything entering the viewport. Decelerates into place. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric — for elements that both enter and leave. */
  inOut: [0.65, 0, 0.35, 1],
  /** UI feedback on direct manipulation (press, drag). Near-instant. */
  snap: [0.4, 0, 0.2, 1],
};

/**
 * Standard reveal: fade up a short distance.
 * Use for section headers, cards, single blocks of content.
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/** Reveal from the left — for side-by-side layouts that read left→right. */
export const fadeRight = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/** Reveal from the right — pairs with {@link fadeRight}. */
export const fadeLeft = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/** Scale-in for hero art, illustrations and single emphasis moments. */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/**
 * Container for staggered children.
 *
 * This is deliberately preferred over giving every child its own `whileInView`
 * observer: framer propagates variants down the tree through context, so one
 * parent variant + N children costs a single orchestration pass. A grid of 24
 * cards animated individually means 24 separate IntersectionObservers.
 *
 * `staggerChildren` is small enough that the last card in a long grid still
 * lands within about a second of the first.
 */
export const staggerContainer = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Child variant for use inside a {@link staggerContainer}. */
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/**
 * Shared `whileInView` config.
 *
 * `once: true` is a performance requirement, not a stylistic choice: it makes
 * framer disconnect the IntersectionObserver after the first trigger, so
 * scrolling back up costs nothing and long pages don't accumulate observers.
 *
 * `amount: 0.2` fires when 20% of the element is visible — early enough that
 * the animation has finished by the time the element is centred, so users
 * never watch something finish animating under their cursor.
 *
 * The negative bottom margin biases the trigger zone above the fold edge,
 * which stops things popping in at the very bottom of the viewport where
 * there's no time to read them.
 */
export const inViewOnce = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -10% 0px",
};

/** Hover/press micro-interaction for interactive cards. Transform only. */
export const cardHover = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: DURATION.instant, ease: EASE.out } },
  press: { y: -1, scale: 0.995, transition: { duration: DURATION.instant, ease: EASE.snap } },
};

/** Modal / dialog panel entrance. Scale is subtle; content should not jump. */
export const panelIn = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: DURATION.instant, ease: EASE.snap },
  },
};

/** Toast / banner slide. */
export const slideInTop = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.enter, ease: EASE.out } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.instant, ease: EASE.snap } },
};

/** Count-up style number emphasis for stat values. */
export const statPop = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE.out },
  },
};

/** Shared transition for toggle-style micro-interactions. */
export const micro = {
  transition: { duration: DURATION.instant, ease: EASE.out },
};
