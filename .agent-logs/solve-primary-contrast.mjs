/**
 * Solves the one genuine contrast failure: `primary text on muted` in DARK
 * mode measures 4.41 against a 4.5 requirement.
 *
 * In dark mode --primary-foreground is a DARK ink (250 40% 8%), so a primary
 * button is light-fill/dark-text. That means lightening --primary improves
 * the text-on-surface pairs AND the foreground-on-primary pair at the same
 * time -- there is no tradeoff to negotiate, only a threshold to clear.
 *
 * Sweeps candidate lightness values and reports every dark pair that involves
 * --primary, so the chosen value is justified against the whole palette
 * rather than just the pair that happens to be failing today.
 */

// --- colour maths (tokens are authored as HSL, as they are in index.css) -----
const hslToRgb = (h, s, l) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => v * 255);
};

const relLuminance = ([r, g, b]) => {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrast = (fg, bg) => {
  const [hi, lo] = [relLuminance(fg), relLuminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

// --- dark palette, transcribed from src/index.css ---------------------------
const DARK = {
  primary: [255, 90, 70],            // the token under test
  'primary-foreground': [250, 40, 8],
  background: [250, 30, 7],
  card: [250, 26, 10],
  muted: [250, 18, 15],
  foreground: [250, 20, 96],
  'muted-foreground': [250, 12, 66],
};

const rgb = (theme, name) => hslToRgb(...theme[name]);

// Every dark pair that --primary participates in. Deliberately excludes
// "primary on foreground": in dark mode --foreground is near-white (96% L), so
// primary text on it is 3.30 -- but that pair is not reachable, because
// --foreground is a text colour, never a surface behind accent text.
const PAIRS = [
  ['primary', 'muted', 4.5, 'the pair that fails today'],
  ['primary', 'background', 4.5, ''],
  ['primary', 'card', 4.5, ''],
  ['primary-foreground', 'primary', 4.5, ''],
];

const evaluate = (lightness) => {
  const theme = { ...DARK, primary: [255, 90, lightness] };
  return PAIRS.map(([fg, bg, min, note]) => {
    const r = contrast(rgb(theme, fg), rgb(theme, bg));
    return { label: `${fg} on ${bg}`, r, min, ok: r >= min, note };
  });
};

console.log('dark --primary: 255 90% <L>%\n');
console.log(`  baseline L=70 (current value in index.css)`);
for (const row of evaluate(70)) {
  console.log(`    ${row.ok ? 'PASS' : 'FAIL'}  ${row.label.padEnd(30)} ${row.r.toFixed(2).padStart(6)}  min ${row.min}${row.note ? `   <- ${row.note}` : ''}`);
}

console.log('');
for (const l of [71, 72, 73, 74, 75, 76]) {
  const rows = evaluate(l);
  const worst = rows.reduce((a, b) => (a.r < b.r ? a : b));
  const allOk = rows.every((x) => x.ok);
  console.log(
    `  ${allOk ? 'PASS' : 'FAIL'}  L=${String(l).padEnd(3)} ` +
      rows
        
        .map((x) => `${x.r.toFixed(2)}${x.ok ? '' : '*'}`)
        .join('  ') +
      `   worst: ${worst.label} = ${worst.r.toFixed(2)}`
  );
}

