import { supabase } from './supabase';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  console.log('Delete operation started for ID:', id);
  
  try {
    const { data, error } = await supabase.rpc('delete_game', { game_id: id });
    
    console.log('Delete RPC response:', { data, error });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete operation failed:', error);
    throw error;
  }
}

export async function updateGame(id: string, updates: Partial<Game>) {
  console.log('Update operation started for ID:', id);
  console.log('Updates:', updates);
  
  try {
    const { data, error } = await supabase.rpc('update_game', {
      game_id: id,
      game_updates: updates
    });
    
    console.log('Update RPC response:', { data, error });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update operation failed:', error);
    throw error;
  }
}