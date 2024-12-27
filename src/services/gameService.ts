import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally } from '../lib/indexedDB';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  try {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) {
      await deleteGameLocally(id);
    }
    return { error };
  } catch (error) {
    await deleteGameLocally(id);
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
      await updateGameLocally(id, updates);
    }
    return { error };
  } catch (error) {
    await updateGameLocally(id, formData);
    return { error };
  }
}

export async function fetchGames() {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      const localGames = await getLocalGames();
      return { data: localGames, error: null };
    }
    
    return { data: data || [], error: null };
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
      await saveGameLocally({
        ...gameData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        game_number: -1
      });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    await saveGameLocally({
      ...formData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      game_number: -1
    });
    return { data: null, error };
  }
}