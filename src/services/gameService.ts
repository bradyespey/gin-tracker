import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}