import { Children, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} CarouselProps
 * @property {any} children Slide content. Each direct child is one slide and
 *   is wrapped automatically — callers don't apply sizing classes.
 * @property {boolean} [showControls] Render prev/next arrows + dot indicators.
 * @property {string} [label] Accessible name for the carousel region.
 * @property {string} [className]
 */
/**
 * Embla carousel.
 *
 * Why this stays smooth:
 *  - Embla moves slides with a single `transform: translate3d()` on the
 *    container and never touches layout properties, so dragging and snapping
 *    run entirely on the compositor.
 *  - There is no scroll event handler and no per-frame `requestAnimationFrame`
 *    loop of our own. Embla's own loop is already minimal, and the previous
 *    state is read through its `onSelect` callback rather than polled.
 *  - Drag-to-scroll is native browser behaviour, so a trackpad or touch swipe
 *    is handled by the platform with momentum already tuned per device.
 *
 * Accessibility:
 *  - The region is a labelled `role="region"`, so screen-reader users can
 *    jump to it and know what it is.
 *  - Arrows are real buttons with accessible names, and the left/right arrow
 *    keys move the carousel when it has focus.
 *  - `prefers-reduced-motion` disables smooth snapping, so selecting a dot jumps
 *    instantly rather than animating the track across the screen.
 *
 * @param {CarouselProps} props
 */
export default function Carousel({
  children,
  showControls = true,
  label = "Carousel",
  className,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    // Reduced motion snaps instantly instead of gliding.
    duration: 22,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const sync = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setSelected(emblaApi.selectedScrollSnap());
    };

    sync();
    setSnapCount(emblaApi.scrollSnapList().length);

    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (!emblaApi) return;
      // Snap instantly for reduced motion; embla's second arg is `jump`.
      if (prefersReducedMotion()) {
        emblaApi.scrollTo(index, true);
      } else {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi, prefersReducedMotion]
  );

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
  };

  // One slide is ~86% of the track on phones (so the next card peeks and it's
  // obvious there's more to swipe), then 46% on tablets, then an even split.
  const basis = "basis-[86%] sm:basis-[46%] lg:basis-1/3";

  return (
    <div
      className={cn("group relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div ref={emblaRef} className="-mx-2.5 overflow-hidden">
        <div className="flex touch-pan-y gap-5 px-2.5">
          {Children.map(children, (child, i) => (
            <div
              key={child?.key ?? i}
              className={cn("min-w-0 shrink-0 grow-0", basis)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${snapCount || 1}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous slide"
            className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-card/90 opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none sm:-left-4 sm:flex"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label="Next slide"
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-card/90 opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none sm:-right-4 sm:flex"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>

          {snapCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: snapCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to slide ${i + 1} of ${snapCount}`}
                  aria-current={i === selected ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-[width,background-color] duration-300 ease-smooth",
                    i === selected ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
