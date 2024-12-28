import { supabase } from '../lib/supabase';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally, getNextGameNumber } from '../lib/indexedDB';
import { triggerSync } from '../lib/syncManager';
import type { Game, GameFormData } from '../types/game';

export async function deleteGame(id: string) {
  try {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) {
      await deleteGameLocally(id);
      await triggerSync();
    }
    return { error };
  } catch (error) {
    await deleteGameLocally(id);
    await triggerSync();
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
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
      undercut_by: formData.undercut_by || null
    };

    const { error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      await updateGameLocally(id, updates);
      await triggerSync();
    }
    return { error };
  } catch (error) {
    await updateGameLocally(id, formData);
    await triggerSync();
    return { error };
  }
}

export async function fetchGames() {
  try {
    // Try to get online games first
    const { data: onlineGames, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })
      .order('game_number', { ascending: false });

    // Get local games
    const localGames = await getLocalGames();
    
    if (error || !navigator.onLine) {
      // If offline or error, return only local games
      return { 
        data: localGames.sort((a, b) => {
          // Sort by date desc, then game_number desc
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return (b.game_number || 0) - (a.game_number || 0);
          }
          return dateCompare;
        }),
        error: null 
      };
    }

    // Merge online and pending local games
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    const allGames = [...pendingGames, ...(onlineGames || [])];
    
    // Sort by date and game number
    const sortedGames = allGames.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare === 0) {
        return (b.game_number || 0) - (a.game_number || 0);
      }
      return dateCompare;
    });

    return { data: sortedGames, error: null };
  } catch (error) {
    const localGames = await getLocalGames();
    return { 
      data: localGames.sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare === 0) {
          return (b.game_number || 0) - (a.game_number || 0);
        }
        return dateCompare;
      }),
      error 
    };
  }
}

export async function addGame(formData: GameFormData) {
  try {
    const gameData = {
      date: formData.date,
      winner: formData.winner,
      went_first: formData.went_first,
      knock: formData.knock,
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
      undercut_by: formData.undercut_by || null
    };

    if (!navigator.onLine) {
      // If offline, save locally with next available number
      const nextNumber = await getNextGameNumber();
      const localGame = {
        ...gameData,
        game_number: nextNumber,
        id: `local-${crypto.randomUUID()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: 'pending'
      };
      await saveGameLocally(localGame);
      return { data: localGame, error: null };
    }

    // Try to save online
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (error) {
      // If error, save locally
      const nextNumber = await getNextGameNumber();
      const localGame = {
        ...gameData,
        game_number: nextNumber,
        id: `local-${crypto.randomUUID()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: 'pending'
      };
      await saveGameLocally(localGame);
      await triggerSync();
      return { data: localGame, error: null };
    }

    return { data, error: null };
  } catch (error) {
    // If any error, save locally
    const nextNumber = await getNextGameNumber();
    const localGame = {
      ...formData,
      game_number: nextNumber,
      id: `local-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: 'pending'
    };
    await saveGameLocally(localGame);
    await triggerSync();
    return { data: localGame, error: null };
  }
}