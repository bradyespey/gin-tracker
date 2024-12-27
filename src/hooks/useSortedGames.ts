import { useState, useMemo } from 'react';
import type { Game } from '../types/game';

export function useSortedGames(games: Game[]) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Game;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  const handleSort = (key: keyof Game) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * modifier : 1 * modifier;
    });
  }, [games, sortConfig]);

  return { sortedGames, sortConfig, handleSort };
}