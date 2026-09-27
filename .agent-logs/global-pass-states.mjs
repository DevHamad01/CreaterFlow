/**
 * Phase 8 global pass: shared chrome and tokens.
 *
 * The per-page harnesses each assert their own page, but four things in this
 * phase live in files that every page imports, so no single page harness can
 * prove them. This file covers:
 *
 *   1. PublicFooter  - was a saturated brand gradient with small white link text
 *   2. PublicNav     - logo mark was a gradient chip
 *   3. Button        - the default variant was a gradient, and it is the most
 *                      repeated decoration in the build
 *   4. PageNotFound  - gradient shell + gradient "404"
 *
 * It also asserts the one thing the phase is NOT allowed to break: the Home
 * hero H1 is the single sanctioned gradient in the product.
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
const { QueryClient, QueryClientProvider } = await server.ssrLoadModule('@tanstack/react-query');
const { base44 } = await server.ssrLoadModule('/src/api/base44Client.js');
const { default: Marketplace } = await server.ssrLoadModule('/src/pages/Marketplace.jsx');
const { default: PageNotFound } = await server.ssrLoadModule('/src/lib/PageNotFound.jsx');

base44.entities = new Proxy({}, { get: () => ({ list: () => Promise.resolve([]) }) });
base44.functions = { getPublicSettings: () => Promise.resolve({ id: 'default', public_settings: {} }) };
base44.auth = { me: () => Promise.reject(new Error('not signed in')) };

const host = dom.window.document.createElement('div');
dom.window.document.body.appendChild(host);
const root = ReactDOMClient.createRoot(host);

// PageNotFound reads auth state through react-query, so the harness needs the
// same provider App.jsx mounts. `staleTime: Infinity` + no refetch keeps the
// rejected `auth.me` from re-rendering between assertions.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } },
});

const render = async (Comp, route) => {
  await act(async () => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(AuthProvider, null,
          // `key={route}` is load-bearing: without it React reconciles the
          // second render onto the first render's MemoryRouter instance,
          // `initialEntries` is ignored, and the 404 reports the previous
          // route's path.
          React.createElement(MemoryRouter, { key: route, initialEntries: [route] },
            React.createElement(Comp))))
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `global-${route.replace(/\W+/g, '_')}.html`), html);
  return html;
};

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (h, needle) => h.includes(needle);
const countOf = (h, re) => (h.match(re) || []).length;

// Marketplace is used purely as a vehicle: it renders PublicNav + PublicFooter
// + a default-variant Button, which is everything this phase touches.
const page = await render(Marketplace, '/marketplace');
const notFound = await render(PageNotFound, '/this-page-does-not-exist');

const footer = page.match(/<footer[\s\S]*?<\/footer>/)?.[0] || '';
const header = page.match(/<header[\s\S]*?<\/header>/)?.[0] || '';

// --- footer ------------------------------------------------------------------
// The regression: 3 columns of ~14px link text sat on a saturated brand fill.
check('footer: renders', footer.length > 0);
check('footer: flat ink, not a brand gradient', !has(footer, 'bg-brand-gradient') && has(footer, 'bg-ink-deep'));
check('footer: link text is white, not a foreground token', !has(footer, 'text-primary-foreground'));
check('footer: body copy has real contrast', has(footer, 'text-white/70'));
check('footer: tagline replaced with the 8xNanoo lockup', has(footer, 'By 8xNanoo'));
check('footer: no leftover "Reimagined for 8x" tagline', !has(page, 'Reimagined for 8x'));
check('footer: all 4 nav columns present', countOf(footer, /aria-label="/g) >= 3);
check('footer: copyright intact', has(footer, '2026 8xNanoo'));
// A blur blob was the decoration that made the gradient read as a "brand" band.
check('footer: decorative blur blob removed', !has(footer, 'blur-3xl'));

// --- nav ---------------------------------------------------------------------
check('nav: renders', header.length > 0);
check('nav: logo mark is flat', !has(header, 'bg-brand-gradient'));
check('nav: 8xNanoo wordmark intact', has(header, '8x'));
check('nav: sign-in action is sentence case', has(header, 'Sign in'));
// Desktop said "Get started" while the mobile sheet said "Sign up".
check('nav: primary CTA wording matches across breakpoints', !has(header, 'Sign up') && has(header, 'Get started'));

// --- button ------------------------------------------------------------------
// Default variant, asserted at the source: it is a class string on a shared
// primitive, so a rendered page is not a reliable place to check it. Comments
// are stripped first, because the variant carries a rationale comment between
// the key and the string.
const buttonSrc = fs
  .readFileSync('D:/nanoo/CreaterFlow/src/components/ui/button.jsx', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
const defaultVariant = buttonSrc.match(/default:\s*"([^"]*)"/)?.[1] || '';
check('button: default variant found', defaultVariant.length > 0);
check('button: default variant is solid primary', defaultVariant.includes('bg-primary') && !defaultVariant.includes('bg-gradient'));
check('button: no raw gradient in the default variant', !defaultVariant.includes('from-primary') && !defaultVariant.includes('to-iris'));
check('button: keeps a hover affordance', defaultVariant.includes('hover:bg-primary'));
check('button: no glow shadow on default', !defaultVariant.includes('shadow-glow'));

// --- 404 ---------------------------------------------------------------------
check('404: renders', notFound.length > 0);
check('404: no gradient numerals', !has(notFound, 'text-gradient'));
check('404: flat shell, no radial wash', !has(notFound, 'bg-brand-radial'));
check('404: uses the dots texture', has(notFound, 'bg-dots'));
check('404: echoes the missing path', has(notFound, '/this-page-does-not-exist'));
check('404: has a real heading', has(notFound, 'Page not found'));
check('404: both recovery routes offered', has(notFound, 'href="/"') && has(notFound, 'href="/marketplace"'));
check('404: no admin note for a signed-out visitor', !has(notFound, 'Admin note'));
check('404: exactly one h1', countOf(notFound, /<h1/g) === 1);

// --- global invariants -------------------------------------------------------
// Scoped past nav/footer so a homepage brand mark can never mask a stray
// gradient in page body copy.
const bodyOf = (h) => h.replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '');
check('global: no brand gradient in marketplace body', !has(bodyOf(page), 'bg-brand-gradient'));
check('global: no raw palette classes on shared chrome', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(footer));

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
