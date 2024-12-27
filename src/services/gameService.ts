import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return false;
  }
  return true;
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return false;
  }
  return true;
}

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data || [];
}