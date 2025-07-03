import { openDB, DBSchema, IDBPDatabase } from "idb";

// Define the database schema
interface AppDB extends DBSchema {
  "app-store": {
    key: string;
    value: any;
  };
}

// Database name and version
const DB_NAME = "timelapse-app-db";
const DB_VERSION = 1;
const STORE_NAME = "app-store";

// Initialize the database
let dbPromise: Promise<IDBPDatabase<AppDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

// Storage interface that Zustand expects
export const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await initDB();
      const value = await db.get(STORE_NAME, name);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.error("Error reading from IndexedDB:", error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await initDB();
      await db.put(STORE_NAME, JSON.parse(value), name);
    } catch (error) {
      console.error("Error writing to IndexedDB:", error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await initDB();
      await db.delete(STORE_NAME, name);
    } catch (error) {
      console.error("Error removing from IndexedDB:", error);
    }
  },
};

// Utility functions for manual IndexedDB operations
export const clearAllData = async (): Promise<void> => {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
  }
};

export const getAllKeys = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    return await db.getAllKeys(STORE_NAME);
  } catch (error) {
    console.error("Error getting all keys from IndexedDB:", error);
    return [];
  }
};
