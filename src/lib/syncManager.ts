import { supabase } from './supabase';
import { getLocalGames, deleteGameLocally, updateGameLocally } from './indexedDB';
import type { Game } from '../types/game';

export async function syncGames() {
  try {
    // Get all local games
    const localGames = await getLocalGames();
    if (!localGames.length) return;

    // Get online games
    const { data: onlineGames, error } = await supabase
      .from('games')
      .select('*');

    if (error) throw error;

    // Sync each local game
    for (const localGame of localGames) {
      if (localGame.syncStatus === 'pending') {
        try {
          const { error: syncError } = await supabase
            .from('games')
            .upsert({
              ...localGame,
              id: localGame.id.startsWith('local-') ? undefined : localGame.id
            });

          if (!syncError) {
            await deleteGameLocally(localGame.id);
          }
        } catch (e) {
          console.error('Error syncing game:', e);
        }
      }
    }

    // Update local store with any new online games
    if (onlineGames) {
      for (const onlineGame of onlineGames) {
        const localGame = localGames.find(g => g.id === onlineGame.id);
        if (!localGame) {
          await updateGameLocally(onlineGame.id, onlineGame);
        }
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