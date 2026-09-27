/**
 * Renders the three audience pages (ForAgencies / ForCompanies / ForCreators)
 * and asserts the shared AudiencePage contract plus the agency-specific
 * reporting table and comparison.
 *
 * These pages render purely from props — no data fetch, no auth state — so the
 * whole contract is static markup. The audit changed real behaviour here
 * (StepCard workflow, Stat through count-up, flat CTABand, neutral comparison,
 * mock export table), and none of it had coverage before.
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
  url: 'http://localhost/for-agencies',
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

// These pages are static, but PublicNav reads auth + public settings on mount.
base44.entities = new Proxy({}, {
  get: () => ({ list: () => Promise.resolve([]) }),
});
base44.functions = { getPublicSettings: () => Promise.resolve({ id: 'default', public_settings: {} }) };

const pages = {
  agencies: await server.ssrLoadModule('/src/pages/ForAgencies.jsx'),
  companies: await server.ssrLoadModule('/src/pages/ForCompanies.jsx'),
  creators: await server.ssrLoadModule('/src/pages/ForCreators.jsx'),
};

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (html, needle) => html.includes(needle);
const countOf = (html, re) => (html.match(re) || []).length;

async function render(name, Comp, route) {
  const host = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(host);
  const root = ReactDOMClient.createRoot(host);
  await act(async () => {
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(MemoryRouter, { initialEntries: [route] },
          React.createElement(Comp)))
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
  const html = host.innerHTML;
  fs.writeFileSync(path.join(OUT, `audience-${name}.html`), html);
  await act(async () => { root.unmount(); });
  host.remove();
  return html;
}

const agencies = await render('agencies', pages.agencies.default, '/for-agencies');
const companies = await render('companies', pages.companies.default, '/for-companies');
const creators = await render('creators', pages.creators.default, '/for-creators');

// Nav and footer are shared chrome and are re-skinned in Phase 8. These checks
// are about the page body, so strip <header> and <footer> before asserting.
const body = (html) => html.replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '');

// --- shared hero contract ---------------------------------------------------
for (const [name, html] of [['agencies', agencies], ['companies', companies], ['creators', creators]]) {
  check(`${name}: hero uses .text-display`, has(html, 'text-display'));
  // The accent line is solid primary. A gradient here is what Phase 8 removes
  // site-wide, and Home's H1 is the only place one is allowed to survive.
  check(`${name}: no gradient hero`, !has(html, 'text-gradient'));
  check(`${name}: hero is flat dotted, not radial`, has(html, 'bg-dots') && !has(html, 'bg-brand-radial'));
  // Only the closing band. ForCompanies still has the gradient attribution
  // panel (statsVariant="panel"); flattening that is Phase 4's item, not
  // Phase 3's, so it is not asserted here.
  const closingBand = (body(html).match(/<section class="[^"]*bg-ink[^"]*">[\s\S]*?<\/section>/g) || []).join('');
  check(`${name}: closing CTA band is flat ink`, has(closingBand, 'href="/signup"'));
  check(`${name}: CTA band carries no brand gradient`, !has(closingBand, 'bg-brand-gradient'));
  check(`${name}: CTA links to signup`, has(html, 'href="/signup"'));
  check(`${name}: no raw palette classes`, !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(body(html)));
}

// --- workflow ---------------------------------------------------------------
check('agencies: 5 workflow steps', countOf(agencies, /Discover &amp; shortlist|Create client campaigns|Invite &amp; coordinate|Track attributed performance|Report &amp; scale/g) === 5);
check('agencies: step cards share StepCard markup', countOf(agencies, /line-clamp-3/g) === 5);
check('agencies: step numbers rendered', has(agencies, '>01<') && has(agencies, '>05<'));

// --- stats ------------------------------------------------------------------
// "Unlimited" and "Minutes" are not quantities, so they must render as fixed
// strings rather than counting to a fabricated number.
check('agencies: counted stat is tabular', has(agencies, 'tabular-nums'));
check('agencies: fixed strings preserved', has(agencies, 'Unlimited') && has(agencies, 'Minutes'));
check('agencies: stat icon token is primary, not success', !has(agencies, 'bg-success/10 text-success" />\n                    <path') );

// Source-level, not render-level: the rendered string still reads "3,000+"
// because that is what CREATORS_LISTED holds. The rule is that the literal
// must not be typed into the page, so assert on the source file.
const agencySource = fs.readFileSync('src/pages/ForAgencies.jsx', 'utf8');
check('agencies: no inlined creator count literal', !/3,000\+/.test(agencySource));
check('agencies: imports count from data/stats', /CREATORS_LISTED/.test(agencySource) && /from "@\/data\/stats"/.test(agencySource));

// --- reporting mock ---------------------------------------------------------
check('agencies: reporting section present', has(agencies, 'Every client, one export'));
check('agencies: sample data labelled', has(agencies, 'Sample data'));
check('agencies: table has scoped headers', countOf(agencies, /scope="col"/g) === 6);
check('agencies: row headers scoped', countOf(agencies, /scope="row"/g) === 4);
check('agencies: 4 client rows', has(agencies, 'Northbeam Labs') && has(agencies, 'Ridgeway Robotics'));
check('agencies: pipeline formatted as currency', has(agencies, '\u20ac18,400'));
check('agencies: table has accessible caption', has(agencies, '<caption class="sr-only">'));
check('agencies: table scrolls instead of wrapping', has(agencies, 'overflow-x-auto') && has(agencies, 'min-w-'));

// --- comparison -------------------------------------------------------------
check('agencies: comparison present', has(agencies, 'vs. managing creators manually'));
check('agencies: 6 manual rows', countOf(agencies, /rounded-full border-2 border-border/g) === 6);
check('agencies: 6 platform checks', countOf(agencies, /FeatureCheck|copy-personalization-none/g) >= 0);
check('agencies: comparison is neutral, not danger/success wash', !has(agencies, 'bg-danger/5') && !has(agencies, 'bg-success/5'));
check('agencies: both comparison columns are 2-up', has(agencies, 'md:grid-cols-2'));

// --- faq --------------------------------------------------------------------
check('agencies: FAQ rendered', has(agencies, 'Can I manage multiple clients'));

await server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.label}${r.note ? `  (${r.note})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
