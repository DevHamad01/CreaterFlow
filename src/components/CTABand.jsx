import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-width closing call to action.
 *
 * Flat ink surface, not a gradient: this band sits directly under body copy,
 * and a gradient behind 16px text costs contrast for decoration that reads as
 * noise. `fullBleed` drops the rounding and padding for use as a section
 * rather than a card.
 */
export function CTABand({
  title,
  body,
  primary,
  secondary,
  fullBleed = false,
}) {
  const section = fullBleed
    ? "bg-ink px-6 py-20 text-center"
    : "rounded-3xl bg-ink px-6 py-16 text-center";

  return (
    <section className={section}>
      <h2 className="text-3xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      {body ? (
        <p className="mx-auto mt-3 max-w-xl text-white/70">{body}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {primary ? (
          <Button
            asChild
            size="lg"
            className="group bg-white text-foreground hover:bg-white/90"
          >
            <Link to={primary.href}>
              {primary.label}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        ) : null}
        {secondary ? (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to={secondary.href}>
              {secondary.label}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export default CTABand;
