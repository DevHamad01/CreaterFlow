import { forwardRef } from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeRight, fadeLeft, scaleIn, staggerItem, inViewOnce } from "@/lib/motion";

/**
 * Shared prop surface. The index signature is intentional: every primitive
 * spreads unknown props through to the underlying DOM node, so consumers can
 * pass `aria-*`, `data-*`, event handlers, and layout classes without the type
 * having to enumerate them.
 *
 * @typedef {object} MotionBaseProps
 * @property {any} [as] Intrinsic element to render, e.g. "li", "header", "ul".
 *   Only HTML tags are supported here — `motion` is a proxy over intrinsics.
 *   To animate a router `Link`, nest it as a child instead: framer propagates
 *   variants through React context, not props, so a plain child still animates.
 * @property {any} [className]
 * @property {any} [children]
 */

/**
 * @typedef {MotionBaseProps & object} RevealProps
 * @property {"up" | "right" | "left" | "scale"} [variant] Entrance direction.
 * @property {number} [delay] Seconds before starting. For sequencing siblings
 *   that are NOT inside a `Stagger` container.
 */

/**
 * @typedef {MotionBaseProps & object} StaggerProps
 * @property {number} [stagger] Seconds between children. Keep <= 0.08 — a long
 *   grid should still finish in roughly a second.
 * @property {number} [delayChildren] Seconds before the first child.
 * @property {"inView" | "mount"} [trigger]
 *   `"inView"` (default) waits for the container to scroll into view.
 *   `"mount"` animates on mount. Use `"mount"` for above-the-fold content
 *   (heroes, page headers) where waiting on an IntersectionObserver only adds
 *   a frame of delay before anything moves.
 */

/**
 * @typedef {MotionBaseProps & object} StaggerItemProps
 * @property {number} [delay] Extra delay for one specific child, for
 *   highlighting a featured tile without reordering the whole row.
 */

/** Resolve `as` to a motion component, defaulting to `div`. */
const resolve = (as) => motion[as] || motion.div;

const VARIANTS = {
  up: fadeUp,
  right: fadeRight,
  left: fadeLeft,
  scale: scaleIn,
};

/**
 * Scroll-triggered reveal for a single block.
 *
 * Use for section headers, hero copy, one-off panels. For grids and lists use
 * `<Stagger>` instead — a Stagger container drives all of its children through
 * one variant pass, whereas N separate `Reveal`s means N separate
 * IntersectionObservers.
 *
 * The element occupies its final layout box while faded out, so a reveal never
 * shifts the page (zero CLS).
 *
 * Refs forward to the DOM node, which matters for lists that already attach a
 * ref for outside-click or measurement behaviour — otherwise wrapping such an
 * element would silently drop it.
 *
 * @param {RevealProps} props
 * @param {any} ref
 */
function RevealInner(
  { as = "div", variant = "up", delay = 0, className, children, ...rest },
  ref
) {
  const MotionTag = resolve(as);

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      variants={VARIANTS[variant] || fadeUp}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export const Reveal = forwardRef(RevealInner);

/**
 * Container that staggers its `<StaggerItem>` children into view.
 *
 * Framer propagates the `visible` variant down the tree via context, so a single
 * trigger here drives every child. This is the main performance reason to
 * prefer `Stagger` over mapping `Reveal` over an array.
 *
 * @param {StaggerProps} props
 * @param {any} ref
 */
function StaggerInner(
  {
    as = "div",
    stagger = 0.06,
    delayChildren = 0,
    trigger = "inView",
    className,
    children,
    ...rest
  },
  ref
) {
  const MotionTag = resolve(as);
  const onMount = trigger === "mount";

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      {...(onMount
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: inViewOnce })}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export const Stagger = forwardRef(StaggerInner);

/**
 * A single child of `<Stagger>`. Inherits the container's `visible` state and
 * animates with a short upward fade.
 *
 * @param {StaggerItemProps} props
 * @param {any} ref
 */
function StaggerItemInner({ as = "div", delay, className, children, ...rest }, ref) {
  const MotionTag = resolve(as);

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={staggerItem}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export const StaggerItem = forwardRef(StaggerItemInner);

export default Reveal;
