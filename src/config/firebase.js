// The Firebase *web app* config, committed on purpose.
//
// These six values are not secrets. Every Firebase web app in the world ships
// them to the browser; the Firebase docs say so explicitly ("these keys
// identify your Firebase project, they are not used to authenticate"). Access
// control lives in Firestore Security Rules and in the fact that the Auth
// token is issued per user, neither of which depends on hiding this file.
//
// Why they are committed instead of living only in `.env.local`:
//
//   `.env.local` is gitignored, and this app deploys by building the git
//   repository. A build on the host never sees `.env.local`, so every
//   `VITE_FIREBASE_*` came back undefined, `isFirebaseConfigured` was false,
//   and the whole site loaded the signed-out stub. The only symptom in the
//   console was a misleading
//   `TypeError: Cannot read properties of undefined (reading 'settings')`,
//   thrown by Firebase because the stub is not a real Auth object. Committing
//   the public half of the config is what makes a push-to-main build work with
//   no dashboard step.
//
// The Gemini key is a different matter and is NOT committed: it authorises
// billable quota, so it stays in the host's encrypted env vars. See README.
//
// Values from the environment win, so a developer or a host that does set
// VITE_FIREBASE_* still overrides everything here.

/** @type {import('firebase/app').FirebaseOptions} */
const COMMITTED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCV0OqPZi8XvW8SufDFp0sEyCIea0SNM64",
  authDomain: "createrflow-ce815.firebaseapp.com",
  projectId: "createrflow-ce815",
  storageBucket: "createrflow-ce815.firebasestorage.app",
  messagingSenderId: "1059176338690",
  appId: "1:1059176338690:web:1c45e626e9ed13aab49e1b",
};

const env = import.meta.env;

const envConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID,
};

const envOverrides = Object.fromEntries(
  Object.entries(envConfig).filter(([, value]) => Boolean(value))
);

/** @type {import('firebase/app').FirebaseOptions} */
export const firebaseConfig = { ...COMMITTED_FIREBASE_CONFIG, ...envOverrides };

/**
 * True when there is enough config to build a working Firebase app.
 *
 * @param {import('firebase/app').FirebaseOptions} [config]
 */
export function isFirebaseConfigured(config = firebaseConfig) {
  return Boolean(config.apiKey && config.projectId && config.appId);
}
