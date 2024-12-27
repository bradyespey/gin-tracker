import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

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

export async function updateGame(id: string, updates: Partial<Game>) {
  try {
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