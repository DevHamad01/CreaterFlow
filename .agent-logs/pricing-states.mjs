/**
 * Renders Pricing and asserts the plan cards, social proof, scope note and FAQ.
 *
 * The featured plan used to be a brand gradient with white-on-violet body
 * text, which put the pricing page's most important number behind the lowest
 * contrast treatment on the site. It is now a neutral card with a border +
 * badge. That is the regression this file guards.
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
  url: 'http://localhost/pricing',
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
const { default: Pricing } = await server.ssrLoadModule('/src/pages/Pricing.jsx');
const { CASE_STUDY, PRICING_PROOF } = await server.ssrLoadModule('/src/data/stats.js');

base44.entities = new Proxy({}, { get: () => ({ list: () => Promise.resolve([]) }) });
base44.functions = { getPublicSettings: () => Promise.resolve({ id: 'default', public_settings: {} }) };

const host = dom.window.document.createElement('div');
dom.window.document.body.appendChild(host);
const root = ReactDOMClient.createRoot(host);
await act(async () => {
  root.render(
    React.createElement(AuthProvider, null,
      React.createElement(MemoryRouter, { initialEntries: ['/pricing'] },
        React.createElement(Pricing)))
  );
});
await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
const html = host.innerHTML;
fs.writeFileSync(path.join(OUT, 'pricing.html'), html);

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (h, needle) => h.includes(needle);
const countOf = (h, re) => (h.match(re) || []).length;
const body = (h) => h.replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '');

// --- hero -------------------------------------------------------------------
check('hero: uses .text-display', has(html, 'text-display'));
check('hero: no gradient headline', !has(body(html), 'text-gradient'));
check('hero: flat dotted background', has(html, 'bg-dots') && !has(html, 'bg-brand-radial'));
check('hero: keeps the free-first message', has(html, 'Start free.'));

// --- plan cards -------------------------------------------------------------
// The regression this file exists for.
check('plans: no gradient plan card', !has(body(html), 'bg-brand-gradient'));
check('plans: no foreground-token text on a plan', !/p-8 text-primary-foreground/.test(html));
check('plans: both plans rendered', has(html, 'Run it yourself') && has(html, 'Get your time back'));
check('plans: featured plan emphasised by border, not colour', has(html, 'border-2 border-primary/40'));
check('plans: featured badge sits above the card', has(html, 'absolute -top-3'));
check('plans: prices still shown', has(html, '€0') && has(html, 'Custom'));
check('plans: 12 feature rows total', countOf(html, /class="lucide lucide-check"/g) === 12);
check('plans: feature checks use the shared token', countOf(html, /h-5 w-5 shrink-0 items-center justify-center rounded-full/g) === 12);

// --- scope note -------------------------------------------------------------
// "Campaign spend is separate" is the most load-bearing sentence on a pricing
// page for a per-post product.
check('scope: spend-is-separate note present', has(html, 'Campaign spend is separate'));
check('scope: states no platform fee', has(html, 'no platform fee'));
check('scope: states per-post model', has(html, 'per-post price'));

// --- social proof -----------------------------------------------------------
check('proof: fictional client named', has(html, PRICING_PROOF.client));
check('proof: client role attributed', has(html, PRICING_PROOF.clientRole));
check('proof: labelled as a sample client', has(html, 'Sample client'));
check('proof: quote is a real blockquote', has(html, '<blockquote') && has(html, '<figcaption'));
check('proof: stats rendered as a description list', has(html, '<dl') && has(html, '</dl>'));
// Figures must come from CASE_STUDY, not be retyped for this page.
check('proof: stats reuse CASE_STUDY figures', PRICING_PROOF.stats === CASE_STUDY.stats);
check('proof: 3 proof stats', countOf(html, /tabular-nums/g) === 3);
check('proof: 9 creators matches the Home figure', has(html, 'nine creators') && CASE_STUDY.stats[0].value === 9);

// --- FAQ --------------------------------------------------------------------
check('faq: rendered via the shared accordion', has(html, 'Frequently asked questions'));
// Scoped to the FAQ's own id prefix: PublicNav renders 2 more aria-expanded
// disclosures (mobile menu, account), so a bare aria-expanded count is 7.
check('faq: all 5 questions present', countOf(html, /aria-controls="faq-panel-\d"/g) === 5);
check('faq: no local FaqItem duplicate remains', !/faq-button-/.test(html));

// --- CTA --------------------------------------------------------------------
check('cta: flat ink band', has(html, 'bg-ink'));
check('cta: both actions present', has(html, 'href="/signup"') && has(html, 'href="/marketplace"'));

// --- tokens -----------------------------------------------------------------
check('tokens: zero raw palette classes in body', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(body(html)));

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
