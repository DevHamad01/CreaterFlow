/**
 * Shared Recharts palette.
 *
 * Recharts writes these values straight into SVG `fill`/`stroke`, so they have
 * to be real CSS colors. Using the design tokens keeps every chart readable in
 * both light and violet-tinted dark mode.
 */
export const CHART_COLORS = {
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  primary: "hsl(var(--primary))",
  iris: "hsl(var(--iris))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
  neutral: "hsl(var(--muted-foreground))",
  muted: "hsl(var(--muted))",
};

/** Tooltip surface that matches the app card styling. */
export const CHART_TOOLTIP = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
};

/** Axis defaults so every chart in the app shares one voice. */
export const CHART_AXIS_TICK = { fontSize: 11 };
