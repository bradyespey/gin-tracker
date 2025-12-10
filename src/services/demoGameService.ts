import { Game, GameFormData } from '../types/game';

/**
 * Generates 15 mock games spread over the past year with varying dates, winners, and game types.
 * Uses generic "User 1" and "User 2" to protect real user identities in demo mode.
 * @returns {Game[]} Array of 15 mock game objects
 */
const generateMockGames = (): Game[] => {
  const now = new Date();
  const games: Game[] = [];
  const winners: ('Brady' | 'Jenny')[] = ['Brady', 'Jenny', 'Brady', 'Jenny', 'Brady', 'Jenny', 'Brady', 'Jenny', 'Brady', 'Jenny', 'Brady', 'Jenny', 'Brady', 'Jenny', 'Brady'];
  const wentFirst: ('Brady' | 'Jenny')[] = ['Brady', 'Jenny', 'Jenny', 'Brady', 'Brady', 'Jenny', 'Jenny', 'Brady', 'Brady', 'Jenny', 'Jenny', 'Brady', 'Brady', 'Jenny', 'Jenny'];
  
  // Create date distribution: some days with multiple games, some months apart
  const dateOffsets = [
    0, 1, 1, 3, 7, 14, 30, 45, 60, 90, 120, 150, 180, 240, 365
  ];
  
  for (let i = 0; i < 15; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dateOffsets[i]);
    const dateStr = date.toISOString().split('T')[0];
    
    const isKnock = Math.random() > 0.5;
    const hasUndercut = isKnock && Math.random() > 0.6;
    const score = isKnock 
      ? Math.floor(Math.random() * 20) + 5
      : Math.floor(Math.random() * 10) + 25;
    
    games.push({
      id: `mock-${i + 1}`,
      game_number: 15 - i,
      date: dateStr,
      winner: winners[i],
      score: isKnock ? (hasUndercut ? Math.floor(Math.random() * 15) + 5 : score) : score,
      went_first: wentFirst[i],
      knock: isKnock,
      deadwood_difference: isKnock ? score : undefined,
      undercut_by: hasUndercut ? (winners[i] === 'Brady' ? 'Jenny' : 'Brady') : undefined,
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    });
  }
  
  return games;
};

const initialMockGames: Game[] = generateMockGames();

let currentMockGames: Game[] = [...initialMockGames];

/**
 * Fetches mock games for demo mode. Returns in-memory games sorted by date (newest first).
 * Changes to games are reset on page refresh as they are stored only in memory.
 * @returns {Promise<{data: Game[], error: null}>} Promise resolving to sorted mock games
 */
export const fetchMockGames = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sorted = [...currentMockGames].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare === 0) {
      return (b.game_number || 0) - (a.game_number || 0);
    }
    return dateCompare;
  });
  
  return { data: sorted, error: null };
};

/**
 * Adds a new mock game to in-memory storage. Changes are reset on page refresh.
 * @param {GameFormData} formData - Game data to add
 * @returns {Promise<{data: Game, error: null}>} Promise resolving with the new game
 */
export const addMockGame = async (formData: GameFormData) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newGame: Game = {
    id: `mock-${Date.now()}`,
    game_number: currentMockGames.length + 1,
    date: formData.date,
    winner: formData.winner,
    went_first: formData.went_first,
    knock: formData.knock,
    score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
    deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : undefined,
    undercut_by: formData.undercut_by || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  currentMockGames = [...currentMockGames, newGame];
  window.dispatchEvent(new CustomEvent('gamesUpdated'));
  
  return { data: newGame, error: null };
};

/**
 * Updates a mock game in memory. Changes are reset on page refresh.
 * @param {string} id - The game ID to update
 * @param {GameFormData} formData - Updated game data
 * @returns {Promise<{error: null}>} Promise resolving when update completes
 */
export const updateMockGame = async (id: string, formData: GameFormData) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  currentMockGames = currentMockGames.map(g => {
    if (g.id !== id) return g;
    return {
      ...g,
      date: formData.date,
      winner: formData.winner,
      went_first: formData.went_first,
      knock: formData.knock,
      score: formData.knock ? Number(formData.deadwood_difference || 0) : Number(formData.score || 25),
      deadwood_difference: formData.knock ? Number(formData.deadwood_difference) : undefined,
      undercut_by: formData.undercut_by || undefined,
      updated_at: new Date().toISOString(),
    };
  });

  window.dispatchEvent(new CustomEvent('gamesUpdated'));
  return { error: null };
};

/**
 * Deletes a mock game from in-memory storage. Changes are reset on page refresh.
 * @param {string} id - The game ID to delete
 * @returns {Promise<{error: null}>} Promise resolving when deletion completes
 */
export const deleteMockGame = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  currentMockGames = currentMockGames.filter(g => g.id !== id);
  
  window.dispatchEvent(new CustomEvent('gamesUpdated'));
  return { error: null };
};


