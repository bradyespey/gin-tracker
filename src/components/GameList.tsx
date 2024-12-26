import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EditGameModal } from './EditGameModal';
import { GameActions } from './GameActions';
import { SortButton } from './SortButton';
import { formatDateForDisplay } from '../utils/dateUtils';
import { calculateScore } from '../utils/gameUtils';
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
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
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
    if (!editingGame?.id || !editFormData) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('games')
        .update({
          date: editFormData.date,
          winner: editFormData.winner,
          went_first: editFormData.went_first,
          knock: editFormData.knock,
          score: calculateScore(editFormData),
          deadwood_difference: editFormData.deadwood_difference,
          undercut_by: editFormData.undercut_by || null
        })
        .eq('id', editingGame.id);

      if (error) throw error;
      onUpdate();
      setEditingGame(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Error updating game:', error);
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
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key]) return -1 * direction;
    if (a[sortConfig.key] > b[sortConfig.key]) return 1 * direction;
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="py-3 text-left">
              <SortButton onClick={() => handleSort('date')}>
                Date
              </SortButton>
            </th>
            <th className="py-3 text-left">
              <SortButton onClick={() => handleSort('winner')}>
                Winner
              </SortButton>
            </th>
            <th className="py-3 text-left">
              <SortButton onClick={() => handleSort('score')}>
                Score
              </SortButton>
            </th>
            <th className="py-3 text-left">
              <SortButton onClick={() => handleSort('went_first')}>
                First Player
              </SortButton>
            </th>
            <th className="py-3 text-left">Type</th>
            <th className="py-3 text-left">Undercut</th>
            <th className="py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedGames.map((game) => (
            <tr key={game.id} className="border-b border-slate-800/50">
              <td className="py-3 text-slate-300">
                {formatDateForDisplay(game.date)}
              </td>
              <td className="py-3 text-slate-300">{game.winner}</td>
              <td className="py-3 text-slate-300">{game.score}</td>
              <td className="py-3 text-slate-300">{game.went_first}</td>
              <td className="py-3 text-slate-300">
                {game.knock ? 'Knock' : 'Gin'}
              </td>
              <td className="py-3 text-slate-300">
                {game.undercut_by || '-'}
              </td>
              <td className="py-3 text-right">
                <GameActions
                  onEdit={() => handleEdit(game)}
                  onDelete={() => handleDelete(game.id)}
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
          onChange={updates => setEditFormData(prev => ({ ...prev!, ...updates }))}
          loading={loading}
        />
      )}
    </div>
  );
}