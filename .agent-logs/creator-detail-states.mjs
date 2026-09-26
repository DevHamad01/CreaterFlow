/**
 * Renders CreatorDetail in a real DOM and asserts the loading / not-found /
 * error / success branches, plus the save toggle contract.
 *
 * Note: base44.entities is a Proxy that rebuilds the entity API on every access,
 * so the mock has to replace the whole `entities` property.
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
const { MemoryRouter, Routes, Route } = require('react-router-dom');

const OUT = '.agent-logs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/creator/c1',
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
const { default: CreatorDetail } = await server.ssrLoadModule('/src/pages/CreatorDetail.jsx');

const CREATOR = {
  id: 'c1',
  name: 'Maya Lindqvist',
  headline: 'B2B SaaS founder voice',
  niche: 'SaaS',
  bio: 'Operator writing about building and scaling B2B SaaS teams.',
  city: 'Stockholm',
  country: 'Sweden',
  linkedin_followers: 48200,
  engagement_rate: 5.4,
  price_per_post: 640,
  verified: true,
  rating: 4.9,
  reviews_count: 37,
  total_campaigns: 58,
  avg_impressions: 12400,
  avg_clicks: 318,
  avg_leads: 12,
  sub_niches: ['DevTools', 'PLG', 'RevOps'],
  audience_type: 'Founders & revenue leaders',
  audience_industries: ['SaaS', 'Fintech'],
  audience_geography: ['Sweden', 'DACH'],
  languages: ['English', 'Swedish'],
  availability: 'limited',
};

let behaviour = 'pending';
const calls = [];
const created = [];
let deleted = [];
let favourites = [];

base44.entities = new Proxy({}, {
  get(_t, entityName) {
    if (entityName === 'Creator') {
      return {
        get: (id) => {
          calls.push(['Creator.get', id]);
          if (behaviour === 'pending') return new Promise(() => {});
          if (behaviour === 'reject') return Promise.reject(new Error('Firestore unavailable (503)'));
          if (behaviour === 'missing') return Promise.resolve(null);
          return Promise.resolve(CREATOR);
        },
      };
    }
    if (entityName === 'Favorite') {
      return {
        filter: (args) => {
          calls.push(['Favorite.filter', args]);
          if (behaviour === 'reject') return Promise.reject(new Error('Firestore unavailable (503)'));
          return Promise.resolve(favourites);
        },
        create: (payload) => {
          calls.push(['Favorite.create', payload]);
          created.push(payload);
          return Promise.resolve({ id: 'f1' });
        },
        delete: (id) => {
          calls.push(['Favorite.delete', id]);
          deleted.push(id);
          return Promise.resolve({});
        },
      };
    }
    return new Proxy({}, { get: () => () => Promise.resolve([]) });
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
        React.createElement(MemoryRouter, { initialEntries: ['/creator/c1'] },
          React.createElement(Routes, null,
            React.createElement(Route, { path: '/creator/:id', element: React.createElement(CreatorDetail) })
          )
        ))
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 80)); });

  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `creator-detail-${label}.html`), html);
  return { html, host, root };
}

// --- loading ---------------------------------------------------------------
let { html, host, root } = await renderState('loading', 'pending');
check('loading: skeleton shimmer rendered', has(html, 'animate-shimmer'));
check('loading: aria-busy + polite live region', has(html, 'aria-busy="true"') && has(html, 'aria-live="polite"'));
check('loading: sr-only status text', has(html, 'Loading creator profile'));
check('loading: no not-found copy', !has(html, 'Creator not found'));
check('loading: no error alert', !has(html, 'role="alert"'));
await act(async () => { root.unmount(); });
host.remove();

// --- not found -------------------------------------------------------------
({ html, host, root } = await renderState('notfound', 'missing'));
check('not-found: headline', has(html, 'Creator not found'));
check('not-found: recovery copy', has(html, 'Browse the marketplace'));
check('not-found: marketplace CTA', has(html, 'href="/marketplace"'));
check('not-found: no skeletons', !has(html, 'animate-shimmer'));
check('not-found: no error alert', !has(html, 'role="alert"'));
await act(async () => { root.unmount(); });
host.remove();

// --- error -----------------------------------------------------------------
({ html, host, root } = await renderState('error', 'reject'));
check('error: role=alert', has(html, 'role="alert"'));
check('error: explains the failure', has(html, 'reach the marketplace'));
check('error: retry button', has(html, 'Try again'));
check('error: no skeletons', !has(html, 'animate-shimmer'));
await act(async () => { root.unmount(); });
host.remove();

// --- success ---------------------------------------------------------------
behaviour = 'resolve';
({ html, host, root } = await renderState('success', 'resolve'));
check('success: creator name', has(html, 'Maya Lindqvist'));
check('success: headline rendered', has(html, 'B2B SaaS founder voice'));
check('success: price card', has(html, '€640'));
check('success: followers formatted (48K)', has(html, '48K'));
check('success: metrics formatted', has(html, '12K') && has(html, '318') && has(html, '12'));
check('success: location joined', has(html, 'Stockholm, Sweden'));
check('success: availability limited', has(html, 'Limited') && has(html, 'Few slots remaining this month'));
check('success: sub-niche chips', has(html, 'DevTools') && has(html, 'PLG'));
check('success: audience industries', has(html, 'Fintech'));
check('success: verified icon accessible', has(html, 'sr-only">Verified creator'));
check('success: back link to marketplace', has(html, 'href="/marketplace"'));
check('success: exactly one h1', (html.match(/<h1/g) || []).length === 1);
check('success: no skeletons', !has(html, 'animate-shimmer'));
check('success: no error alert', !has(html, 'role="alert"'));

// --- save toggle (signed out) ---------------------------------------------
check('save: signed out does not write to the API', created.length === 0 && deleted.length === 0);
check('save: no Favorite.create call while signed out', !calls.some((c) => c[0] === 'Favorite.create'));
check('save: no Favorite.filter call while signed out', !calls.some((c) => c[0] === 'Favorite.filter'));

// --- design system + a11y --------------------------------------------------
check('tokens: zero raw palette classes', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(html));
check('tokens: strong surface panel', has(html, 'surface-card-strong'));
check('tokens: surface cards', has(html, 'surface-card'));
check('tokens: container + card utilities', has(html, 'container-page') && has(html, 'surface-card'));
check('tokens: display font on values', has(html, 'font-display'));
const svgs = html.match(/<svg[^>]*>/g) || [];
const noHidden = svgs.filter((s) => !s.includes('aria-hidden')).length;
check(`a11y: all ${svgs.length} icons aria-hidden`, noHidden === 0, `${noHidden} without`);
check('a11y: images use empty alt (decorative avatar)', !/<img(?![^>]*alt="")/.test(html));
check('a11y: lists used for grouped facts', has(html, '<ul') && has(html, '<li'));

await act(async () => { root.unmount(); });
host.remove();

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
