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
      console.log('Attempting to delete game with ID:', id);
      
      const { data, error } = await supabase
        .from('games')
        .delete()
        .where('id', '=', id);

      console.log('Delete response:', { data, error });

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Detailed delete error:', error);
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
    if (!editingGame || !editFormData) return;
    setLoading(true);

    try {
      console.log('Attempting to update game:', {
        id: editingGame.id,
        updates: editFormData
      });

      const { data, error } = await supabase
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
        .where('id', '=', editingGame.id);

      console.log('Update response:', { data, error });

      if (error) throw error;
      
      onUpdate();
      setEditingGame(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Detailed update error:', error);
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

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'winner', label: 'Winner' },
    { key: 'score', label: 'Score' },
    { key: 'went_first', label: 'First Player' },
    { key: 'knock', label: 'Type' },
    { key: 'undercut_by', label: 'Undercut' },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-800/50">
          <tr>
            {columns.map(({ key, label, sortable = true }) => (
              <th key={key} className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                {sortable ? (
                  <SortButton onClick={() => handleSort(key as keyof Game)}>
                    {label}
                  </SortButton>
                ) : label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <tr key={game.id} className="hover:bg-slate-800/30">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {formatDateForDisplay(game.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {game.winner}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {game.score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {game.went_first}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {game.knock ? 'Knock' : 'Gin'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {game.undercut_by || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
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
          onChange={updates => setEditFormData(prev => prev ? { ...prev, ...updates } : null)}
          loading={loading}
        />
      )}
    </div>
  );
}