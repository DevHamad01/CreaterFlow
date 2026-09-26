import { cn } from "@/lib/utils";

/**
 * Decorative SVG illustrations for empty states.
 *
 * Design constraints that shaped these:
 *  - Colour comes from the theme tokens (`--primary`, `--iris`, `--border`,
 *    `--muted-foreground`) via `currentColor` and inline `hsl(var(--token))`,
 *    so every illustration inverts correctly in dark mode with no second asset
 *    and no duplicated palette. Nothing is hard-coded, and no raw palette class
 *    is involved.
 *  - They're decorative: `aria-hidden` + `focusable="false"`, because the
 *    `EmptyState` heading already carries the meaning and a screen reader
 *    announcing "graphic" before every empty state is noise.
 *  - They're inline SVG rather than raster images so they cost no extra
 *    network request, stay crisp at any DPR, and can be recoloured by CSS.
 *  - They animate with a single slow `transform` (compositor-only) and the
 *    global reduced-motion rule already clamps that to a static state.
 *
 * Each is built on a shared 160×120 grid so a set of them lines up optically
 * when more than one appears on a page.
 */

/** Shared frame: viewBox, sizing, decorative semantics, idle float. */
function Art({ children, className }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("float-gentle h-auto w-40 max-w-full", className)}
    >
      {children}
    </svg>
  );
}

/** Soft ground shadow shared by the object illustrations. */
function Ground({ cy = 96 }) {
  return (
    <ellipse
      cx="80"
      cy={cy}
      rx="46"
      fill="hsl(var(--foreground) / 0.05)"
    />
  );
}

/** Nothing assigned yet — an empty in-tray with a lifted document. */
export function InboxEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <rect
        x="34"
        y="40"
        width="92"
        height="54"
        rx="12"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path
        d="M34 66h20a10 10 0 0 0 20 0h32"
        className="stroke-border"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="56"
        y="24"
        width="48"
        height="34"
        rx="8"
        className="fill-background stroke-border"
        strokeWidth="2"
        transform="rotate(-6 80 41)"
      />
      <path
        d="M66 38h28M66 46h18"
        className="stroke-muted-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        transform="rotate(-6 80 41)"
        opacity="0.5"
      />
      <circle
        cx="118"
        cy="30"
        r="7"
        className="fill-primary/10 stroke-primary"
        strokeWidth="2"
      />
      <path
        d="M115 30h6M118 27v6"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Art>
  );
}

/** No search results — a magnifier over a stack of filtered lines. */
export function SearchEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <rect
        x="30"
        y="34"
        width="76"
        height="62"
        rx="12"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path
        d="M42 52h52M42 64h38M42 76h28"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle
        cx="100"
        cy="66"
        r="21"
        className="fill-background stroke-primary"
        strokeWidth="3"
      />
      <path
        d="M115 81l14 14"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M100 58v16M92 66h16"
        className="stroke-iris"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Art>
  );
}

/** No active campaigns — a chart that hasn't started climbing. */
export function CampaignEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <rect
        x="28"
        y="36"
        width="104"
        height="58"
        rx="12"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path
        d="M40 82h80"
        className="stroke-border"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="44"
        y="66"
        width="12"
        height="16"
        rx="3"
        className="fill-primary/25"
      />
      <rect
        x="62"
        y="58"
        width="12"
        height="24"
        rx="3"
        className="fill-primary/40"
      />
      <rect
        x="80"
        y="62"
        width="12"
        height="20"
        rx="3"
        className="fill-primary/25"
      />
      <path
        d="M100 50c8 4 12 10 14 18"
        className="stroke-iris"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 5"
      />
      <path
        d="M110 64l5 5 4-7"
        className="stroke-iris"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Art>
  );
}

/** No earnings yet — an empty ledger with a pending coin. */
export function EarningsEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <rect
        x="34"
        y="30"
        width="92"
        height="64"
        rx="12"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path
        d="M46 46h44M46 58h30M46 70h52"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle
        cx="112"
        cy="70"
        r="19"
        className="fill-primary/12 stroke-primary"
        strokeWidth="2.5"
      />
      <path
        d="M112 61v18M107 66.5h10M107 73.5h10"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Art>
  );
}

/** No collaborations — two separate halves, not yet linked. */
export function CollaborationEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <circle
        cx="62"
        cy="54"
        r="20"
        className="fill-card stroke-border"
        strokeWidth="2.5"
      />
      <circle
        cx="98"
        cy="54"
        r="20"
        className="fill-card stroke-border"
        strokeWidth="2.5"
      />
      <path
        d="M70 70l-8 14M90 70l8 14"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M72 54h16M84 50l4 4-4 4"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Art>
  );
}

/** Fallback — the brand bloom, for empty states with no specific metaphor. */
export function IrisBloomEmpty(props) {
  return (
    <Art {...props}>
      <Ground />
      <circle
        cx="80"
        cy="58"
        r="34"
        className="fill-primary/[0.07] stroke-border"
        strokeWidth="2"
      />
      <g className="stroke-iris" strokeWidth="2.5" strokeLinecap="round">
        <path d="M80 36c10 0 16 8 16 16" />
        <path d="M102 52c0 10-8 16-16 16" />
        <path d="M96 68c-10 0-16-8-16-16" />
        <path d="M74 68c-10 0-16-8-16-16" />
        <path d="M58 52c0-10 8-16 16-16" />
      </g>
      <circle cx="80" cy="52" r="6" className="fill-primary" />
    </Art>
  );
}

/**
 * @typedef {"inbox" | "search" | "campaign" | "earnings" | "collaboration" | "bloom"} IllustrationName
 */

/** Lookup by name, for pages that want a specific metaphor. */
export const ILLUSTRATIONS = {
  inbox: InboxEmpty,
  search: SearchEmpty,
  campaign: CampaignEmpty,
  earnings: EarningsEmpty,
  collaboration: CollaborationEmpty,
  bloom: IrisBloomEmpty,
};

/**
 * @param {string} name Falls back to the brand bloom for unknown names, so a
 *   typo degrades to a sensible default instead of rendering nothing.
 * @returns {import("react").ComponentType<any>}
 */
export function getIllustration(name) {
  return ILLUSTRATIONS[name] || IrisBloomEmpty;
}
