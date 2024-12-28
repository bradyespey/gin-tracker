import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally, getNextGameNumber } from '../lib/indexedDB';
import { triggerSync } from '../lib/syncManager';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  try {
    // If it's a local game, just delete locally
    if (id.startsWith('local-')) {
      await deleteGameLocally(id);
      return { error: null };
    }

    // Try online delete first
    if (navigator.onLine) {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);
      
      if (!error) {
        return { error: null };
      }
    }
    
    // If offline or error, mark for deletion locally
    await deleteGameLocally(id);
    await triggerSync();
    return { error: null };
  } catch (error) {
    console.error('Delete game error:', error);
    return { error };
  }
}

export async function updateGame(id: string, formData: GameFormData) {
  try {
    const updates = {
      date: formData.date,
      winner: formData.winner,
      went_first: formData.went_first,
      knock: formData.knock,
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
      undercut_by: formData.undercut_by || null
    };

    // If it's a local game, just update locally
    if (id.startsWith('local-')) {
      await updateGameLocally(id, { ...updates, syncStatus: 'pending' });
      return { error: null };
    }

    // Try online update first
    if (navigator.onLine) {
      const { error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (!error) {
        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('gamesUpdated'));
        return { error: null };
      }
    }
    
    // If offline or error, save update locally
    await updateGameLocally(id, { ...updates, syncStatus: 'pending' });
    await triggerSync();
    return { error: null };
  } catch (error) {
    console.error('Update game error:', error);
    return { error };
  }
}

export async function addGame(formData: GameFormData) {
  try {
    const gameData = {
      date: formData.date,
      winner: formData.winner,
      went_first: formData.went_first,
      knock: formData.knock,
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
      undercut_by: formData.undercut_by || null
    };

    // Try online first if we're online
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();

      if (!error && data) {
        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('gamesUpdated'));
        return { data, error: null };
      }
    }

    // If offline or error, save locally
    const nextNumber = await getNextGameNumber();
    const localGame = {
      ...gameData,
      id: `local-${crypto.randomUUID()}`,
      game_number: nextNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: 'pending'
    };

    await saveGameLocally(localGame);
    await triggerSync();
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('gamesUpdated'));
    
    return { data: localGame, error: null };
  } catch (error) {
    console.error('Add game error:', error);
    return { error };
  }
}

export async function fetchGames() {
  try {
    // Get local games first
    const localGames = await getLocalGames();
    
    // If offline, return only local games
    if (!navigator.onLine) {
      return { 
        data: localGames.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return (b.game_number || 0) - (a.game_number || 0);
          }
          return dateCompare;
        }),
        error: null 
      };
    }

    // Try to get online games
    const { data: onlineGames, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })
      .order('game_number', { ascending: false });

    if (error) {
      return { data: localGames, error };
    }

    // Merge online and pending local games
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    const allGames = [...pendingGames, ...(onlineGames || [])];
    
    // Sort by date and game number
    const sortedGames = allGames.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare === 0) {
        return (b.game_number || 0) - (a.game_number || 0);
      }
      return dateCompare;
    });

    return { data: sortedGames, error: null };
  } catch (error) {
    console.error('Fetch games error:', error);
    const localGames = await getLocalGames();
    return { data: localGames, error };
  }
}