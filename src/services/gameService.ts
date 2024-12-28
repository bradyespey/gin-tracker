import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally } from '../lib/indexedDB';
import { triggerSync } from '../lib/syncManager';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  try {
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

    const { error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      await updateGameLocally(id, { ...updates, syncStatus: 'pending' });
      await triggerSync();
    }
    return { error };
  } catch (error) {
    await updateGameLocally(id, { ...formData, syncStatus: 'pending' });
    await triggerSync();
    return { error };
  }
}

export async function fetchGames() {
  try {
    const { data: onlineGames, error } = await supabase
      .from('games')
      .select('*')
      .order('game_number', { ascending: false });
    
    if (error) {
      const localGames = await getLocalGames();
      return { data: localGames, error: null };
    }

    // Merge with local pending games
    const localGames = await getLocalGames();
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    
    // Sort by game number descending
    return { 
      data: [...pendingGames, ...(onlineGames || [])].sort((a, b) => 
        (b.game_number || 0) - (a.game_number || 0)
      ), 
      error: null 
    };
  } catch (error) {
    const localGames = await getLocalGames();
    return { data: localGames, error };
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

    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (error) {
      // For offline games, use a temporary high number that will be fixed when synced
      const maxGameNumber = Math.max(...(await getLocalGames()).map(g => g.game_number || 0), 0);
      const localGame = {
        ...gameData,
        id: `local-${crypto.randomUUID()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        game_number: maxGameNumber + 1,
        syncStatus: 'pending'
      };
      await saveGameLocally(localGame);
      await triggerSync();
      return { data: localGame, error: null };
    }

    return { data, error: null };
  } catch (error) {
    const maxGameNumber = Math.max(...(await getLocalGames()).map(g => g.game_number || 0), 0);
    const localGame = {
      ...formData,
      id: `local-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      game_number: maxGameNumber + 1,
      syncStatus: 'pending'
    };
    await saveGameLocally(localGame);
    await triggerSync();
    return { data: localGame, error: null };
  }
}