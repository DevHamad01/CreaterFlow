import { Link } from "react-router-dom";
import { Logo } from "@/components/PublicNav";

// Attribution for the redesign. Change this one string to your name — it is
// the only place the credit name appears, so no find-and-replace needed.
const CREDIT_NAME = "Hamad";

const COLUMNS = [
  {
    heading: "Solutions",
    links: [
      { label: "For companies", to: "/for-companies" },
      { label: "For agencies", to: "/for-agencies" },
      { label: "For creators", to: "/for-creators" },
    ],
  },
  {
    heading: "Product",
    links: [
      { label: "Marketplace", to: "/marketplace" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Launch a campaign", to: "/signup" },
      { label: "Become a creator", to: "/signup" },
      { label: "Sign in", to: "/login" },
    ],
  },
];

export default function PublicFooter() {
  return (
    /* Flat deep ink, not bg-brand-gradient. A saturated brand fill behind 3
       columns of small footer links was the lowest-contrast text block on
       every marketing page, and it is the one block a reader reaches at the
       bottom of a long scroll. Ink + white keeps the links legible. */
    <footer className="bg-ink-deep text-white">
      <div className="container-page py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo onBrand />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Turn LinkedIn creators into your best acquisition channel.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold text-white">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="rounded text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/15 pt-7 sm:flex-row sm:items-center">
          <p className="text-sm text-white/70">
            © 2026 8xNanoo. All rights reserved.
          </p>
          <p className="text-sm text-white/60">
            Built by {CREDIT_NAME} for 8x — UI redesign of Nanoo
          </p>
        </div>
      </div>
    </footer>
  );
}
