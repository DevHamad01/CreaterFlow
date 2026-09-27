import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const SOLUTIONS = [
  { label: "For companies", path: "/for-companies", desc: "Find creators and track pipeline" },
  { label: "For agencies", path: "/for-agencies", desc: "Manage multiple client campaigns" },
  { label: "For creators", path: "/for-creators", desc: "Get paid to post on LinkedIn" },
];

const LINKS = [
  { label: "Marketplace", path: "/marketplace" },
  { label: "How it works", path: "/how-it-works" },
  { label: "Pricing", path: "/pricing" },
];

export function Logo({ compact = false, onBrand = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${
          onBrand
            ? // Flat, not bg-brand-gradient: the mark sits on ink, and a
              // gradient chip on a dark surface added no brand signal that the
              // wordmark next to it does not already carry.
              "bg-primary/15 text-white"
            : "bg-primary text-primary-foreground"
        }`}
      >
        8
      </span>
      {!compact && (
        // Two-line lockup: wordmark + tagline. `leading-none` on the column
        // stops the descender of the wordmark colliding with the tagline, which
        // is what makes stacked brand text look uneven at 10px.
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-lg font-semibold tracking-tight ${
              onBrand ? "text-white" : "text-foreground"
            }`}
          >
            {/* The "8x" carries the brand, so it takes the accent while "Nanoo"
                stays in the page's ink colour for a clear reading order. */}
            <span className={onBrand ? "text-white" : "text-primary"}>8x</span>
            Nanoo
          </span>
          <span
            className={`mt-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
              onBrand ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            By 8xNanoo
          </span>
        </span>
      )}
    </span>
  );
}

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Close both menus on navigation
  useEffect(() => {
    setOpen(false);
    setSolutionsOpen(false);
  }, [location.pathname]);

  // Condense the bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dismiss the solutions menu on outside click / Escape
  useEffect(() => {
    if (!solutionsOpen) return;
    const onPointerDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setSolutionsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSolutionsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [solutionsOpen]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header
      // Explicit property lists, not `transition-all`. The header animates on
      // every scroll-threshold crossing, and `all` would also transition
      // layout properties and `backdrop-filter`, forcing a full-page reflow
      // plus a repaint of the blurred backdrop layer.
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ease-smooth ${
        scrolled ? "border-border shadow-xs" : "border-transparent"
      }`}
    >
      <nav className="container-page" aria-label="Main">
        {/* Height is animated deliberately: it's a single sticky element
            changing size once per scroll-direction flip, which is a bounded
            one-off layout rather than a per-frame cost. Listed explicitly so
            nothing else (padding, margin, font-size) can hitch alongside it. */}
        <div className={`flex items-center justify-between transition-[height] duration-200 ease-smooth ${scrolled ? "h-14" : "h-16"}`}>
          <Link to="/" className="rounded-lg" aria-label="8xNanoo home">
            <Logo />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSolutionsOpen((v) => !v)}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/for-companies") || isActive("/for-agencies") || isActive("/for-creators")
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Solutions
                <ChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${solutionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {solutionsOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-border/80 bg-popover p-1.5 shadow-overlay">
                  {SOLUTIONS.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                    >
                      <p className="text-sm font-semibold text-foreground">{s.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                aria-current={isActive(l.path) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(l.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/app")}>Go to dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>Sign in</Button>
                <Button onClick={() => navigate("/signup")}>Get started</Button>
              </>
            )}
          </div>

          {/* Mobile trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile panel */}
        {open && (
          <div id="public-mobile-menu" className="border-t border-border/70 py-4 md:hidden">
            <p className="eyebrow px-3 pb-1.5">Solutions</p>
            {SOLUTIONS.map((s) => (
              <Link
                key={s.path}
                to={s.path}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {s.label}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{s.desc}</span>
              </Link>
            ))}
            <p className="eyebrow px-3 pb-1.5 pt-4">Product</p>
            {LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 px-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/app")}>Go to dashboard</Button>
              ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate("/login")}>Sign in</Button>
                    <Button onClick={() => navigate("/signup")}>Get started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
