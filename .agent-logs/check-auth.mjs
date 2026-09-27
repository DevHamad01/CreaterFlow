/**
 * Diagnostic: is `auth` actually defined when a page imports it?
 *
 * Login.jsx calls signInWithPopup(auth, provider) with `auth` imported from
 * base44Client. Firebase reads auth.settings internally, so an undefined
 * export surfaces as "Cannot read properties of undefined (reading 'settings')".
 *
 * Run: node .agent-logs/check-auth.mjs
 */
import { createServer } from 'vite';

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const env = server.config.env;
console.log('VITE_ vars visible to the module graph:');
for (const k of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_GEMINI_API_KEY', 'VITE_GEMINI_MODEL']) {
  const v = env[k];
  console.log(`  ${k} = ${v ? `${String(v).slice(0, 8)}...` : '(UNDEFINED)'}`);
}

console.log('\nloading /src/api/base44Client.js ...');
try {
  const mod = await server.ssrLoadModule('/src/api/base44Client.js');
  console.log('  isFirebaseConfigured :', mod.isFirebaseConfigured);
  console.log('  typeof auth          :', typeof mod.auth);
  console.log('  auth is null         :', mod.auth === null);
  console.log('  auth is undefined    :', mod.auth === undefined);
  console.log('  auth has .settings   :', Boolean(mod.auth && mod.auth.settings));
  console.log('  typeof db            :', typeof mod.db);
} catch (err) {
  console.log('  MODULE FAILED TO LOAD:', err.message);
}

await server.close();
