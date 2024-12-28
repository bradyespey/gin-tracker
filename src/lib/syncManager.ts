import { supabase } from './supabase';
import { getLocalGames, deleteGameLocally, updateGameLocally } from './indexedDB';

export async function syncGames() {
  if (!navigator.onLine) return;

  try {
    const localGames = await getLocalGames();
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    
    if (!pendingGames.length) return;

    for (const game of pendingGames) {
      const { id, syncStatus, ...gameData } = game;
      
      try {
        // Try to insert the game
        const { data, error } = await supabase
          .from('games')
          .insert({
            ...gameData,
            // Only include ID if it's not a temporary local ID
            id: id.startsWith('local-') ? undefined : id
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to sync game:', error);
          // Mark for retry by updating sync status
          await updateGameLocally(id, { ...game, syncStatus: 'retry' });
        } else {
          // Successfully synced, remove local copy
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
  if (!navigator.onLine) return;

  if ('serviceWorker' in navigator && 'sync' in registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
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

// Listen for online events to trigger sync
window.addEventListener('online', () => {
  triggerSync();
});