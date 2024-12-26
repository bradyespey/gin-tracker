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
      setSortDirection('desc');
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortField === 'date') {
      return (new Date(aValue as string).getTime() - new Date(bValue as string).getTime()) * modifier;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onUpdate();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game. Please try again.');
    }
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

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-slate-400 hover:text-slate-200"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );

  if (editingGame) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Edit Game</h2>
            <button
              onClick={() => setEditingGame(null)}
              className="text-slate-400 hover:text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <GameForm
            data={{
              date: editingGame.date,
              winner: editingGame.winner,
              went_first: editingGame.went_first,
              knock: editingGame.knock,
              deadwood_difference: editingGame.deadwood_difference,
              undercut_by: editingGame.undercut_by || undefined
            }}
            onChange={handleSave}
          />

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setEditingGame(null)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="py-3 px-4 text-left">
              <SortButton field="date">Date</SortButton>
            </th>
            <th className="py-3 px-4 text-left">
              <SortButton field="winner">Winner</SortButton>
            </th>
            <th className="py-3 px-4 text-left">
              <SortButton field="score">Score</SortButton>
            </th>
            <th className="py-3 px-4 text-left">
              <SortButton field="went_first">First Player</SortButton>
            </th>
            <th className="py-3 px-4 text-left">Type</th>
            <th className="py-3 px-4 text-left">Undercut</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedGames.map((game) => (
            <tr 
              key={game.id}
              className="border-b border-slate-800 hover:bg-slate-800/50"
            >
              <td className="py-3 px-4 text-slate-300">
                {format(new Date(game.date), 'MMM d, yyyy')}
              </td>
              <td className="py-3 px-4 text-slate-300">{game.winner}</td>
              <td className="py-3 px-4 text-slate-300">{game.score}</td>
              <td className="py-3 px-4 text-slate-300">{game.went_first}</td>
              <td className="py-3 px-4 text-slate-300">
                {game.knock ? 'Knock' : 'Gin'}
              </td>
              <td className="py-3 px-4 text-slate-300">
                {game.undercut_by || '-'}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <button
                  onClick={() => setEditingGame(game)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {deleteConfirm === game.id ? (
                  <div className="inline-flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-slate-400 hover:text-slate-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(game.id)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}