import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .delete()
    .match({ id });

  if (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update(updates)
    .match({ id });

  if (error) {
    console.error('Error updating game:', error);
    throw error;
  }
}

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    throw error;
  }

  return data || [];
}