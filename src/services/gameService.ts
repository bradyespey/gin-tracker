import { supabase } from '../lib/supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string): Promise<void> {
  console.log('Starting delete operation for game:', id);
  
  try {
    const { error } = await supabase
      .rpc('delete_game', { game_id: id });

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Game deleted successfully');
  } catch (error) {
    console.error('Delete operation failed:', error);
    throw error;
  }
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<void> {
  console.log('Starting update operation for game:', id);
  console.log('Update payload:', updates);

  try {
    const { error } = await supabase
      .rpc('update_game', { 
        game_id: id,
        game_updates: updates
      });

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Game updated successfully');
  } catch (error) {
    console.error('Update operation failed:', error);
    throw error;
  }
}

export async function fetchGames(): Promise<Game[]> {
  console.log('Fetching games');
  
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Fetch operation failed:', error);
    throw error;
  }
}