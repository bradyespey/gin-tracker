import { supabase } from '../lib/supabase';
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
      score: formData.knock ? (formData.deadwood_difference || 0) : 25,
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
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Fetch games error:', error);
    return { data: [], error };
  }
}