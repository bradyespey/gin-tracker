import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string) {
  return await supabase
    .from('games')
    .delete()
    .eq('id', id);
}

export async function updateGame(id: string, updates: Partial<Game>) {
  return await supabase
    .from('games')
    .update(updates)
    .eq('id', id);
}

export async function fetchGames() {
  return await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false });
}