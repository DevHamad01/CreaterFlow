import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} Faq
 * @property {string} q
 * @property {string} a
 *
 * @typedef {object} FaqAccordionProps
 * @property {Faq[]} faqs
 * @property {string} [heading]
 * @property {string} [eyebrow]
 * @property {string} [description]
 * @property {boolean} [openFirst]
 * @property {string} [className]
 */

/**
 * @param {FaqAccordionProps} props
 */
export default function FaqAccordion({
  faqs,
  heading = "Frequently asked questions",
  eyebrow = "FAQ",
  description,
  openFirst = false,
  className,
}) {
  const [open, setOpen] = useState(openFirst ? 0 : null);

  return (
    <div className={className}>
      {(heading || eyebrow || description) && (
        <div className="mx-auto mb-10 max-w-2xl text-center">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {heading && (
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{heading}</h2>
          )}
          {description && <p className="mt-3 text-muted-foreground">{description}</p>}
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={faq.q}
              className={cn(
                    "overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ease-smooth",
                isOpen
                  ? "border-primary/30 shadow-xs"
                  : "border-border/80 hover:border-primary/20"
              )}
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="font-semibold tracking-tight">{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                        "inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[transform,background-color,color] duration-200 ease-smooth",
                      isOpen && "rotate-180 bg-primary/10 text-primary"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
              </h3>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-muted-foreground"
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
