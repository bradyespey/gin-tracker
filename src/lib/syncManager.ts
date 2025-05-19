//src/lib/syncManager.ts

import { supabase } from './supabase';
import { getLocalGames, deleteGameLocally, updateGameLocally } from './indexedDB';

export async function syncGames() {
  if (!navigator.onLine) return;

  try {
    const localGames = await getLocalGames();
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    
    if (!pendingGames.length) return;

    for (const game of pendingGames) {
      const { id, syncStatus, game_number, created_at, updated_at, ...gameData } = game;
      
      try {
        // Try to insert the game
        const { data, error } = await supabase
          .from('games')
          .insert(gameData)
          .select()
          .single();

        if (error) {
          console.error('Failed to sync game:', error);
          // Mark for retry by updating sync status
          await updateGameLocally(id, { ...game, syncStatus: 'retry' });
        } else {
          // Successfully synced, remove local copy
          await deleteGameLocally(id);
          // Trigger a refresh of the games list
          window.dispatchEvent(new CustomEvent('gamesUpdated'));
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

  try {
    await syncGames();
  } catch (err) {
    console.error('Sync failed:', err);
  }
}