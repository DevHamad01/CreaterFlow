/**
 * Environment preflight.
 *
 *   npm run doctor
 *
 * Checks the things that otherwise fail at runtime with unhelpful errors:
 * missing env vars, a Firestore API that was never enabled, an Auth provider
 * that was never switched on, and a Gemini model that this project cannot
 * reach. Prints a copy-pasteable fix for each failure.
 *
 * Read-only. Sends no user data and prints no secrets.
 */
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolved from this file rather than hardcoded, so the script works from any
// clone location. It used to point at one absolute path, which meant
// `npm run doctor` silently read the wrong (or no) .env.local anywhere else.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnv('development', ROOT, 'VITE_');

const results = [];
let failures = 0;
let warnings = 0;

const pass = (label, detail = '') => results.push(['PASS', label, detail]);
const warn = (label, detail, fix) => {
  warnings++;
  results.push(['WARN', label, detail, fix]);
};
const fail = (label, detail, fix) => {
  failures++;
  // Was pushing 'WARN' here, so every blocking item printed with the advisory
  // label while still counting as a failure and still exiting 1.
  results.push(['FAIL', label, detail, fix]);
};
const info = (label, detail) => results.push(['INFO', label, detail]);

const mask = (v) => (v ? `${String(v).slice(0, 6)}…${String(v).slice(-4)}` : '(unset)');

const json = async (url, init) => {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  return { status: res.status, body };
};

const consoleUrl = (path = '') =>
  `https://console.firebase.google.com/project/${env.VITE_FIREBASE_PROJECT_ID || '<project>'}/${String(path).replace(/^\//, '')}`;

// ── 1. env vars ─────────────────────────────────────────────────────────────
const REQUIRED_FB = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
const missingFb = REQUIRED_FB.filter((k) => !env[k]);
if (missingFb.length) {
  fail(
    'Firebase config incomplete',
    `missing ${missingFb.join(', ')}`,
    'Copy .env.local.example to .env.local and fill in the Firebase web app config from Firebase console > Project settings > Your apps.'
  );
} else {
  pass('Firebase config', `project ${env.VITE_FIREBASE_PROJECT_ID}, key ${mask(env.VITE_FIREBASE_API_KEY)}`);
}

// ── 2. Firestore ────────────────────────────────────────────────────────────
if (!missingFb.length) {
  const { status, body } = await json(
    `https://firestore.googleapis.com/v1/projects/${env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/creators?pageSize=1&key=${env.VITE_FIREBASE_API_KEY}`
  );
  if (status === 200) {
    pass('Firestore reachable', 'unauthenticated read allowed (check your Security Rules are not wide open)');
  } else if (/has not been used|is disabled|is not enabled/i.test(body?.error?.message || '')) {
    fail(
      'Firestore API is DISABLED',
      body.error.message,
      `Enable it: ${consoleUrl('')}` + '\n           or: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=' + env.VITE_FIREBASE_PROJECT_ID
    );
  } else if (status === 403) {
    warn(
      'Firestore denied an unauthenticated read',
      'API is enabled; rules are blocking anonymous access (expected if you require sign-in)',
      'Write your Security Rules in Firebase console > Firestore Database > Rules, then seed data.'
    );
  } else {
    warn('Firestore probe inconclusive', `HTTP ${status}`, 'Check API status and Security Rules in the Firebase console.');
  }
}

// ── 3. Auth providers ───────────────────────────────────────────────────────
// Probing signUp/signIn is the only public way to learn whether a provider is
// enabled. Neither call creates an account or touches real data when it is
// turned off; a rejected probe is a no-op.
if (!missingFb.length) {
  const key = env.VITE_FIREBASE_API_KEY;
  const endpoint = (path, payload) =>
    json(`https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

  const probe = await endpoint('signInWithPassword', {
    email: 'doctor-probe@invalid.example',
    password: 'not-a-real-password',
    returnSecureToken: true,
  });
  const providerMessage = probe.body?.error?.message || '';

  if (/API has not been used|is not enabled|not found/i.test(providerMessage)) {
    fail('Firebase Auth API is disabled', providerMessage, `Enable Identity Platform: ${consoleUrl('/authentication/providers')}`);
  } else if (/PASSWORD_LOGIN_DISABLED/i.test(providerMessage)) {
    fail(
      'Email/Password sign-in is DISABLED',
      providerMessage,
      `Enable it: ${consoleUrl('/authentication/providers')} > Sign-in method > Email/Password > enable.`
    );
  } else if (/API_KEY_INVALID|API key not valid/i.test(providerMessage)) {
    fail('Firebase API key rejected', providerMessage, 'Re-copy the web config from Project settings > Your apps.');
  } else if (probe.status === 200 || /EMAIL_NOT_FOUND|INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD/i.test(providerMessage)) {
    pass('Email/Password sign-in enabled', 'probe rejected on credentials, which is the expected result');
  } else {
    warn('Auth provider probe inconclusive', `HTTP ${probe.status} ${providerMessage.slice(0, 80)}`, `Verify providers manually: ${consoleUrl('/authentication/providers')}`);
  }

  // Google provider state is not exposed by a safe public probe, so it is
  // reported as a manual step rather than guessed at.
  info(
    'Google sign-in cannot be auto-checked',
    'Enable the Google provider and add your authorised domain in the Firebase console.'
  );
}

// ── 4. Gemini ───────────────────────────────────────────────────────────────
if (!env.VITE_GEMINI_API_KEY) {
  fail('Gemini key missing', 'VITE_GEMINI_API_KEY is not set', 'Add it to .env.local, then restart the dev server.');
} else {
  const key = env.VITE_GEMINI_API_KEY;
  const model = env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';

  const { status, body } = await json(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200`, {
    headers: { 'x-goog-api-key': key },
  });

  if (status !== 200) {
    fail('Gemini key rejected', body?.error?.message || `HTTP ${status}`, 'Re-check VITE_GEMINI_API_KEY in .env.local.');
  } else {
    const usable = (body.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name.replace('models/', ''));
    pass('Gemini key valid', `${usable.length} models available`);

    if (usable.includes(model)) {
      pass('Configured model available', model);
    } else {
      fail(
        `Configured model "${model}" is NOT available to this project`,
        'Gemini returns 404 for it',
        `Set VITE_GEMINI_MODEL in .env.local to one of:\n           ${usable.filter((m) => m.startsWith('gemini')).slice(0, 8).join('\n           ')}`
      );
    }

    // The old code shipped gemini-pro, which is retired. Flag it explicitly
    // because it is the single most likely stale value.
    if (model === 'gemini-pro') {
      fail('VITE_GEMINI_MODEL is gemini-pro', 'that model was retired and returns 404', 'Use gemini-3.8-flash.');
    }
  }
}

// ── 5. key exposure ─────────────────────────────────────────────────────────
// A VITE_ key ships in the bundle. Worth stating out loud every run, because
// the local app behaves identically whether or not the key is restricted.
warn(
  'Gemini key ships in the client bundle',
  'anything prefixed VITE_ is inlined by Vite and readable in devtools',
  'Restrict it: Google Cloud console > APIs & Services > Credentials > your key > Websites (add your domain) + API restrictions (Generative Language API).\n           For a truly secret key, proxy Gemini through a server function instead.'
);

// ── report ──────────────────────────────────────────────────────────────────
// FAIL has to be listed here. It was missing, so every blocking item printed as
// `[undefined]` and looked advisory next to the real WARN entries.
const ICON = { PASS: 'PASS', FAIL: 'FAIL', WARN: 'WARN', INFO: 'INFO' };
for (const [level, label, detail, fix] of results) {
  console.log(`\n[${ICON[level]}] ${label}`);
  if (detail) console.log(`       ${detail}`);
  if (fix) console.log(`       fix: ${fix}`);
}
console.log(`\n${'-'.repeat(60)}`);
console.log(`${results.filter((r) => r[0] === 'PASS').length} passed, ${failures} blocking, ${warnings} advisory.`);
console.log(failures ? '\nBlocking items must be fixed before the app works end to end.' : '\nNo blocking items found.');
process.exit(failures ? 1 : 0);
