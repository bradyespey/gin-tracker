//src/lib/syncManager.ts

import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getLocalGames, deleteGameLocally, updateGameLocally } from './indexedDB';

export async function syncGames() {
  if (!navigator.onLine) return;

  try {
    const localGames = await getLocalGames();
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    
    if (!pendingGames.length) return;

    for (const game of pendingGames) {
      const { id, syncStatus, game_number, ...gameData } = game;
      
      try {
        // Try to insert the game to Firestore
        const docRef = await addDoc(collection(db, 'games'), gameData);

        if (docRef.id) {
          // Successfully synced, remove local copy
          await deleteGameLocally(id);
          // Trigger a refresh of the games list
          window.dispatchEvent(new CustomEvent('gamesUpdated'));
        }
      } catch (e) {
        console.error('Failed to sync game:', e);
        // Mark for retry by updating sync status
        await updateGameLocally(id, { ...game, syncStatus: 'retry' });
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

export async function triggerSync() {
  if (!navigator.onLine) return;

  try {
    await syncGames();
  } catch (err) {
    console.error('Sync failed:', err);
  }
}