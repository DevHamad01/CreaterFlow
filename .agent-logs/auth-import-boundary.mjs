/**
 * Regression check for the "Cannot read properties of undefined (reading
 * 'settings')" crash that took down every route.
 *
 * The bug: when Firebase has no config, `auth` is a signed-out stub, not a
 * Firebase Auth object. Firebase's own helpers read `auth.app.settings` off it
 * and throw a TypeError naming none of the real cause. Login and Register were
 * fixed for this, but AuthContext kept doing
 * `onAuthStateChanged(auth, ...)` on every page mount, so every route threw
 * before a sign-in request was ever sent. It looked like the button was dead.
 *
 * This asserts the invariant directly rather than trying to reproduce the stub
 * at runtime, because reproducing it means booting a second copy of the client
 * while the first one is holding Firestore retry timers open:
 *
 *   src/api/base44Client.js is the ONLY file allowed to import firebase/auth.
 *
 * Any other file doing so is handing either the real Auth or the stub straight
 * to Firebase, and the stub case is the crash above. The safe wrappers
 * (authActions.*) all live in that one file and are covered by
 * repro-google-auth.mjs; the committed config is covered by check-auth.mjs.
 *
 * Run: node .agent-logs/auth-import-boundary.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const ALLOWED = path.join(SRC, 'api', 'base44Client.js');

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '  PASS' : '  FAIL'} ${label}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(js|jsx|mjs)$/.test(entry.name) ? [full] : [];
  });

const files = walk(SRC);
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');

console.log(`scanning ${files.length} source files under src/`);

// Any file importing firebase/auth outside the one allowed module.
const offenders = files.filter((f) => {
  if (path.resolve(f) === ALLOWED) return false;
  const src = fs.readFileSync(f, 'utf8');
  return /from\s+['"]firebase\/auth['"]/.test(src);
});

check(
  'only src/api/base44Client.js imports firebase/auth',
  offenders.length === 0,
  offenders.length ? offenders.map(rel).join(', ') : `${files.length - 1} other files clean`
);

// The wrappers that make the boundary safe must exist and be used.
const client = fs.readFileSync(ALLOWED, 'utf8');
for (const fn of ['observeAuth', 'signOut', 'signInWithEmail', 'signInWithGoogle', 'createAccount']) {
  check(`authActions.${fn} is defined`, new RegExp(`\\b${fn}\\s*[(]`).test(client));
}

const authContext = fs.readFileSync(path.join(SRC, 'lib', 'AuthContext.jsx'), 'utf8');
check('AuthContext subscribes via authActions.observeAuth', /authActions\.observeAuth\(/.test(authContext));
check('AuthContext does not import firebase/auth', !/from\s+['"]firebase\/auth['"]/.test(authContext));
check('AuthContext signs out via authActions.signOut', /authActions\.signOut\(/.test(authContext));

// The committed config is what makes a git-only build work. Without it the live
// site has no Firebase config at all, which is how this crash got shipped.
const configPath = path.join(SRC, 'config', 'firebase.js');
check('src/config/firebase.js exists', fs.existsSync(configPath));
if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8');
  for (const key of [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]) {
    check(`committed config has a non-empty ${key}`, new RegExp(`${key}:\\s*"[^"]+"`).test(config));
  }
}

const clientSrc = fs.readFileSync(ALLOWED, 'utf8');
check('base44Client reads config from src/config/firebase', /from\s+['"]@\/config\/firebase['"]/.test(clientSrc));
check('base44Client no longer builds config from import.meta.env directly', !/import\.meta\.env\.VITE_FIREBASE/.test(clientSrc));

if (failures.length) {
  console.log(`\n${failures.length} check(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nall checks passed');
