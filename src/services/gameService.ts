import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames } from '../lib/indexedDB';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  try {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
      score: formData.knock ? (formData.deadwood_difference || 0) : (formData.score || 25),
      deadwood_difference: formData.knock ? formData.deadwood_difference : null,
      undercut_by: formData.undercut_by || null
    };

    const { error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Update game error:', error);
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
      // If online request fails, try to get local data
      console.log('Fetching local games due to error');
      const localGames = await getLocalGames();
      return { data: localGames, error: null };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.log('Fetching local games due to catch');
    // If completely offline, get local data
    const localGames = await getLocalGames();
    return { data: localGames, error: null };
  }
}

export async function addGame(formData: GameFormData) {
  try {
    const gameData = {
      date: formData.date,
      winner: formData.winner,
      went_first: formData.went_first,
      knock: formData.knock,
      score: formData.knock ? (formData.deadwood_difference || 0) : (formData.score || 25),
      deadwood_difference: formData.knock ? formData.deadwood_difference : null,
      undercut_by: formData.undercut_by || null
    };

    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (error) {
      // If offline, save locally
      await saveGameLocally(gameData);
      return { data: null, error: null };
    }

    return { data, error: null };
  } catch (error) {
    // If completely offline, save locally
    try {
      await saveGameLocally(formData);
      return { data: null, error: null };
    } catch (localError) {
      console.error('Local save error:', localError);
      return { data: null, error: localError };
    }
  }
}