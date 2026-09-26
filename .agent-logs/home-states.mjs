/**
 * Renders Home in a real DOM and asserts the loading / empty / error / success
 * branches of the featured-creators section.
 *
 * Note: base44.entities is a Proxy that rebuilds the entity API on every access,
 * so the mock has to replace the whole `entities` property, and each state needs
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
  url: 'http://localhost/',
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
const { default: Home } = await server.ssrLoadModule('/src/pages/Home.jsx');

const CREATORS = [
  { id: 'c1', name: 'Maya Lindqvist', headline: 'B2B SaaS founder voice', niche: 'SaaS',
    city: 'Stockholm', country: 'Sweden', linkedin_followers: 48200, engagement_rate: 5.4, price_per_post: 640, verified: true },
  { id: 'c2', name: 'Diego Ramos', headline: 'RevOps and GTM systems', niche: 'RevOps',
    city: 'Madrid', country: 'Spain', linkedin_followers: 31900, engagement_rate: 4.8, price_per_post: 520 },
  { id: 'c3', name: 'Aisha Bello', headline: 'HR tech and people ops', niche: 'HR Tech',
    city: 'Lagos', country: 'Nigeria', linkedin_followers: 27600, engagement_rate: 6.1, price_per_post: 480 },
];

const queries = [];
let behaviour = 'pending';

base44.entities = new Proxy({}, {
  get(_t, entityName) {
    return {
      list: (...args) => {
        queries.push([entityName, ...args]);
        if (behaviour === 'pending') return new Promise(() => {});
        if (behaviour === 'reject') return Promise.reject(new Error('Firestore unavailable (503)'));
        if (behaviour === 'empty') return Promise.resolve([]);
        return Promise.resolve(CREATORS);
      },
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
        React.createElement(MemoryRouter, null, React.createElement(Home)))
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 80)); });

  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `home-${label}.html`), html);
  await act(async () => { root.unmount(); });
  host.remove();
  return html;
}

// --- loading ---------------------------------------------------------------
let html = await renderState('loading', 'pending');
check('loading: shimmer skeleton rendered', has(html, 'animate-shimmer'));
check('loading: 6 skeleton cards', (html.match(/animate-shimmer/g) || []).length >= 18);
check('loading: aria-busy + polite live region', has(html, 'aria-busy="true"') && has(html, 'aria-live="polite"'));
check('loading: sr-only status text', has(html, 'Loading featured creators'));
check('loading: no empty-state copy', !has(html, 'No creators to show yet'));
check('loading: no error alert', !has(html, 'role="alert"'));

// --- empty -----------------------------------------------------------------
html = await renderState('empty', 'empty');
check('empty: EmptyState headline', has(html, 'No creators to show yet'));
check('empty: descriptive body copy', has(html, 'appear here as soon as'));
check('empty: marketplace CTA link', has(html, 'href="/marketplace"'));
check('empty: no skeletons', !has(html, 'animate-shimmer'));
check('empty: no error alert', !has(html, 'role="alert"'));

// --- error -----------------------------------------------------------------
html = await renderState('error', 'reject');
check('error: role=alert', has(html, 'role="alert"'));
check('error: server message surfaced', has(html, 'Firestore unavailable (503)'));
check('error: retry button', has(html, 'Try again'));
check('error: danger styling token', has(html, 'border-danger/25') || has(html, 'border-danger\\/25'));
check('error: no skeletons', !has(html, 'animate-shimmer'));

// --- success ---------------------------------------------------------------
html = await renderState('success', 'resolve');
check('success: creator name rendered', has(html, 'Maya Lindqvist'));
check('success: follower count formatted (48.2K)', has(html, '48.2K'));
check('success: all three cards', ['Maya Lindqvist', 'Diego Ramos', 'Aisha Bello'].every((n) => has(html, n)));
check('success: verified badge icon', has(html, 'text-primary flex-shrink-0') || has(html, 'lucide-badge-check'));
check('success: no empty copy', !has(html, 'No creators to show yet'));
check('success: no error alert', !has(html, 'role="alert"'));
check('success: no skeletons', !has(html, 'animate-shimmer'));

// --- query contract --------------------------------------------------------
check('query contract unchanged: Creator, sort -linkedin_followers, limit 6',
  queries.length === 4 && queries.every((q) => q[0] === 'Creator' && q[1] === '-linkedin_followers' && q[2] === 6),
  JSON.stringify(queries[0]));

// --- design system + a11y --------------------------------------------------
html = await renderState('audit', 'resolve');
check('a11y: exactly one h1', (html.match(/<h1/g) || []).length === 1);
check('a11y: nav landmarks present', has(html, '<nav') || has(html, 'aria-label='));
check('tokens: zero raw palette classes', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(html));
check('tokens: gradient headline', has(html, 'from-primary') && has(html, 'to-iris'));
check('tokens: display font on headings', has(html, 'font-display'));
check('tokens: section rhythm utility', has(html, 'section-y'));
check('tokens: container utility', has(html, 'container-page'));
check('tokens: surface-card utility', has(html, 'surface-card'));
const svgs = html.match(/<svg[^>]*>/g) || [];
const noHidden = svgs.filter((s) => !s.includes('aria-hidden')).length;
check(`a11y: all ${svgs.length} icons aria-hidden`, noHidden === 0, `${noHidden} without`);

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
