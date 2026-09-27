/**
 * Renders HowItWorks and asserts the step sequence contract.
 *
 * The audit changed the layout from a single stacked column to alternating
 * two-column rows with a visual per step, replaced the hand-rolled checkmark
 * chips with the shared token, and moved the CTA to CTABand. None of that had
 * coverage.
 */
import { installDomShims } from './dom-shims.mjs';
import { createServer } from 'vite';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const ReactDOMClient = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { MemoryRouter } = require('react-router-dom');

const OUT = '.agent-logs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/how-it-works',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.IS_REACT_ACT_ENVIRONMENT = true;
installDomShims();

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { AuthProvider } = await server.ssrLoadModule('/src/lib/AuthContext.jsx');
const { base44 } = await server.ssrLoadModule('/src/api/base44Client.js');
const { default: HowItWorks } = await server.ssrLoadModule('/src/pages/HowItWorks.jsx');

base44.entities = new Proxy({}, { get: () => ({ list: () => Promise.resolve([]) }) });
base44.functions = { getPublicSettings: () => Promise.resolve({ id: 'default', public_settings: {} }) };

const host = dom.window.document.createElement('div');
dom.window.document.body.appendChild(host);
const root = ReactDOMClient.createRoot(host);
await act(async () => {
  root.render(
    React.createElement(AuthProvider, null,
      React.createElement(MemoryRouter, { initialEntries: ['/how-it-works'] },
        React.createElement(HowItWorks)))
  );
});
await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const html = host.innerHTML;
fs.writeFileSync(path.join(OUT, 'how-it-works.html'), html);

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (h, needle) => h.includes(needle);
const countOf = (h, re) => (h.match(re) || []).length;
const body = (h) => h.replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '');

// --- hero -------------------------------------------------------------------
check('hero: uses .text-display', has(html, 'text-display'));
check('hero: no gradient headline', !has(body(html), 'text-gradient'));
check('hero: flat dotted background', has(html, 'bg-dots') && !has(html, 'bg-brand-radial'));
check('hero: states the step count', has(html, 'five steps'));

// --- step sequence ----------------------------------------------------------
check('steps: 5 rows', countOf(html, /Step 0[1-5]/g) === 5);
check('steps: all five step numbers present', [1, 2, 3, 4, 5].every((i) => has(html, `Step 0${i}`)));
check('steps: connector rail is flat, not a gradient', !/left-\[27px\][^"]*bg-gradient/.test(html));
check('steps: connector rail is hidden on mobile', /left-\[27px\][^"]*hidden[^"]*sm:block/.test(html));

// --- alternating layout -----------------------------------------------------
// The visual must sit on the inside edge of each row, so even rows get
// sm:order-first. Counted because a regression to one-sided layout would
// silently stack every visual in a single column.
check('layout: alternating visual sides', countOf(html, /sm:order-first sm:pr-2/g) === 2);
check('layout: two-column row at sm and up', countOf(html, /sm:flex-row sm:items-start sm:gap-8/g) === 5);

// --- visuals ----------------------------------------------------------------
check('visual: search results mock', has(html, 'Maya Lindqvist') && has(html, 'fit'));
check('visual: brief mock', has(html, 'cf.link/northbeam-q4'));
check('visual: collaboration state list', has(html, 'Revision requested'));
check('visual: attribution sparkline is accessible', has(html, 'aria-label="Attributed pipeline trending upward'));
check('visual: payout card', has(html, 'Payout to') && has(html, 'Settled 6h'));

// --- check tokens -----------------------------------------------------------
// The old chips hand-rolled a green Check at h-3 w-3. FeatureCheck renders
// 15 of them (3 points x 5 steps) at a single size inside one token wrapper.
check('tokens: checkmarks use the shared token', countOf(html, /class="lucide lucide-check"/g) === 15);
check('tokens: checkmarks share one size token', countOf(html, /h-5 w-5 shrink-0 items-center justify-center rounded-full/g) === 15);
check('tokens: no hand-rolled success checkmarks', !/h-3 w-3 text-success/.test(html));
check('tokens: no raw palette classes', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(body(html)));

// --- CTA --------------------------------------------------------------------
check('cta: flat ink band', has(html, 'bg-ink'));
check('cta: both actions present', has(html, 'href="/signup"') && has(html, 'href="/pricing"'));
check('cta: no gradient band', !has(body(html), 'bg-brand-gradient'));

// --- data -------------------------------------------------------------------
const source = fs.readFileSync('src/pages/HowItWorks.jsx', 'utf8');
check('data: no inlined creator count literal', !/3,000\+/.test(source));
check('data: imports count from data/stats', /CREATORS_LISTED/.test(source) && /from "@\/data\/stats"/.test(source));

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
