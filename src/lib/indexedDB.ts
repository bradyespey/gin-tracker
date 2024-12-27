import { openDB } from 'idb';
import type { Game, GameFormData } from '../types/game';

const DB_NAME = 'GinRummyDB';
const STORE_NAME = 'games';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('syncStatus', 'syncStatus');
      }
    },
  });
  return db;
}

export async function saveGameLocally(game: GameFormData) {
  const db = await initDB();
  await db.add(STORE_NAME, {
    ...game,
    id: crypto.randomUUID(),
    syncStatus: 'pending'
  });
}

export async function getLocalGames() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function syncPendingGames() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const pendingGames = await store.index('syncStatus').getAll('pending');

  for (const game of pendingGames) {
    try {
      // Attempt to sync with server
      const response = await fetch('/api/games', {
        method: 'POST',
        body: JSON.stringify(game)
      });
      
      if (response.ok) {
        // Update local status to synced
        await store.put({ ...game, syncStatus: 'synced' });
      }
    } catch (error) {
      console.error('Sync failed for game:', error);
    }
  }
}