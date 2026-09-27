/**
 * Renders the auth screens in a real DOM and asserts the validation, error and
 * success states, plus the returnTo sanitiser.
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
const { act, Simulate } = require('react-dom/test-utils');
const { MemoryRouter, Routes, Route } = require('react-router-dom');

const OUT = '.agent-logs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/login',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.MutationObserver = dom.window.MutationObserver;
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

const { default: Login } = await server.ssrLoadModule('/src/pages/Login.jsx');
const { default: Register } = await server.ssrLoadModule('/src/pages/Register.jsx');
const { default: ForgotPassword } = await server.ssrLoadModule('/src/pages/ForgotPassword.jsx');
const { default: ResetPassword } = await server.ssrLoadModule('/src/pages/ResetPassword.jsx');
const { safeReturnTo, returnToParam } = await server.ssrLoadModule('/src/lib/returnTo.js');
const { friendlyAuthError, isCancelledAuthError } = await server.ssrLoadModule('/src/lib/authErrors.js');

const results = [];
const check = (label, pass, note) => results.push({ label, pass: !!pass, note });
const has = (html, needle) => html.includes(needle);

function mount() {
  const host = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(host);
  return { host, root: ReactDOMClient.createRoot(host) };
}

async function render(Component, { route, entry, search = '' } = {}) {
  const { host, root } = mount();
  await act(async () => {
    root.render(
      React.createElement(
        MemoryRouter,
        { initialEntries: [entry || '/login'] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: route || '/login', element: React.createElement(Component) })
        )
      )
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 40)); });
  return { host, root, html: host.innerHTML };
}

async function type(host, root, selector, value) {
  const node = host.querySelector(selector);
  if (!node) return false;
  // jsdom does not deliver native `input` events to React's delegated listeners,
  // so drive the synthetic onChange directly.
  await act(async () => { Simulate.change(node, { target: { value } }); });
  await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  return true;
}

async function click(host, root, selector) {
  const node = host.querySelector(selector);
  if (!node) return false;
  await act(async () => { Simulate.click(node); });
  await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  return true;
}

// jsdom does not implement implicit form submission on a submit-button click,
// so the form's submit event is simulated directly.
async function submitForm(host, root) {
  const form = host.querySelector('form');
  if (!form) return false;
  await act(async () => {
    Simulate.submit(form, { preventDefault() {} });
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  return true;
}

// --- returnTo sanitiser ----------------------------------------------------
check('returnTo: missing param -> /app', safeReturnTo('', '/app') === '/app');
check('returnTo: same-origin path kept', safeReturnTo('?returnTo=%2Fapp%2Fcampaigns', '/app') === '/app/campaigns');
check('returnTo: absolute external origin blocked', safeReturnTo('?returnTo=https%3A%2F%2Fevil.com', '/app') === '/app');
check('returnTo: protocol-relative blocked', safeReturnTo('?returnTo=%2F%2Fevil.com', '/app') === '/app');
check('returnTo: backslash blocked', safeReturnTo('?returnTo=%2F%5C%5Cevil.com', '/app') === '/app');
check('returnTo: param helper round-trips', returnToParam('/app/campaigns') === '?returnTo=%2Fapp%2Fcampaigns');
check('returnTo: /app is not carried over', returnToParam('/app') === '');

// --- auth error copy ------------------------------------------------------
check('errors: invalid credentials are humanised',
  friendlyAuthError({ code: 'auth/invalid-credential' }, 'x').includes("doesn't match"));
check('errors: cancelled popup detected', isCancelledAuthError({ code: 'auth/popup-closed-by-user' }));
check('errors: network failure is humanised',
  friendlyAuthError({ code: 'auth/network-request-failed' }, 'x').includes("couldn't reach"));
check('errors: unknown error falls back',
  friendlyAuthError({ message: 'boom' }, 'fallback') === 'boom' &&
  friendlyAuthError({}, 'fallback') === 'fallback');

// --- Login -----------------------------------------------------------------
let { host, root, html } = await render(Login, { route: '/login', entry: '/login' });
fs.writeFileSync(path.join(OUT, 'auth-login.html'), html);
check('login: renders heading', has(html, 'Welcome back'));
check('login: exactly one h1', (html.match(/<h1/g) || []).length === 1);
check('login: google button present', has(html, 'Continue with Google'));
check('login: email + password inputs', has(html, 'id="email"') && has(html, 'id="password"'));
check('login: forgot-password link', has(html, 'href="/forgot-password"'));
check('login: signup link', has(html, 'href="/signup"'));
check('login: no error banner on first paint', !has(html, 'role="alert"'));
check('login: divider rendered', has(html, '>or</span>') || has(html, 'or</span>'));
check('login: inputs use house style (no h-12 override)', !has(html, 'h-12'));
check('login: labels bound via for/htmlFor', has(html, 'for="email"') && has(html, 'for="password"'));
check('login: auth autocomplete tokens', has(html, 'autocomplete="email"') && has(html, 'autocomplete="current-password"'));
await act(async () => { root.unmount(); });
host.remove();

// --- Register: account type + validation ----------------------------------
({ host, root, html } = await render(Register, { route: '/signup', entry: '/signup' }));
fs.writeFileSync(path.join(OUT, 'auth-register.html'), html);
check('register: renders heading', has(html, 'Create your account'));
check('register: company type pre-selected', has(html, 'aria-pressed="true"'));
check('register: two account types', (html.match(/aria-pressed=/g) || []).length === 2);
check('register: company name field visible for companies', has(html, 'id="company"'));
check('register: no dead OTP markup', !has(html, 'InputOTP') && !has(html, 'Verify your email'));
check('register: signup footer link to login', has(html, 'href="/login"'));
check('register: min length on password', has(html, 'minlength="6"'));

// mismatch validation
await type(host, root, '#fullname', 'Jane Doe');
await type(host, root, '#email', 'jane@acme.com');
await type(host, root, '#password', 'secret123');
await type(host, root, '#confirm', 'different');
await submitForm(host, root);
html = host.innerHTML;
check('register: password mismatch blocked', has(html, 'Passwords do not match'));
check('register: mismatch is role=alert', has(html, 'role="alert"'));

// short password validation (both fields short so the length rule is what fires)
await type(host, root, '#password', 'abc');
await type(host, root, '#confirm', 'abc');
await submitForm(host, root);
html = host.innerHTML;
check('register: short password blocked', has(html, 'at least 6 characters'));

// missing name validation
await type(host, root, '#fullname', '');
await type(host, root, '#password', 'secret123');
await type(host, root, '#confirm', 'secret123');
await submitForm(host, root);
html = host.innerHTML;
check('register: name is required', has(html, 'tell us your name'));

// creator type hides company field
await click(host, root, 'fieldset button:nth-of-type(2)');
html = host.innerHTML;
check('register: creator type hides company field', !has(html, 'id="company"'));
check('register: creator type selected', (html.match(/aria-pressed="true"/g) || []).length === 1);
await act(async () => { root.unmount(); });
host.remove();

// --- ForgotPassword --------------------------------------------------------
({ host, root, html } = await render(ForgotPassword, { route: '/forgot-password', entry: '/forgot-password' }));
fs.writeFileSync(path.join(OUT, 'auth-forgot-password.html'), html);
check('forgot: renders heading', has(html, 'Reset your password'));
check('forgot: email input', has(html, 'id="email"'));
check('forgot: back to login link', has(html, 'href="/login"'));
check('forgot: success copy hidden initially', !has(html, 'Check your inbox'));

const { base44 } = await server.ssrLoadModule('/src/api/base44Client.js');
let resetMode = 'resolve';
let resetCalls = 0;
base44.auth = {
  resetPasswordRequest: () => {
    resetCalls++;
    return resetMode === 'resolve' ? Promise.resolve({}) : Promise.reject(new Error('smtp down'));
  },
};

await type(host, root, '#email', 'jane@acme.com');
await submitForm(host, root);
html = host.innerHTML;
check('forgot: request fired once', resetCalls === 1);
check('forgot: success state shown', has(html, 'Check your inbox'));
check('forgot: success keeps email visible', has(html, 'jane@acme.com'));
check('forgot: success is role=status not alert', has(html, 'role="status"') && !has(html, 'role="alert"'));
check('forgot: can request a different email', has(html, 'Send to a different email'));

// failure path
resetMode = 'reject';
({ host, root, html } = await render(ForgotPassword, { route: '/forgot-password', entry: '/forgot-password' }));
await type(host, root, '#email', 'jane@acme.com');
await submitForm(host, root);
html = host.innerHTML;
check('forgot: failure surfaces a retryable error', has(html, 'try again in a moment'));
check('forgot: failure keeps the form usable', has(html, 'id="email"'));
check('forgot: failure does not claim success', !has(html, 'Check your inbox'));
await act(async () => { root.unmount(); });
host.remove();

// --- ResetPassword: missing token -----------------------------------------
({ host, root, html } = await render(ResetPassword, { route: '/reset-password', entry: '/reset-password' }));
fs.writeFileSync(path.join(OUT, 'auth-reset-invalid.html'), html);
check('reset: missing token -> invalid link state', has(html, 'Invalid reset link'));
check('reset: offers a new link', has(html, 'href="/forgot-password"'));
check('reset: no password form when token missing', !has(html, 'id="password"'));
await act(async () => { root.unmount(); });
host.remove();

// --- ResetPassword: with token ---------------------------------------------
let resetPasswordCalls = [];
let resetPasswordMode = 'resolve';
base44.auth = {
  resetPassword: (payload) => {
    resetPasswordCalls.push(payload);
    return resetPasswordMode === 'resolve'
      ? Promise.resolve({})
      : Promise.reject(new Error('This reset link has expired'));
  },
};

({ host, root, html } = await render(ResetPassword, {
  route: '/reset-password',
  entry: '/reset-password?token=abc123',
}));
fs.writeFileSync(path.join(OUT, 'auth-reset.html'), html);
check('reset: with token renders the form', has(html, 'id="password"') && has(html, 'id="confirm"'));
check('reset: heading', has(html, 'Choose a new password'));

await type(host, root, '#password', 'newsecret');
await type(host, root, '#confirm', 'nope123');
await submitForm(host, root);
html = host.innerHTML;
check('reset: mismatch blocked', has(html, 'Passwords do not match'));
check('reset: no API call on mismatch', resetPasswordCalls.length === 0);

await type(host, root, '#confirm', 'newsecret');
await type(host, root, '#password', 'short');
await submitForm(host, root);
html = host.innerHTML;
check('reset: short password blocked', has(html, 'at least 6 characters'));

// expired link
resetPasswordMode = 'reject';
await type(host, root, '#password', 'newsecret');
await type(host, root, '#confirm', 'newsecret');
await submitForm(host, root);
html = host.innerHTML;
check('reset: expired link explained', has(html, 'expired'));
check('reset: token forwarded to the API', resetPasswordCalls[0]?.resetToken === 'abc123');
await act(async () => { root.unmount(); });
host.remove();

// --- design system + a11y --------------------------------------------------
({ host, root, html } = await render(Register, { route: '/signup', entry: '/signup' }));
check('tokens: zero raw palette classes', !/(slate|blue|violet|emerald|amber|red|indigo|purple)-\d{2,3}/.test(html));
// The auth shell used to be a saturated brand gradient. It is now a flat dot
// field with a tinted icon chip, so this asserts the gradient is GONE.
check('tokens: auth shell has no brand gradient or radial wash',
  !has(html, 'bg-brand-gradient') && !has(html, 'bg-brand-radial'));
check('tokens: auth shell uses the dots texture', has(html, 'bg-dots'));
check('tokens: rounded house inputs', has(html, 'rounded-xl'));
const svgs = html.match(/<svg[^>]*>/g) || [];
const noHidden = svgs.filter((s) => !s.includes('aria-hidden')).length;
check(`a11y: all ${svgs.length} icons aria-hidden`, noHidden === 0, `${noHidden} without`);
check('a11y: account type is a fieldset+legend', has(html, '<fieldset') && has(html, '<legend'));
check('a11y: every input has a label', has(html, 'for="email"') && has(html, 'for="confirm"'));
check('a11y: autocomplete on all identity fields',
  has(html, 'autocomplete="email"') && has(html, 'autocomplete="new-password"') && has(html, 'autocomplete="name"'));
check('a11y: status text on loading buttons', has(html, 'aria-busy'));
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
