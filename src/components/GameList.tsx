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
    if (!id) return;
    setLoading(true);
    
    try {
      const { error } = await deleteGame(id);
      if (error) throw error;
      
      // Update local state first
      const updatedGames = games.filter(game => game.id !== id);
      onUpdate();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game: Game) => {
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
    if (!editingGame || !editFormData) return;
    setLoading(true);

    try {
      const updatedGame = {
        date: editFormData.date,
        winner: editFormData.winner,
        went_first: editFormData.went_first,
        knock: editFormData.knock,
        score: calculateScore(editFormData),
        deadwood_difference: editFormData.deadwood_difference,
        undercut_by: editFormData.undercut_by || null
      };

      const { error } = await updateGame(editingGame.id, updatedGame);
      if (error) throw error;

      // Update local state first
      const updatedGames = games.map(game => 
        game.id === editingGame.id 
          ? { ...game, ...updatedGame }
          : game
      );
      
      onUpdate();
      setEditingGame(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Error updating game:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
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
            <th className="px-6 py-3 text-left text-slate-300">
              <SortButton onClick={() => handleSort('date')}>
                Date
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-slate-300">
              <SortButton onClick={() => handleSort('winner')}>
                Winner
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-slate-300">
              <SortButton onClick={() => handleSort('score')}>
                Score
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-slate-300">
              <SortButton onClick={() => handleSort('went_first')}>
                First Player
              </SortButton>
            </th>
            <th className="px-6 py-3 text-left text-slate-300">Type</th>
            <th className="px-6 py-3 text-left text-slate-300">Undercut</th>
            <th className="px-6 py-3 text-right text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <tr key={game.id} className="hover:bg-slate-800/30">
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {formatDateForDisplay(game.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {game.winner}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {game.score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {game.went_first}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {game.knock ? 'Knock' : 'Gin'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {game.undercut_by || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <GameActions
                  onEdit={() => handleEdit(game)}
                  onDelete={() => deleteConfirm === game.id ? handleDelete(game.id) : setDeleteConfirm(game.id)}
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