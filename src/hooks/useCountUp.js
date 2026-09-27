import { useEffect, useRef, useState } from "react";

// Counts from 0 to `target` once the element scrolls into view.
//
// Returns the live value, or `target` immediately when the user has asked for
// reduced motion — a count-up is exactly the kind of decorative animation
// that setting exists to suppress, so it must not run at all in that case,
// not merely finish faster.
//
// `enabled: false` pins the value, which is the reduced-motion and
// no-IntersectionObserver path.
export function useCountUp(target, { duration = 800, enabled = true } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!enabled || reduce || typeof IntersectionObserver === "undefined") {
      setValue(target);
      return undefined;
    }

    const node = ref.current;
    if (!node) {
      setValue(target);
      return undefined;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;

      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic: leaves fast, settles onto the target, so the last
        // digit does not snap into place.
        const eased = 1 - (1 - t) ** 3;
        setValue(Math.round(target * eased));
        if (t < 1) frame.current = requestAnimationFrame(step);
        else setValue(target);
      };
      frame.current = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        run();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [target, duration, enabled]);

  return { ref, value };
}
