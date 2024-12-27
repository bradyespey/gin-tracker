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

export async function saveGameLocally(game: Game) {
  const db = await initDB();
  await db.add(STORE_NAME, {
    ...game,
    syncStatus: 'pending'
  });
}

export async function updateGameLocally(id: string, updates: Partial<Game>) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  const game = await store.get(id);
  if (game) {
    await store.put({
      ...game,
      ...updates,
      syncStatus: 'pending',
      updated_at: new Date().toISOString()
    });
  }
}

export async function deleteGameLocally(id: string) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function getLocalGames(): Promise<Game[]> {
  const db = await initDB();
  const games = await db.getAll(STORE_NAME);
  return games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function syncPendingGames() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const pendingGames = await store.index('syncStatus').getAll('pending');

  for (const game of pendingGames) {
    try {
      const { error } = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game)
      });
      
      if (!error) {
        await store.put({ ...game, syncStatus: 'synced' });
      }
    } catch (error) {
      console.error('Sync failed for game:', error);
    }
  }
}