//src/components/GameTableHeader.tsx

import React from 'react';
import { SortButton } from './SortButton';
import type { Game } from '../types/game';

interface GameTableHeaderProps {
  sortConfig: {
    key: keyof Game;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof Game) => void;
}

export function GameTableHeader({ sortConfig, onSort }: GameTableHeaderProps) {
  return (
    <thead className="bg-slate-800/50 sticky top-0">
      <tr>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'game_number'}
            direction={sortConfig.key === 'game_number' ? sortConfig.direction : undefined}
            onClick={() => onSort('game_number')}
          >
            #
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'date'}
            direction={sortConfig.key === 'date' ? sortConfig.direction : undefined}
            onClick={() => onSort('date')}
          >
            Date
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'winner'}
            direction={sortConfig.key === 'winner' ? sortConfig.direction : undefined}
            onClick={() => onSort('winner')}
          >
            Winner
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'score'}
            direction={sortConfig.key === 'score' ? sortConfig.direction : undefined}
            onClick={() => onSort('score')}
          >
            Score
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'went_first'}
            direction={sortConfig.key === 'went_first' ? sortConfig.direction : undefined}
            onClick={() => onSort('went_first')}
          >
            First Player
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'knock'}
            direction={sortConfig.key === 'knock' ? sortConfig.direction : undefined}
            onClick={() => onSort('knock')}
          >
            Type
          </SortButton>
        </th>
        <th className="px-6 py-3 text-left">
          <SortButton 
            active={sortConfig.key === 'undercut_by'}
            direction={sortConfig.key === 'undercut_by' ? sortConfig.direction : undefined}
            onClick={() => onSort('undercut_by')}
          >
            Undercut
          </SortButton>
        </th>
        <th className="px-6 py-3 text-right text-slate-400">Actions</th>
      </tr>
    </thead>
  );
}