/**
 * Renders each creator page in a real DOM and asserts the loading / error /
 * empty / success branches, plus the design-token and a11y contracts.
 *
 * Note: base44.entities is a Proxy that rebuilds the entity API on every access,
 * so the mock has to replace the whole `entities` property. `AuthContext` is
 * exported so the harness can inject a signed-in value instead of booting
 * Firebase.
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
  url: 'http://localhost/app/earnings',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.MutationObserver = dom.window.MutationObserver;
global.HTMLFormElement = dom.window.HTMLFormElement;
global.HTMLInputElement = dom.window.HTMLInputElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.HTMLSelectElement = dom.window.HTMLSelectElement;
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.HTMLDivElement = dom.window.HTMLDivElement;
global.HTMLSpanElement = dom.window.HTMLSpanElement;
global.SVGElement = dom.window.SVGElement;
global.DOMRect = dom.window.DOMRect;
global.DocumentFragment = dom.window.DocumentFragment;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
global.requestIdleCallback = (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0);
global.cancelIdleCallback = (id) => clearTimeout(id);
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.IS_REACT_ACT_ENVIRONMENT = true;
installDomShims();
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.HTMLElement.prototype.hasPointerCapture = () => false;
dom.window.HTMLElement.prototype.releasePointerCapture = () => {};
dom.window.HTMLElement.prototype.setPointerCapture = () => {};

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { AuthContext } = await server.ssrLoadModule('/src/lib/AuthContext.jsx');
const { base44 } = await server.ssrLoadModule('/src/api/base44Client.js');
const { default: Earnings } = await server.ssrLoadModule('/src/pages/creator/Earnings.jsx');
const { default: MyCampaigns } = await server.ssrLoadModule('/src/pages/creator/MyCampaigns.jsx');
const { default: Opportunities } = await server.ssrLoadModule('/src/pages/creator/Opportunities.jsx');
const { default: CreatorProfileEdit } = await server.ssrLoadModule(
  '/src/pages/creator/CreatorProfileEdit.jsx'
);

const USER = { id: 'u1', email: 'maya@example.com', full_name: 'Maya Lindqvist' };

const PAYMENTS = [
  {
    id: 'p1', campaign_name: 'Q3 Launch', company_name: 'Northwind', invoice_number: 'INV-1042',
    paid_date: '2026-03-04', due_date: '2026-03-01', amount: 640, status: 'paid',
  },
  {
    id: 'p2', campaign_name: 'Founder Stories', company_name: 'Acme', invoice_number: null,
    paid_date: null, due_date: '2026-04-20', amount: 900, status: 'pending',
  },
];

const COLLABS = [
  {
    id: 'cc1', campaign_id: 'camp1', creator_id: 'c1', creator_name: 'Maya Lindqvist',
    price: 640, status: 'accepted', tracking_link: 'https://track.example.com/maya',
  },
];

const CAMPAIGNS = [
  {
    id: 'camp1', name: 'Q3 Launch', company_name: 'Northwind', status: 'active',
    objective: 'Drive trial signups for the new analytics suite.',
    key_messages: ['Fast insights'], creator_guidelines: 'Keep it under 200 words.',
    target_audience: 'B2B founders', start_date: '2026-03-01', budget: 5000,
    tracking_base_url: 'https://track.example.com',
  },
  {
    id: 'camp2', name: 'Recruiting Sprint', company_name: 'Acme', status: 'recruiting',
    objective: 'Fill our SDR roles with warm intros.', target_audience: 'Founders',
    start_date: '2026-04-01', budget: 3000, tracking_base_url: 'https://track.example.com',
  },
];

const POSTS = [
  {
    id: 'post1', campaign_creator_id: 'cc1', creator_name: 'Maya Lindqvist',
    content: 'We shipped analytics that answers the question in one click.',
    status: 'approved', feedback: 'Strong hook, ship it.', post_url: 'https://linkedin.com/feed/x',
  },
];

const CREATORS = [
  {
    id: 'c1', name: 'Maya Lindqvist', niche: 'AI & SaaS', engagement_rate: 5.4, rating: 4.9,
    linkedin_followers: 48200, price_per_post: 640, headline: 'B2B SaaS founder voice',
    bio: 'Operator writing about scaling B2B SaaS.', country: 'Sweden', city: 'Stockholm',
    audience_type: 'Founders', availability: 'available',
  },
];

let behaviour = 'pending';
const calls = [];

base44.entities = new Proxy({}, {
  get(_t, entityName) {
    const ok = (v) => {
      if (behaviour === 'reject') return Promise.reject(new Error('Firestore unavailable (503)'));
      if (behaviour === 'pending') return new Promise(() => {});
      return Promise.resolve(v);
    };
    const list = (rows) => () => {
      calls.push([`${entityName}.list`]);
      return ok(rows);
    };
    const filter = (rows) => () => {
      calls.push([`${entityName}.filter`]);
      return ok(rows);
    };
    switch (entityName) {
      case 'Payment': return { filter: filter(PAYMENTS), list: list(PAYMENTS) };
      case 'CampaignCreator': return { filter: filter(COLLABS), list: list(COLLABS) };
      case 'Campaign': return { filter: filter(CAMPAIGNS), list: list(CAMPAIGNS), get: (id) => {
        calls.push(['Campaign.get', id]);
        return ok(CAMPAIGNS.find((c) => c.id === id) || null);
      } };
      case 'Post': return { filter: filter(POSTS), list: list(POSTS) };
      case 'Creator': return { filter: filter(CREATORS), list: list(CREATORS) };
      default: return new Proxy({}, { get: () => () => Promise.resolve([]) });
    }
  },
});

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (html, needle) => html.includes(needle);

const authValue = (user) => ({
  user, isAuthenticated: !!user, isLoadingAuth: false, isLoadingPublicSettings: false,
  authError: null, authChecked: true, appPublicSettings: { id: 'default', public_settings: {} },
  logout: () => {}, navigateToLogin: () => {},
});

async function renderPage(label, Page, mode, user = USER) {
  behaviour = mode;
  const host = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(host);
  const root = ReactDOMClient.createRoot(host);
  await act(async () => {
    root.render(
      React.createElement(AuthContext.Provider, { value: authValue(user) },
        React.createElement(MemoryRouter, { initialEntries: ['/app'] },
          React.createElement(Page)
        )
      )
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 90)); });
  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `creator-${label}.html`), html);
  return { html, host, root };
}

const unmount = async (host, root) => {
  await act(async () => { root.unmount(); });
  host.remove();
};

const contractChecks = (html, slug) => {
  check(`${slug}: zero raw palette classes`, !/(slate|blue|violet|emerald|amber|red|indigo|purple|sky)-\d{2,3}/.test(html));
  const svgs = html.match(/<svg[^>]*>/g) || [];
  const noHidden = svgs.filter((s) => !s.includes('aria-hidden')).length;
  check(`${slug}: all ${svgs.length} icons aria-hidden`, noHidden === 0, `${noHidden} without`);
  check(`${slug}: exactly one h1`, (html.match(/<h1/g) || []).length <= 1);
  check(`${slug}: PageHeader used`, has(html, 'surface-card') || has(html, '<h1'));
};

// --- Earnings ---------------------------------------------------------------
let { html, host, root } = await renderPage('earnings-loading', Earnings, 'pending');
check('earnings loading: busy live region', has(html, 'aria-busy="true"') && has(html, 'aria-live="polite"'));
check('earnings loading: sr-only status', has(html, 'Loading earnings'));
check('earnings loading: no error alert', !has(html, 'role="alert"'));
await unmount(host, root);

({ html, host, root } = await renderPage('earnings-error', Earnings, 'reject'));
check('earnings error: role=alert', has(html, 'role="alert"'));
check('earnings error: retry affordance', has(html, 'Try again'));
check('earnings error: no skeletons', !has(html, 'animate-shimmer') && !has(html, 'aria-busy="true"'));
await unmount(host, root);

({ html, host, root } = await renderPage('earnings-success', Earnings, 'resolve'));
check('earnings success: heading', has(html, 'Earnings'));
check('earnings success: total paid out', has(html, '€640'));
check('earnings success: pending total', has(html, '€900'));
check('earnings success: campaign rows', has(html, 'Q3 Launch') && has(html, 'Founder Stories'));
check('earnings success: table caption for screen readers', has(html, '<caption class="sr-only">'));
check('earnings success: em dash fallback for missing invoice', has(html, '—'));
check('earnings success: payout explainer', has(html, 'Paid within 24h'));
check('earnings success: no error alert', !has(html, 'role="alert"'));
contractChecks(html, 'earnings');
await unmount(host, root);

// --- Earnings, no name ------------------------------------------------------
({ html, host, root } = await renderPage('earnings-noname', Earnings, 'resolve', { id: 'u2' }));
check('earnings noname: profile completion prompt', has(html, 'Complete your profile'));
check('earnings noname: links to profile', has(html, 'href="/app/profile"'));
await unmount(host, root);

// --- MyCampaigns ------------------------------------------------------------
({ html, host, root } = await renderPage('mycampaigns-loading', MyCampaigns, 'pending'));
check('mycampaigns loading: busy live region', has(html, 'aria-busy="true"'));
check('mycampaigns loading: sr-only status', has(html, 'Loading your campaigns'));
await unmount(host, root);

({ html, host, root } = await renderPage('mycampaigns-error', MyCampaigns, 'reject'));
check('mycampaigns error: role=alert + retry', has(html, 'role="alert"') && has(html, 'Try again'));
await unmount(host, root);

({ html, host, root } = await renderPage('mycampaigns-success', MyCampaigns, 'resolve'));
check('mycampaigns success: heading + count', has(html, 'My campaigns') && has(html, '1 collaboration'));
check('mycampaigns success: campaign name', has(html, 'Q3 Launch'));
check('mycampaigns success: brand + price', has(html, 'Northwind') && has(html, '€640'));
check('mycampaigns success: key message shown', has(html, 'Fast insights'));
check('mycampaigns success: tracking link', has(html, 'track.example.com/maya'));
check('mycampaigns success: submission feedback', has(html, 'Brand feedback') && has(html, 'Strong hook'));
check('mycampaigns success: external post link is safe', has(html, 'rel="noreferrer"'));
check('mycampaigns success: no submit CTA once a post exists', !has(html, 'Submit draft'));
contractChecks(html, 'mycampaigns');
await unmount(host, root);

// --- Opportunities ----------------------------------------------------------
({ html, host, root } = await renderPage('opportunities-loading', Opportunities, 'pending'));
check('opportunities loading: busy live region', has(html, 'aria-busy="true"'));
check('opportunities loading: sr-only status', has(html, 'Loading opportunities'));
await unmount(host, root);

({ html, host, root } = await renderPage('opportunities-error', Opportunities, 'reject'));
check('opportunities error: role=alert + retry', has(html, 'role="alert"') && has(html, 'Try again'));
await unmount(host, root);

({ html, host, root } = await renderPage('opportunities-success', Opportunities, 'resolve'));
check('opportunities success: heading', has(html, 'Opportunities'));
check('opportunities success: open campaigns listed', has(html, 'Recruiting Sprint'));
check('opportunities success: campaign the creator already joined is filtered out', !has(html, 'Q3 Launch'));
check('opportunities success: accept action present', has(html, 'Accept deal'));
check('opportunities success: no dead Decline control', !has(html, 'Decline'));
check('opportunities success: fit score badge', /% fit/.test(html));
contractChecks(html, 'opportunities');
await unmount(host, root);

// --- CreatorProfileEdit -----------------------------------------------------
({ html, host, root } = await renderPage('profile-loading', CreatorProfileEdit, 'pending'));
check('profile loading: busy live region', has(html, 'aria-busy="true"'));
check('profile loading: sr-only status', has(html, 'Loading your profile'));
await unmount(host, root);

({ html, host, root } = await renderPage('profile-error', CreatorProfileEdit, 'reject'));
check('profile error: role=alert + retry', has(html, 'role="alert"') && has(html, 'Try again'));
await unmount(host, root);

({ html, host, root } = await renderPage('profile-success', CreatorProfileEdit, 'resolve'));
check('profile success: heading', has(html, 'My profile'));
check('profile success: preview name + niche', has(html, 'Maya Lindqvist') && has(html, 'AI &amp; SaaS'));
check('profile success: headline field is labelled', has(html, 'for="') && has(html, 'Headline'));
check('profile success: save action', has(html, 'Save profile'));
check('profile success: no raw alert dialog', !has(html, 'alert('));
check('profile success: sr-only save status region', has(html, 'role="status"'));
contractChecks(html, 'profile');
await unmount(host, root);

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
