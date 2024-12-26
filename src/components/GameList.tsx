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
      const score = calculateScore(editFormData);
      
      const { error } = await supabase
        .from('games')
        .update({
          date: editFormData.date,
          winner: editFormData.winner,
          went_first: editFormData.went_first,
          knock: editFormData.knock,
          score,
          deadwood_difference: editFormData.deadwood_difference,
          undercut_by: editFormData.undercut_by || null
        })
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

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id)
        .single();

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game. Please try again.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => {}}>Date</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => {}}>Winner</SortButton>
              </th>
              <th className="py-3 px-4 text-left">
                <SortButton onClick={() => {}}>Score</SortButton>
              </th>
              <th className="py-3 px-4 text-left">First Player</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Undercut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr 
                key={game.id} 
                className="border-b border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
              >
                <td className="py-3 px-4">{formatDateForDisplay(game.date)}</td>
                <td className="py-3 px-4">{game.winner}</td>
                <td className="py-3 px-4">{game.score}</td>
                <td className="py-3 px-4">{game.went_first}</td>
                <td className="py-3 px-4">{game.knock ? 'Knock' : 'Gin'}</td>
                <td className="py-3 px-4">{game.undercut_by || '-'}</td>
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

      {editingGame && editFormData && (
        <EditGameModal
          formData={editFormData}
          onClose={() => {
            setEditingGame(null);
            setEditFormData(null);
          }}
          onSave={handleSave}
          onChange={updates => setEditFormData(prev => prev ? { ...prev, ...updates } : null)}
          loading={loading}
        />
      )}
    </>
  );
}