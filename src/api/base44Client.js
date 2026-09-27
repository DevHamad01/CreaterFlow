import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured as checkConfig } from '@/config/firebase';

export const NOT_CONFIGURED_ERROR =
  'Firebase is not configured. The committed values in src/config/firebase.js are empty — set the VITE_FIREBASE_* values in .env.local, then run `npm run doctor`.';

export const isFirebaseConfigured = checkConfig(firebaseConfig);

// Without a usable config getAuth() throws at import time, which takes the whole
// module graph (and the app) down. Fall back to a signed-out stub so the UI
// still renders; reads return empty and writes fail with the error above.
//
// The stub is NOT a Firebase Auth object. Passing it to Firebase's own
// helpers reads `auth.app.settings` off undefined and throws
// `TypeError: Cannot read properties of undefined (reading 'settings')`, which
// names none of the real cause. That is why every Firebase entry point in this
// file lives on `authActions` instead of being called with the `auth` export.
function createUnconfiguredAuth() {
  return {
    currentUser: null,
    onAuthStateChanged(callback) {
      callback(null);
      return () => {};
    },
    signOut: async () => {},
    async sendPasswordResetEmail() {
      throw new Error(NOT_CONFIGURED_ERROR);
    },
    async confirmPasswordReset() {
      throw new Error(NOT_CONFIGURED_ERROR);
    },
    async updateProfile() {
      throw new Error(NOT_CONFIGURED_ERROR);
    },
  };
}

let app = null;
export let auth = null;
export let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  auth = createUnconfiguredAuth();
  console.warn(`[base44Client] ${NOT_CONFIGURED_ERROR} Running signed-out with empty data.`);
}

// Base44-style collection naming: "CampaignCreator" -> "campaign_creators"
function toCollectionName(entityName) {
  const snake = entityName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase();
  if (/(s|x|z|ch|sh)$/.test(snake)) return `${snake}es`;
  if (/[^aeiou]y$/.test(snake)) return `${snake.slice(0, -1)}ies`;
  return `${snake}s`;
}

const UNMATCHABLE = '__base44_no_match__';
const MAX_UNFILTERED_FETCH = 500;

function stripUndefined(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function toRecord(id, data) {
  return { id, ...data };
}

function buildWhereConstraints(filters = {}) {
  const constraints = [];
  for (const [field, raw] of Object.entries(filters || {})) {
    if (raw === undefined || raw === null) continue;

    if (Array.isArray(raw)) {
      constraints.push(where(field, 'in', raw.length ? raw : [UNMATCHABLE]));
      continue;
    }

    if (typeof raw === 'object') {
      if ('$in' in raw) {
        const values = raw.$in || [];
        constraints.push(where(field, 'in', values.length ? values : [UNMATCHABLE]));
        continue;
      }
      if ('$ne' in raw) {
        constraints.push(where(field, '!=', raw.$ne));
        continue;
      }
      if ('$gt' in raw) {
        constraints.push(where(field, '>', raw.$gt));
        continue;
      }
      if ('$gte' in raw) {
        constraints.push(where(field, '>=', raw.$gte));
        continue;
      }
      if ('$lt' in raw) {
        constraints.push(where(field, '<', raw.$lt));
        continue;
      }
      if ('$lte' in raw) {
        constraints.push(where(field, '<=', raw.$lte));
        continue;
      }
    }

    constraints.push(where(field, '==', raw));
  }
  return constraints;
}

// Base44 sort spec: "-created_date" (desc) or "campaign_name" (asc).
// Sorting happens in memory so records with missing fields are not dropped by
// Firestore orderBy, and so mixed/nested paths keep working.
function applySortAndLimit(records, sortSpec, limitCount) {
  let result = records;

  if (sortSpec) {
    const desc = String(sortSpec).startsWith('-');
    const field = desc ? String(sortSpec).slice(1) : String(sortSpec);
    result = [...result].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const cmp = av > bv ? 1 : -1;
      return desc ? -cmp : cmp;
    });
  }

  if (limitCount) result = result.slice(0, limitCount);
  return result;
}

async function queryRecords(entityName, filters, sortSpec, limitCount) {
  if (!db) return [];

  const ref = collection(db, toCollectionName(entityName));
  const constraints = buildWhereConstraints(filters);
  const snapshot = await getDocs(query(ref, ...constraints));

  let records = snapshot.docs.map((d) => toRecord(d.id, d.data()));
  const hasLimit = Boolean(limitCount);
  if (!constraints.length && !hasLimit && records.length > MAX_UNFILTERED_FETCH) {
    records = records.slice(0, MAX_UNFILTERED_FETCH);
  }
  return applySortAndLimit(records, sortSpec, limitCount);
}

function currentUserId() {
  return auth.currentUser?.uid || null;
}

function buildEntityApi(entityName) {
  return {
    // list("-created_date", 30)
    async list(sortSpec, limitCount) {
      return queryRecords(entityName, {}, sortSpec, limitCount);
    },

    // filter({ campaign_id: ["a", "b"] }, "-created_date", 20)
    async filter(filters, sortSpec, limitCount) {
      return queryRecords(entityName, filters, sortSpec, limitCount);
    },

    // get("abc123")
    async get(id) {
      if (!db) return null;
      const snapshot = await getDoc(doc(db, toCollectionName(entityName), id));
      return snapshot.exists() ? toRecord(snapshot.id, snapshot.data()) : null;
    },

    // create({ name: "..." })
    async create(data) {
      if (!db) throw new Error(NOT_CONFIGURED_ERROR);

      const now = new Date().toISOString();
      const uid = currentUserId();
      const payload = stripUndefined({
        ...data,
        created_date: data.created_date || now,
        updated_date: now,
        created_by: data.created_by ?? uid,
        created_by_id: data.created_by_id ?? uid,
      });
      delete payload.id;

      const ref = await addDoc(collection(db, toCollectionName(entityName)), payload);
      return toRecord(ref.id, payload);
    },

    // update("abc123", { status: "active" })
    async update(id, data) {
      if (!db) throw new Error(NOT_CONFIGURED_ERROR);

      const payload = stripUndefined({
        ...data,
        updated_date: new Date().toISOString(),
      });
      delete payload.id;
      await updateDoc(doc(db, toCollectionName(entityName), id), payload);
      return toRecord(id, payload);
    },

    // delete("abc123")
    async delete(id) {
      if (!db) throw new Error(NOT_CONFIGURED_ERROR);
      await deleteDoc(doc(db, toCollectionName(entityName), id));
      return true;
    },

    // updateMany({ id: { $in: [...] } }, { $set: { read: true } })
    async updateMany(whereFilter, changes) {
      if (!db) throw new Error(NOT_CONFIGURED_ERROR);

      const ids = Array.isArray(whereFilter)
        ? whereFilter
        : whereFilter?.id?.$in || [];
      if (!ids.length) return 0;

      const data = stripUndefined(
        changes && typeof changes === 'object' && '$set' in changes ? changes.$set : changes
      );
      data.updated_date = new Date().toISOString();
      delete data.id;

      const collectionName = toCollectionName(entityName);
      const batch = writeBatch(db);
      ids.forEach((id) => batch.update(doc(db, collectionName, id), data));
      await batch.commit();
      return ids.length;
    },
  };
}

/** @type {Record<string, any>} */
const entities = new Proxy(
  {},
  {
    get(_target, entityName) {
      if (typeof entityName !== 'string') return undefined;
      return buildEntityApi(entityName);
    },
  }
);

async function getOrCreateUserProfile(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return toRecord(snapshot.id, snapshot.data());
  }

  const profile = stripUndefined({
    id: firebaseUser.uid,
    email: firebaseUser.email,
    full_name:
      firebaseUser.displayName ||
      firebaseUser.email?.split('@')[0] ||
      'User',
    role: 'user',
    created_date: new Date().toISOString(),
  });
  await setDoc(ref, profile, { merge: true });
  return profile;
}

function requireConfigured() {
  if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_ERROR);
  if (!auth) throw new Error(NOT_CONFIGURED_ERROR);
}

/**
 * Sign-in helpers for the auth pages.
 *
 * These pages previously imported Firebase's helpers directly and passed the
 * `auth` export. When the app is unconfigured, `auth` is the signed-out stub,
 * and handing that stub to Firebase reaches into its internals and fails with
 * "Cannot read properties of undefined (reading 'settings')" — an error that
 * says nothing about the actual cause. Every entry point therefore checks the
 * config first, so the failure is the actionable NOT_CONFIGURED_ERROR.
 *
 * The `observeAuth` and `signOut` pair exists for the same reason and is the
 * single most important entry point here: AuthContext subscribes on every page
 * mount, so handing it the stub threw the "settings" TypeError on every route
 * and took the whole app down before a single auth request went out.
 */
export const authActions = {
  /**
   * Subscribe to auth state. Never throws for an unconfigured app: it reports
   * `null` (signed out) and hands back a no-op unsubscribe, so the provider
   * still settles instead of rejecting.
   *
   * @param {(user: import('firebase/auth').User | null) => void} callback
   * @returns {() => void} unsubscribe
   */
  observeAuth(callback) {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  async signOut() {
    requireConfigured();
    return signOut(auth);
  },

  async signInWithEmail(email, password) {
    requireConfigured();
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signInWithGoogle() {
    requireConfigured();
    return signInWithPopup(auth, new GoogleAuthProvider());
  },

  async createAccount(email, password) {
    requireConfigured();
    return createUserWithEmailAndPassword(auth, email, password);
  },
};

export const base44 = {
  entities,
  auth: {
    async me() {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      return getOrCreateUserProfile(firebaseUser);
    },
    isAuthenticated() {
      return Boolean(auth.currentUser);
    },
    async updateMe(data) {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');
      if (!db) throw new Error(NOT_CONFIGURED_ERROR);

      const profileChanges = stripUndefined(data);
      if (profileChanges.full_name) {
        await updateProfile(firebaseUser, { displayName: profileChanges.full_name });
      }
      await setDoc(doc(db, 'users', firebaseUser.uid), profileChanges, { merge: true });
      return toRecord(firebaseUser.uid, profileChanges);
    },
    async resetPasswordRequest(email) {
      requireConfigured();
      await sendPasswordResetEmail(auth, email);
      return true;
    },
    async resetPassword({ resetToken, newPassword }) {
      requireConfigured();
      if (!resetToken) throw new Error('Missing password reset token');
      await confirmPasswordReset(auth, resetToken, newPassword);
      return true;
    },
  },
};
