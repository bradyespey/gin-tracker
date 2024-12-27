import { supabase } from './supabase';
import type { Game } from '../types/game';

export async function deleteGame(id: string) {
  console.log('Delete operation started for ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    console.log('Delete response:', { data, error });
    
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
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id);
    
    console.log('Update response:', { data, error });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update operation failed:', error);
    throw error;
  }
}