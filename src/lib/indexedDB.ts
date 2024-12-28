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
        store.createIndex('game_number', 'game_number');
      }
    },
  });
  return db;
}

export async function getNextGameNumber(): Promise<number> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const games = await store.getAll();
  
  return Math.max(...games.map(g => g.game_number || 0), 0) + 1;
}

export async function saveGameLocally(game: Partial<Game>) {
  const db = await initDB();
  const nextNumber = await getNextGameNumber();
  
  await db.add(STORE_NAME, {
    ...game,
    id: game.id || `local-${crypto.randomUUID()}`,
    game_number: nextNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  return db.getAll(STORE_NAME);
}