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
      const { id: localId, syncStatus, game_number, ...gameData } = game;
      
      try {
        // Add to Firestore
        await addDoc(collection(db, 'games'), gameData);

        // Successfully synced, remove local copy
        await deleteGameLocally(localId);
        // Trigger a refresh of the games list
        window.dispatchEvent(new CustomEvent('gamesUpdated'));
      } catch (e) {
        console.error('Error syncing game:', e);
        // Mark for retry by updating sync status
        await updateGameLocally(localId, { ...game, syncStatus: 'retry' });
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

