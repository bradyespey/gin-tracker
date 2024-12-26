import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, X, ArrowUpDown } from 'lucide-react';
import { GameForm } from './GameForm';
import type { Game, GameFormData } from '../types/game';

interface GameListProps {
  games: Game[];
  onUpdate: () => void;
}

type SortField = 'date' | 'winner' | 'score' | 'went_first';
type SortDirection = 'asc' | 'desc';

export function GameList({ games, onUpdate }: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  const handleEdit = (game: Game) => {
    setEditingGame(game);
  };

  const handleDelete = async (id: string) => {
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
    }
    setDeleteConfirm(null);
  };

  const handleSave = async (formData: GameFormData) => {
    if (!editingGame) return;
    setLoading(true);

    try {
      const score = formData.knock ? (formData.deadwood_difference || 0) : 25;
      
      const { error } = await supabase
        .from('games')
        .update({
          date: formData.date,
          winner: formData.winner,
          went_first: formData.went_first,
          knock: formData.knock,
          score,
          deadwood_difference: formData.deadwood_difference,
          undercut_by: formData.undercut_by || null
        })
        .eq('id', editingGame.id);

      if (error) throw error;
      setEditingGame(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SortButton = ({ field, label }: { field: SortField, label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="group flex items-center space-x-1 hover:text-slate-100"
    >
      <span>{label}</span>
      <ArrowUpDown className={`h-4 w-4 ${
        sortField === field ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
      }`} />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700/50">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              <SortButton field="date" label="Date" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              <SortButton field="winner" label="Winner" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              <SortButton field="score" label="Score" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              <SortButton field="went_first" label="First Player" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
              Undercut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <tr key={game.id} className="hover:bg-slate-800/30">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {format(new Date(game.date), 'MMM d, yyyy')}
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
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                <button
                  onClick={() => handleEdit(game)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(game.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-200">Edit Game</h3>
              <button
                onClick={() => setEditingGame(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <GameForm
              data={{
                date: editingGame.date,
                winner: editingGame.winner,
                went_first: editingGame.went_first,
                knock: editingGame.knock,
                deadwood_difference: editingGame.deadwood_difference,
                undercut_by: editingGame.undercut_by,
              }}
              onChange={updates => handleSave({ ...editingGame, ...updates })}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Delete Game</h3>
            <p className="text-slate-300 mb-6">Are you sure you want to delete this game? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}