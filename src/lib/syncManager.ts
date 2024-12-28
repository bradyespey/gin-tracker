import { supabase } from './supabase';
import { getLocalGames, deleteGameLocally } from './indexedDB';

export async function syncGames() {
  try {
    // Get all pending local games
    const localGames = await getLocalGames();
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    
    if (!pendingGames.length) return;

    // Sync each pending game
    for (const game of pendingGames) {
      const { id, syncStatus, ...gameData } = game;
      
      try {
        const { error } = await supabase
          .from('games')
          .insert({
            ...gameData,
            // Don't send local ID if it's a temporary one
            id: id.startsWith('local-') ? undefined : id
          });

        if (!error) {
          // If sync successful, remove from local DB
          await deleteGameLocally(id);
        }
      } catch (e) {
        console.error('Error syncing game:', e);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

export async function triggerSync() {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('sync-games');
    } catch (err) {
      console.error('Background sync failed:', err);
      // Fallback to immediate sync
      await syncGames();
    }
  } else {
    // No service worker support, sync immediately
    await syncGames();
  }
}