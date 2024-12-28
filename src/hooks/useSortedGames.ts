import { useState, useMemo } from 'react';
import type { Game } from '../types/game';

export function useSortedGames(games: Game[]) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Game;
    direction: 'asc' | 'desc';
  }>({ key: 'game_number', direction: 'desc' });

  const handleSort = (key: keyof Game) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetSort = () => {
    setSortConfig({ key: 'game_number', direction: 'desc' });
  };

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) {
        // Secondary sort by game_number when primary sort values are equal
        const aNum = a.game_number;
        const bNum = b.game_number;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * modifier : 1 * modifier;
    });
  }, [games, sortConfig]);

  return { sortedGames, sortConfig, handleSort, resetSort };
}