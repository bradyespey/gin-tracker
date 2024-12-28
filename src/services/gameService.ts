import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally } from '../lib/indexedDB';
import { triggerSync } from '../lib/syncManager';
import type { Game, GameFormData } from '../types/game';

export async function addGame(formData: GameFormData) {
  const gameData = {
    date: formData.date,
    winner: formData.winner,
    went_first: formData.went_first,
    knock: formData.knock,
    score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
    deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
    undercut_by: formData.undercut_by || null
  };

  try {
    if (!navigator.onLine) {
      await saveGameLocally(gameData);
      return { error: new Error('Offline - Game saved locally') };
    }

    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (error) {
      await saveGameLocally(gameData);
      await triggerSync();
    }

    return { data, error };
  } catch (error) {
    await saveGameLocally(gameData);
    await triggerSync();
    return { error };
  }
}

export async function fetchGames() {
  try {
    // Get local games first
    const localGames = await getLocalGames();
    
    if (!navigator.onLine) {
      return { data: localGames, error: null };
    }

    // Try to get online games
    const { data: onlineGames, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: localGames, error };
    }

    // Merge and sort games
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    const allGames = [...pendingGames, ...(onlineGames || [])];
    
    const sortedGames = allGames.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare === 0) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return dateCompare;
    });

    return { data: sortedGames, error: null };
  } catch (error) {
    const localGames = await getLocalGames();
    return { data: localGames, error };
  }
}

export async function updateGame(id: string, formData: GameFormData) {
  const updates = {
    date: formData.date,
    winner: formData.winner,
    went_first: formData.went_first,
    knock: formData.knock,
    score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
    deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
    undercut_by: formData.undercut_by || null
  };

  try {
    if (!navigator.onLine) {
      await updateGameLocally(id, updates);
      return { error: new Error('Offline - Update saved locally') };
    }

    const { error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id);

    if (error) {
      await updateGameLocally(id, updates);
      await triggerSync();
    }

    return { error };
  } catch (error) {
    await updateGameLocally(id, updates);
    await triggerSync();
    return { error };
  }
}

export async function deleteGame(id: string) {
  try {
    if (!navigator.onLine) {
      await deleteGameLocally(id);
      return { error: new Error('Offline - Delete saved locally') };
    }

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      await deleteGameLocally(id);
      await triggerSync();
    }

    return { error };
  } catch (error) {
    await deleteGameLocally(id);
    await triggerSync();
    return { error };
  }
}