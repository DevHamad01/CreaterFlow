import { readFileSync } from "node:fs";

const lines = readFileSync("src/index.css", "utf8").split(/\r?\n/);

function blockAt(startRe) {
  const start = lines.findIndex((l) => startRe.test(l));
  if (start < 0) throw new Error(`no block for ${startRe}`);
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*\}/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n");
}

const parse = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)].map((m) => [
      m[1],
      [Number(m[2]), Number(m[3]), Number(m[4])],
    ]),
  );

const L = parse(blockAt(/^\s*:root\s*\{/));
const D = parse(blockAt(/^\s*\.dark\s*\{/));

const toRgb = ([h, s, l]) => {
  const S = s / 100;
  const Lg = l / 100;
  const c = (1 - Math.abs(2 * Lg - 1)) * S;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = Lg - c / 2;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};

const lum = (rgb) => {
  const lin = (v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = rgb.map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [lum(toRgb(a)), lum(toRgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, label, minRatio]
const PAIRS = [
  ["foreground", "background", "body text", 4.5],
  ["foreground", "card", "text on card", 4.5],
  ["foreground", "popover", "text on popover", 4.5],
  ["foreground", "muted", "text on muted", 4.5],
  ["foreground", "secondary", "text on secondary", 4.5],
  ["foreground", "accent", "text on accent", 4.5],
  ["muted-foreground", "background", "muted text", 4.5],
  ["muted-foreground", "card", "muted text on card", 4.5],
  ["muted-foreground", "muted", "muted on muted", 4.5],
  ["muted-foreground", "secondary", "muted on secondary", 4.5],
  ["primary-foreground", "primary", "primary button", 4.5],
  ["iris-foreground", "iris", "iris button", 4.5],
  ["danger-foreground", "danger", "danger button", 4.5],
  ["destructive-foreground", "destructive", "destructive button", 4.5],
  ["success", "background", "success text", 4.5],
  ["success", "card", "success text on card", 4.5],
  ["warning", "background", "warning text", 4.5],
  ["warning", "card", "warning text on card", 4.5],
  ["danger", "background", "danger text", 4.5],
  ["danger", "card", "danger text on card", 4.5],
  ["primary", "background", "primary text", 4.5],
  ["primary", "card", "primary text on card", 4.5],
  ["primary", "muted", "primary text on muted", 4.5],
  ["mint", "background", "mint text", 4.5],
  ["sidebar-foreground", "sidebar-background", "sidebar text", 4.5],
  ["sidebar-accent-foreground", "sidebar-background", "sidebar accent", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", "sidebar primary", 4.5],
  ["border", "card", "border vs card (3:1 UI)", 3],
  ["border", "background", "border vs bg (3:1 UI)", 3],
  ["input", "background", "input vs bg (3:1 UI)", 3],
  ["ring", "background", "focus ring (3:1 UI)", 3],
];

for (const [modeName, T] of [
  ["LIGHT", L],
  ["DARK", D],
]) {
  console.log(`\n===== ${modeName} =====`);
  let fails = 0;
  for (const [fg, bg, label, min] of PAIRS) {
    if (!T[fg] || !T[bg]) continue;
    const r = ratio(T[fg], T[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}  (min ${min})  ${label.padEnd(30)} ${fg} on ${bg}`,
    );
  }
  console.log(`-- ${modeName}: ${fails} failing pair(s)`);
}
