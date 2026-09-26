import { Link } from "react-router-dom";
import { Logo } from "@/components/PublicNav";

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
    <footer className="relative overflow-hidden bg-brand-gradient text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div className="container-page relative py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo onBrand />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/85">
              Turn LinkedIn creators into your best acquisition channel.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="rounded text-sm text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-primary-foreground/20 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-primary-foreground/85">
            © 2026 CreatorFlow. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/70">
            Built as a functional MVP inspired by naano.com
          </p>
        </div>
      </div>
    </footer>
  );
}
