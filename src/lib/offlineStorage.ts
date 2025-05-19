//src/lib/offlineStorage.ts

import { supabase } from './supabase';
import { saveGameLocally, getLocalGames, syncPendingGames } from './indexedDB';
import type { Game, GameFormData } from '../types/game';

export async function saveGame(game: GameFormData) {
  try {
    // Try online first
    const { data, error } = await supabase.from('games').insert(game);
    
    if (error) {
      // If offline, save locally
      await saveGameLocally(game);
      // Request background sync
      if ('serviceWorker' in navigator && 'sync' in registration) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-games');
      }
    }
    
    return { data, error };
  } catch (error) {
    // Fallback to local storage
    await saveGameLocally(game);
    return { data: null, error };
  }
}

export async function getGames() {
  try {
    // Try online first
    const { data, error } = await supabase.from('games').select('*');
    
    if (error) {
      // If offline, get local data
      const localGames = await getLocalGames();
      return { data: localGames, error: null };
    }
    
    return { data, error };
  } catch (error) {
    // Fallback to local storage
    const localGames = await getLocalGames();
    return { data: localGames, error: null };
  }
}