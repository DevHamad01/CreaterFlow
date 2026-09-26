/**
 * Shared JSDOM environment shims for the state harnesses.
 *
 * Framer Motion's `whileInView` (used by the scroll-reveal primitives) relies on
 * IntersectionObserver, which JSDOM does not implement. Without this shim the
 * reveal components fail on mount. The shim reports every element as
 * immediately visible, which matches what the harnesses actually want: they
 * assert on rendered markup, and a reveal that never fires would leave content
 * pinned at `opacity: 0`.
 *
 * `matchMedia` is also provided so `MotionConfig reducedMotion="user"` and the
 * Carousel's reduced-motion checks resolve instead of throwing. Everything
 * reports `matches: false`, i.e. motion is allowed — the standard case.
 *
 * Same philosophy as the app: these shims never animate anything, they only
 * answer questions.
 */
export function installDomShims() {
  const g = globalThis;
  const win = g.window;

  // Lift the constructors framer-motion reaches for. It does
  // `element instanceof SVGElement` and similar, and these live on `window`
  // in a browser but are not globals in Node.
  //
  // Constructors are copied by reference, never bound — `instanceof` checks
  // identity against `.prototype`, and a bound function would break every one
  // of them. Only plain functions get bound, because they need `window` as
  // their receiver.
  if (win) {
    const constructors = [
      "SVGElement",
      "HTMLElement",
      "HTMLImageElement",
      "HTMLCollection",
      "NodeList",
      "DOMRect",
      "Element",
      "Node",
      "Text",
      "Document",
      "DocumentFragment",
      "MutationObserver",
      "Event",
      "CustomEvent",
      "MouseEvent",
      "KeyboardEvent",
      "PointerEvent",
      "ResizeObserver",
      "IntersectionObserver",
    ];
    for (const name of constructors) {
      if (win[name] !== undefined && g[name] === undefined) {
        g[name] = win[name];
      }
    }
    if (typeof win.getComputedStyle === "function" && g.getComputedStyle === undefined) {
      g.getComputedStyle = win.getComputedStyle.bind(win);
    }
  }

  if (typeof g.IntersectionObserver === "undefined") {
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
        this.root = null;
        this.rootMargin = "0px";
        this.thresholds = [0];
      }
      observe(target) {
        // Fire once, synchronously, like a real observer would after first
        // layout. `isIntersecting: true` with a full ratio means every reveal
        // in the tree resolves to its visible state, so assertions see the same
        // content a user with the real IntersectionObserver would see once the
        // section has scrolled into view.
        const rect = { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 };
        this.callback(
          [
            {
              target,
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: rect,
              intersectionRect: rect,
              rootBounds: null,
              time: Date.now(),
            },
          ],
          this
        );
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    g.IntersectionObserver = MockIntersectionObserver;
    if (g.window) g.window.IntersectionObserver = MockIntersectionObserver;
  }

  if (typeof g.ResizeObserver === "undefined") {
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    g.ResizeObserver = MockResizeObserver;
    if (g.window) g.window.ResizeObserver = MockResizeObserver;
  }

  // JSDOM has no matchMedia by default. MotionProvider's reducedMotion="user"
  // and the Carousel both query it during mount.
  if (g.window && typeof g.window.matchMedia !== "function") {
    const mql = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    });
    g.window.matchMedia = mql;
    g.matchMedia = mql;
  }
}
