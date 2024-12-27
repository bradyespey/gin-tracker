import React, { useState } from 'react';
import { EditGameModal } from './EditGameModal';
import { GameActions } from './GameActions';
import { SortButton } from './SortButton';
import { formatDateForDisplay } from '../utils/dateUtils';
import { calculateScore } from '../utils/gameUtils';
import { deleteGame, updateGame } from '../services/gameService';
import type { Game, GameFormData } from '../types/game';

interface GameListProps {
  games: Game[];
  onUpdate: () => void;
}

export function GameList({ games, onUpdate }: GameListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editFormData, setEditFormData] = useState<GameFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Game;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  const handleDelete = async (id: string) => {
    console.log('Delete requested for game:', id);
    
    if (!id) {
      console.error('Invalid game ID for deletion');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Initiating delete operation');
      await deleteGame(id);
      console.log('Delete operation completed successfully');
      onUpdate();
    } catch (error) {
      console.error('Delete operation failed in component:', error);
      alert('Error deleting game. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (game: Game) => {
    console.log('Edit requested for game:', game.id);
    setEditingGame(game);
    setEditFormData({
      date: game.date,
      winner: game.winner,
      went_first: game.went_first,
      knock: game.knock,
      score: game.score,
      deadwood_difference: game.deadwood_difference,
      undercut_by: game.undercut_by || undefined
    });
  };

  const handleSaveEdit = async () => {
    if (!editingGame || !editFormData) {
      console.error('Missing data for edit operation');
      return;
    }

    setLoading(true);

    try {
      console.log('Preparing update payload');
      const updates = {
        date: editFormData.date,
        winner: editFormData.winner,
        went_first: editFormData.went_first,
        knock: editFormData.knock,
        score: calculateScore(editFormData),
        deadwood_difference: editFormData.deadwood_difference,
        undercut_by: editFormData.undercut_by || null
      };

      console.log('Initiating update operation');
      await updateGame(editingGame.id, updates);
      console.log('Update operation completed successfully');
      onUpdate();
      setEditingGame(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Update operation failed in component:', error);
      alert('Error updating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Game) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedGames = [...games].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === bValue) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    return aValue < bValue ? -1 * modifier : 1 * modifier;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left">
              <SortButton onClick={() => handleSort('date')}>
                Date
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton onClick={() => handleSort('winner')}>
                Winner
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton onClick={() => handleSort('score')}>
                Score
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton onClick={() => handleSort('went_first')}>
                First Player
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left">Type</th>
            <th className="px-6 py-3 text-left">Undercut</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <tr key={game.id} className="hover:bg-slate-800/30">
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDateForDisplay(game.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {game.winner}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {game.score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {game.went_first}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {game.knock ? 'Knock' : 'Gin'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {game.undercut_by || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <GameActions
                  onEdit={() => handleEdit(game)}
                  onDelete={() => setDeleteConfirm(game.id)}
                  showConfirm={deleteConfirm === game.id}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingGame && editFormData && (
        <EditGameModal
          formData={editFormData}
          onClose={() => {
            setEditingGame(null);
            setEditFormData(null);
          }}
          onSave={handleSaveEdit}
          onChange={updates => setEditFormData(prev => prev ? { ...prev, ...updates } : null)}
          loading={loading}
        />
      )}
    </div>
  );
}