//src/components/GameTableRow.tsx

import React from 'react';
import { GameActions } from './GameActions';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatNumber } from '../utils/numberFormat';
import type { Game } from '../types/game';

interface GameTableRowProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  showConfirm: boolean;
  onCancelDelete: () => void;
  isDemo?: boolean;
}

const formatPlayerName = (name: string | null | undefined, isDemo?: boolean) => {
  if (!name) return '-';
  if (!isDemo) return name;
  return name === 'Brady' ? 'User 1' : name === 'Jenny' ? 'User 2' : name;
};

export function GameTableRow({ 
  game, 
  onEdit, 
  onDelete, 
  showConfirm, 
  onCancelDelete,
  isDemo
}: GameTableRowProps) {
  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.game_number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatDateForDisplay(game.date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatPlayerName(game.winner, isDemo)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatNumber(game.score)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatPlayerName(game.went_first, isDemo)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.knock ? 'Knock' : 'Gin'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatPlayerName(game.undercut_by, isDemo)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300 text-right">
        <GameActions
          onEdit={onEdit}
          onDelete={onDelete}
          showConfirm={showConfirm}
          onCancelDelete={onCancelDelete}
        />
      </td>
    </tr>
  );
}