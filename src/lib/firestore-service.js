import { db } from "@/api/base44Client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

// Helper functions for Firestore operations
export const firestoreService = {
  // Create
  async create(collectionName, data) {
    try {
      const ref = collection(db, collectionName);
      const docRef = await addDoc(ref, {
        ...data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Read
  async get(collectionName, id) {
    try {
      const ref = doc(db, collectionName, id);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      throw error;
    }
  },

  // List with filters
  async list(collectionName, filters = {}, sortBy = null, limitTo = 100) {
    try {
      let ref = collection(db, collectionName);
      let constraints = [];

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(where(key, "==", value));
        }
      });

      // Add sorting
      if (sortBy) {
        if (sortBy.startsWith("-")) {
          constraints.push(orderBy(sortBy.substring(1), "desc"));
        } else {
          constraints.push(orderBy(sortBy, "asc"));
        }
      }

      // Add limit
      if (limitTo) {
        constraints.push(limit(limitTo));
      }

      const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error listing documents from ${collectionName}:`, error);
      throw error;
    }
  },

  // Update
  async update(collectionName, id, data) {
    try {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, {
        ...data,
        updated_at: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete
  async delete(collectionName, id) {
    try {
      const ref = doc(db, collectionName, id);
      await deleteDoc(ref);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Filter (get multiple documents matching criteria)
  async filter(collectionName, filters = {}, sortBy = null, limitTo = 100) {
    return this.list(collectionName, filters, sortBy, limitTo);
  },
};
