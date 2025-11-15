import { Anecdote } from '../types';

const DB_NAME = 'KnowledgeJournalDB';
const DB_VERSION = 1;
const STORE_NAME = 'anecdotes';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getAllAnecdotes = (): Promise<Anecdote[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject("DB not initialized");
    }
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject('Error fetching anecdotes');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };
  });
};

export const saveAnecdote = (anecdote: Anecdote): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject("DB not initialized");
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(anecdote);

    request.onerror = () => {
      reject('Error saving anecdote');
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

export const saveAnecdotesBatch = (anecdotes: Anecdote[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject("DB not initialized");
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject('Error saving anecdotes batch');
    };

    anecdotes.forEach(anecdote => {
      store.put(anecdote);
    });
  });
};
