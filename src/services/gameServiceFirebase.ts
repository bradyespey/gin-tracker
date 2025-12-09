import { db } from '../lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { saveGameLocally, getLocalGames, updateGameLocally, deleteGameLocally, getNextGameNumber } from '../lib/indexedDB';
import { triggerSync } from '../lib/syncManagerFirebase';
import type { Game, GameFormData } from '../types/game';

// Helper to calculate game numbers based on date and creation time
const assignGameNumbers = (games: Game[]) => {
  // Sort by date ASC, then created_at ASC
  const sorted = [...games].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare === 0) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return dateCompare;
  });
  
  // Assign numbers sequentially
  return sorted.map((g, index) => ({
    ...g,
    game_number: index + 1
  }));
};

export async function deleteGame(id: string) {
  try {
    // If it's a local game, just delete locally
    if (id.startsWith('local-')) {
      await deleteGameLocally(id);
      return { error: null };
    }

    // Try online delete first
    if (navigator.onLine) {
      await deleteDoc(doc(db, 'games', id));
      return { error: null };
    }
    
    // If offline, mark for deletion locally (not fully implemented in original for non-local games?
    // Original code: await deleteGameLocally(id);
    // But deleteGameLocally only works if it exists in IndexedDB.
    // If we only cache pending games, we can't delete "online" games offline easily unless we cache everything.
    // Original fetchGames returns localGames IF offline.
    // So offline mode only shows local games + maybe cached ones?
    // Let's stick to original behavior:
    await deleteGameLocally(id);
    await triggerSync();
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
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : null,
      undercut_by: formData.undercut_by || null,
      updated_at: new Date().toISOString()
    };

    // If it's a local game, just update locally
    if (id.startsWith('local-')) {
      await updateGameLocally(id, { ...updates, syncStatus: 'pending' });
      return { error: null };
    }

    // Try online update first
    if (navigator.onLine) {
      await updateDoc(doc(db, 'games', id), updates);
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('gamesUpdated'));
      return { error: null };
    }
    
    // If offline, save update locally
    await updateGameLocally(id, { ...updates, syncStatus: 'pending' });
    await triggerSync();
    return { error: null };
  } catch (error) {
    console.error('Update game error:', error);
    return { error };
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
      undercut_by: formData.undercut_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try online first if we're online
    if (navigator.onLine) {
      const docRef = await addDoc(collection(db, 'games'), gameData);
      const newGame = { id: docRef.id, ...gameData };

      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('gamesUpdated'));
      return { data: newGame, error: null };
    }

    // If offline, save locally
    const nextNumber = await getNextGameNumber();
    const localGame = {
      ...gameData,
      id: `local-${crypto.randomUUID()}`,
      game_number: nextNumber,
      syncStatus: 'pending'
    };

    await saveGameLocally(localGame);
    await triggerSync();
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('gamesUpdated'));
    
    return { data: localGame, error: null };
  } catch (error) {
    console.error('Add game error:', error);
    return { error };
  }
}

export async function fetchGames() {
  try {
    // Get local games first
    const localGames = await getLocalGames();
    
    // If offline, return only local games (sorted)
    if (!navigator.onLine) {
      return { 
        data: localGames.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return (b.game_number || 0) - (a.game_number || 0);
          }
          return dateCompare;
        }),
        error: null 
      };
    }

    // Try to get online games
    const querySnapshot = await getDocs(collection(db, 'games'));
    const onlineGames = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Game[];

    // Merge online and pending local games
    const pendingGames = localGames.filter(g => g.syncStatus === 'pending');
    // Note: pendingGames might duplicate if we just fetched them from online? 
    // No, pending means not synced yet.
    
    const allGames = [...pendingGames, ...onlineGames];
    
    // Calculate game numbers on the fly
    const numberedGames = assignGameNumbers(allGames);
    
    // Sort by date and game number (DESC for UI)
    const sortedGames = numberedGames.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare === 0) {
        return (b.game_number || 0) - (a.game_number || 0);
      }
      return dateCompare;
    });

    return { data: sortedGames, error: null };
  } catch (error) {
    console.error('Fetch games error:', error);
    const localGames = await getLocalGames();
    return { data: localGames, error };
  }
}

