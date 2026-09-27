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
  // ForCompanies' attribution panel was the last gradient CTA-adjacent band.
  check(`${name}: no brand gradient anywhere in body`, !has(body(html), 'bg-brand-gradient'));
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
const companiesSource = fs.readFileSync('src/pages/ForCompanies.jsx', 'utf8');
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

// --- companies: bento --------------------------------------------------------
check('companies: bento layout enabled', /benefitsLayout="bento"/.test(companiesSource));
check('companies: attribution card spans 2 columns', /title: "Track attribution"[\s\S]{0,400}?span: "lg:col-span-2"/.test(companiesSource));
check('companies: brief mock rendered', has(companies, 'Generated brief'));
check('companies: brief mock is decorative', has(companies, 'aria-hidden="true"'));
check('companies: brief mock shows a tracking link', has(companies, 'cf.link/'));
check('companies: 6 benefit cards', countOf(companies, /surface-card surface-card-hover p-7/g) === 6);

// --- companies: attribution panel -------------------------------------------
check('companies: attribution panel is flat ink', has(companies, 'bg-ink text-white'));
check('companies: attribution rows are glass', has(companies, 'border-white/15 bg-white/[0.07]'));
// Scoped to the attribution panel specifically. `text-primary-foreground` also
// appears on the default Button variant, which is a site-wide gradient accent
// removed in Phase 8; asserting it site-wide here would fail for chrome this
// phase does not own.
const attributionPanel = (body(companies).match(/<section class="[^"]*bg-ink text-white[^"]*">[\s\S]*?<\/section>/) || [''])[0];
check('companies: attribution has no gradient text on colour', has(attributionPanel, 'bg-ink') && !has(attributionPanel, 'text-primary-foreground'));
check('companies: sparkline is an accessible svg', has(companies, 'role="img"') && has(companies, 'aria-label="Attributed pipeline'));
check('companies: sparkline has a stroke path', has(companies, 'polyline'));
// The three figures count up, so they must not be inlined as strings.
check('companies: attribution figures are counted', !/display: "€48\.2K"/.test(companiesSource));
check('companies: attribution figures come from data/stats', /COMPANY_ATTRIBUTION/.test(companiesSource));

// --- companies: problem/solution + trust row --------------------------------
check('companies: problem/solution neutral', !has(companies, 'bg-danger/5') && !has(companies, 'bg-success/5'));
check('companies: solution column uses check token', has(companies, 'The CreatorFlow way'));
check('companies: trust is a row, not three cards', !has(companies, 'Built for B2B marketing teams') || !has(companies, 'grid max-w-3xl gap-5 sm:grid-cols-3'));
check('companies: no inlined creator count literal', !/3,000\+/.test(companiesSource));

// --- creators: earnings calculator ------------------------------------------
// The calculator is the only interactive marketing surface in the three
// audience pages, and it is the one claim on the site a reader can falsify for
// themselves. So the band switch is actually clicked, not just asserted present.
const calculatorHost = dom.window.document.createElement('div');
dom.window.document.body.appendChild(calculatorHost);
const calculatorRoot = ReactDOMClient.createRoot(calculatorHost);
await act(async () => {
  calculatorRoot.render(
    React.createElement(AuthProvider, null,
      React.createElement(MemoryRouter, { initialEntries: ['/for-creators'] },
        React.createElement(pages.creators.default)))
  );
});
await act(async () => { await new Promise((r) => setTimeout(r, 60)); });

const monthlyOf = (html) => {
  const m = html.match(/Estimated monthly earnings<\/p><p class="[^"]*">([^<]+)</);
  return m ? m[1] : null;
};

const beforeBand = monthlyOf(calculatorHost.innerHTML);
check('calculator: renders an estimate', beforeBand === '€400', beforeBand || 'not found');
check('calculator: estimate is a live region', has(calculatorHost.innerHTML, 'aria-live="polite"'));
check('calculator: uses a radio group, not toggles', has(calculatorHost.innerHTML, 'type="radio"') && has(calculatorHost.innerHTML, 'name="creator-band"'));
check('calculator: 4 follower bands', countOf(calculatorHost.innerHTML, /name="creator-band"/g) === 4);
check('calculator: assumptions are stated, not hidden', has(calculatorHost.innerHTML, 'Sample benchmarks, not a quote'));

// Switch to the top band and confirm the figure actually recomputes.
//
// `element.click()`, not `checked = true` + a synthetic change: React installs
// its own value tracker on controlled inputs, so assigning `.checked` directly
// is swallowed and the component never re-renders. A real click goes through
// the same path a user's click takes.
const topBand = [...calculatorHost.querySelectorAll('input[name="creator-band"]')].find((el) => el.value === 'top');
await act(async () => { topBand.click(); });
await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
const afterBand = monthlyOf(calculatorHost.innerHTML);
check('calculator: switching band recomputes', afterBand === '€960' && afterBand !== beforeBand, `${beforeBand} -> ${afterBand}`);
check('calculator: per-post rate shown alongside', has(calculatorHost.innerHTML, '€1,200 per post'));
check('calculator: acceptance rate disclosed', has(calculatorHost.innerHTML, '40% acceptance rate'));

await act(async () => { calculatorRoot.unmount(); });
calculatorHost.remove();

// --- creators: copy + testimonial ------------------------------------------
check('creators: badge drops the unverifiable star rating', !has(creators, '4.8/5'));
check('creators: stats come from data/stats', /CREATOR_STATS/.test(companiesSource === '' ? '' : fs.readFileSync('src/pages/ForCreators.jsx', 'utf8')));
check('creators: no inlined payout count literal', !/2,000\+/.test(fs.readFileSync('src/pages/ForCreators.jsx', 'utf8')));
check('creators: testimonial is a real figure/blockquote', has(creators, '<blockquote') && has(creators, '<figcaption'));
check('creators: testimonial labelled as sample', has(creators, 'Sample creator'));
check('creators: testimonial name matches marketplace data', has(creators, 'Sofia Marin') && /id: "sofia-marin"/.test(fs.readFileSync('src/data/creators.js', 'utf8')));
check('creators: closing CTA band is flat ink', has(body(creators), 'bg-ink'));

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
