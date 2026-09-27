/**
 * Renders Marketplace in a real DOM and asserts the filter rail, the seeded
 * grid, the toolbar count, and the filter states.
 *
 * There was no coverage for this page before. The audit changed real behaviour
 * here (seeded rows, case-insensitive availability match, three native selects
 * replaced with the shadcn Select), so each of those needs a regression check.
 *
 * base44.entities is a Proxy that rebuilds the entity API on every access, so
 * the mock replaces the whole `entities` property, and each state renders into
 * a fresh root so the mount effect re-runs.
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
  url: 'http://localhost/marketplace',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.HTMLSelectElement = dom.window.HTMLSelectElement;
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
const { default: Marketplace } = await server.ssrLoadModule('/src/pages/Marketplace.jsx');
const { creators: SAMPLE } = await server.ssrLoadModule('/src/data/creators.js');

// Capitalised availability on purpose: the filter tokens are lowercase, and a
// strict comparison here silently emptied the grid.
const API_CREATORS = [
  { id: 'a1', name: 'Maya Lindqvist', headline: 'B2B SaaS founder voice', niche: 'AI & SaaS',
    city: 'Stockholm', country: 'Sweden', linkedin_followers: 48200, engagement_rate: 5.4,
    price_per_post: 640, availability: 'Available', verified: true },
  { id: 'a2', name: 'Diego Ramos', headline: 'RevOps and GTM systems', niche: 'Sales & GTM',
    city: 'Madrid', country: 'Spain', linkedin_followers: 31900, engagement_rate: 4.8,
    price_per_post: 520, availability: 'Limited' },
  { id: 'a3', name: 'Aisha Bello', headline: 'HR tech and people ops', niche: 'HR & Recruiting',
    city: 'Lagos', country: 'Nigeria', linkedin_followers: 27600, engagement_rate: 6.1,
    price_per_post: 480, availability: 'Booked' },
];

let behaviour = 'pending';
const queries = [];

base44.entities = new Proxy({}, {
  get(_t, entityName) {
    return {
      list: (...args) => {
        queries.push([entityName, ...args]);
        if (behaviour === 'pending') return new Promise(() => {});
        if (behaviour === 'reject') return Promise.reject(new Error('Firestore unavailable (503)'));
        if (behaviour === 'empty') return Promise.resolve([]);
        return Promise.resolve(API_CREATORS);
      },
      filter: () => Promise.resolve([]),
    };
  },
});

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (html, needle) => html.includes(needle);

async function renderState(label, mode) {
  behaviour = mode;
  const host = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(host);
  const root = ReactDOMClient.createRoot(host);
  await act(async () => {
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(MemoryRouter, { initialEntries: ['/marketplace'] },
          React.createElement(Marketplace)))
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 80)); });
  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `marketplace-${label}.html`), html);
  await act(async () => { root.unmount(); });
  host.remove();
  return html;
}

// --- seeded: request never settles -----------------------------------------
// The grid must be browsable before the response arrives, otherwise a slow or
// unreachable backend leaves the page empty.
let html = await renderState('pending', 'pending');
check('pending: seeded cards render', (html.match(/rounded-full/g) || []).length >= 6);
check('pending: no skeleton gating', !has(html, 'animate-shimmer'));
check('pending: search input present', has(html, 'placeholder="Search creators'));
check('pending: no error note', !has(html, 'Retry'));

// --- seeded: empty 200 ------------------------------------------------------
// An empty array is not authoritative, so the seed records must survive.
html = await renderState('empty', 'empty');
check('empty-200: seed retained', (html.match(/rounded-full/g) || []).length >= 6);
check('empty-200: not labelled as unavailable', !has(html, 'No creators available yet'));

// --- error ------------------------------------------------------------------
html = await renderState('error', 'reject');
check('error: non-fatal status note', has(html, 'role="status"'));
check('error: no blocking alert', !has(html, 'role="alert"'));
check('error: seed still browsable', (html.match(/rounded-full/g) || []).length >= 6);
check('error: retry affordance', has(html, 'Retry'));

// --- success ----------------------------------------------------------------
html = await renderState('success', 'resolve');
check('success: API rows replace seed', has(html, 'Maya Lindqvist'));
check('success: capitalised availability matched', has(html, 'Available'));
check('success: count in toolbar', /\d+ creators/.test(html));

// --- hero copy --------------------------------------------------------------
// Regression guard for the "Browse 0 vetted creators" bug: the hero must not
// interpolate a computed count into marketing copy.
check('copy: no computed count in hero', !has(html, 'Browse 0 vetted creators'));
check('copy: no bare "0 vetted"', !/Browse\s+0\b/.test(html));
check('copy: hero states weekly additions', has(html, 'New profiles added weekly'));

// --- selects ----------------------------------------------------------------
// Native <select> for sort / niche / min-followers was replaced with the
// shadcn Select, which is a button + listbox rather than a form control.
const nativeSelects = html.match(/<select\b/g) || [];
check('selects: no native select remains', nativeSelects.length === 0, `${nativeSelects.length} found`);
check('selects: sort trigger present', has(html, 'aria-label="Sort creators"'));
check('selects: niche trigger present', has(html, 'id="mk-niche"'));
check('selects: followers trigger present', has(html, 'id="mk-followers"'));

// --- max price --------------------------------------------------------------
// The label/value pair shared one flex row and clipped at narrow widths. They
// are now separate elements, and the value is thousands-formatted.
check('price: label present', has(html, 'Max price'));
check('price: value formatted with separator', has(html, '2,000'));
check('price: slider present', has(html, 'type="range"'));
check('price: lower bound shown', has(html, '€200'));

// --- availability chips ------------------------------------------------------
// Tap targets were py-1.5 text-xs, under the 44px minimum.
check('availability: min tap height', has(html, 'min-h-11'));

// --- toolbar / chips --------------------------------------------------------
check('toolbar: trust strip rendered', has(html, 'Vetted before listing'));

// --- tokens -----------------------------------------------------------------
check('tokens: zero raw palette classes', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(html));
check('tokens: container utility', has(html, 'container-page'));
check('tokens: sticky filter rail', has(html, 'sticky'));

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
