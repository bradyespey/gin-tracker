import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { GameActions } from './GameActions';
import { SortButton } from './SortButton';
import { EditGameModal } from './EditGameModal';
import { calculateScore } from '../utils/gameUtils';
import type { Game, GameFormData } from '../types/game';

interface GameListProps {
  games: Game[];
  onUpdate: () => void;
}

type SortField = 'date' | 'winner' | 'score' | 'went_first' | 'knock' | 'undercut_by';
type SortDirection = 'asc' | 'desc';

export function GameList({ games, onUpdate }: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editFormData, setEditFormData] = useState<GameFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'date':
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier;
      case 'knock':
        return (Number(a.knock) - Number(b.knock)) * modifier;
      case 'undercut_by':
        const aVal = a.undercut_by || '';
        const bVal = b.undercut_by || '';
        return aVal.localeCompare(bVal) * modifier;
      default:
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * modifier;
        }
        return ((aValue as number) - (bValue as number)) * modifier;
    }
  });

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

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

  const handleSave = async () => {
    if (!editingGame || !editFormData) return;
    setLoading(true);

    try {
      const updates = {
        date: editFormData.date,
        winner: editFormData.winner,
        went_first: editFormData.went_first,
        knock: editFormData.knock,
        score: calculateScore(editFormData),
        deadwood_difference: editFormData.deadwood_difference,
        undercut_by: editFormData.undercut_by || null
      };

      const { error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', editingGame.id);

      if (error) throw error;
      
      setEditingGame(null);
      setEditFormData(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {editingGame && editFormData && (
        <EditGameModal
          formData={editFormData}
          onClose={() => {
            setEditingGame(null);
            setEditFormData(null);
          }}
          onSave={handleSave}
          onChange={setEditFormData}
          loading={loading}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('date')}>Date</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('winner')}>Winner</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('score')}>Score</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('went_first')}>First Player</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('knock')}>Type</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => handleSort('undercut_by')}>Undercut</SortButton>
              </th>
              <th className="py-3 px-4 text-right text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {sortedGames.map((game) => (
              <tr 
                key={game.id}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-3 px-4">
                  {format(new Date(game.date), 'MMM d, yyyy')}
                </td>
                <td className="py-3 px-4">{game.winner}</td>
                <td className="py-3 px-4">{game.score}</td>
                <td className="py-3 px-4">{game.went_first}</td>
                <td className="py-3 px-4">
                  {game.knock ? 'Knock' : 'Gin'}
                </td>
                <td className="py-3 px-4">
                  {game.undercut_by || '-'}
                </td>
                <td className="py-3 px-4 text-right">
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
      </div>
    </>
  );
}