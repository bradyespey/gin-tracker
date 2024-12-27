import React from 'react';
import { GameActions } from './GameActions';
import { formatDateForDisplay } from '../services/dateService';
import type { Game } from '../types/game';

interface GameTableRowProps {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
  showConfirm: boolean;
  onCancelDelete: () => void;
}

export function GameTableRow({ 
  game, 
  onEdit, 
  onDelete, 
  showConfirm, 
  onCancelDelete 
}: GameTableRowProps) {
  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {formatDateForDisplay(game.date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.winner}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.score}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.went_first}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.knock ? 'Knock' : 'Gin'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
        {game.undercut_by || '-'}
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