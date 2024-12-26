import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Pencil, X, Check } from 'lucide-react';
import type { Game } from '../types/game';

interface GameListProps {
  games: Game[];
  onUpdate?: () => void;
}

export function GameList({ games, onUpdate }: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (game: Game) => {
    setEditingGame({ ...game });
  };

  const handleSave = async () => {
    if (!editingGame) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('games')
        .update({
          date: editingGame.date,
          winner: editingGame.winner,
          went_first: editingGame.went_first,
          knock: editingGame.knock,
          score: editingGame.score,
          deadwood_difference: editingGame.deadwood_difference,
          undercut_by: editingGame.undercut_by
        })
        .eq('id', editingGame.id);

      if (error) throw error;
      setEditingGame(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingGame(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700/50">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Winner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              First Player
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Undercut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {games.map((game) => (
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
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onClick={() => handleEdit(game)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-200">Edit Game</h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add form fields for editing */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}