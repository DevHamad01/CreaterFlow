/**
 * Reproduces the reported error by loading base44Client with NO env, which is
 * what a dev server started before .env.local existed would do, then calling
 * signInWithPopup on whatever `auth` turned out to be.
 *
 * Run: node .agent-logs/repro-google-auth.mjs
 */
import { createServer } from 'vite';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  // Force the unconfigured branch, i.e. a dev server that never saw .env.local.
  envFile: false,
  define: {},
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const mod = await server.ssrLoadModule('/src/api/base44Client.js');
console.log('isFirebaseConfigured :', mod.isFirebaseConfigured);
console.log('typeof auth          :', typeof mod.auth);
console.log('auth.settings        :', mod.auth?.settings);

console.log('\n--- OLD path: Firebase helpers called with the stub `auth` directly ---');
try {
  await signInWithEmailAndPassword(mod.auth, 'a@b.co', 'password123');
  console.log('  resolved (unexpected)');
} catch (err) {
  console.log(`  ${err.name}: ${err.message}`);
  console.log(`  cryptic "reading 'settings'" error: ${/reading 'settings'/.test(err.message)}`);
}

console.log('\n--- NEW path: authActions, which guards the config first ---');
for (const [label, call] of [
  ['signInWithEmail', () => mod.authActions.signInWithEmail('a@b.co', 'password123')],
  ['signInWithGoogle', () => mod.authActions.signInWithGoogle()],
  ['createAccount', () => mod.authActions.createAccount('a@b.co', 'password123')],
]) {
  try {
    await call();
    console.log(`  ${label}: resolved (unexpected)`);
  } catch (err) {
    const actionable = err.message === mod.NOT_CONFIGURED_ERROR;
    console.log(`  ${label}: ${err.name} -> ${actionable ? 'actionable NOT_CONFIGURED_ERROR' : err.message.slice(0, 80)}`);
  }
}

await server.close();
