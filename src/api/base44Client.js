import { initializeApp } from 'firebase/app';
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export const NOT_CONFIGURED_ERROR =
  'Firebase is not configured. Copy .env.local.example to .env.local and fill in the VITE_FIREBASE_* values, then run `npm run doctor`.';

// Without an API key getAuth() throws at import time, which takes the whole
// module graph (and the app) down. Fall back to a signed-out stub so the UI
// still renders; reads return empty and writes fail with the error above.
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

      const profileChanges = stripUndefined(data);
      if (profileChanges.full_name) {
        await updateProfile(firebaseUser, { displayName: profileChanges.full_name });
      }
      await setDoc(doc(db, 'users', firebaseUser.uid), profileChanges, { merge: true });
      return toRecord(firebaseUser.uid, profileChanges);
    },
    async resetPasswordRequest(email) {
      await sendPasswordResetEmail(auth, email);
      return true;
    },
    async resetPassword({ resetToken, newPassword }) {
      if (!resetToken) throw new Error('Missing password reset token');
      await confirmPasswordReset(auth, resetToken, newPassword);
      return true;
    },
  },
};
