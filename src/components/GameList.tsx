import React, { useState } from 'react';
import { EditGameModal } from './EditGameModal';
import { GameActions } from './GameActions';
import { SortButton } from './SortButton';
import { GameTableHeader } from './GameTableHeader';
import { GameTableRow } from './GameTableRow';
import { deleteGame, updateGame } from '../services/gameService';
import { useSortedGames } from '../hooks/useSortedGames';
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
  
  const { sortedGames, sortConfig, handleSort } = useSortedGames(games);

  const handleDelete = async (id: string) => {
    if (!id) return;
    setLoading(true);
    
    try {
      const { error } = await deleteGame(id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting game:', error);
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
      const { error } = await updateGame(editingGame.id, {
        ...editFormData,
        undercut_by: editFormData.undercut_by || null
      });
      
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating game:', error);
    } finally {
      setLoading(false);
      setEditingGame(null);
      setEditFormData(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <GameTableHeader 
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <GameTableRow
              key={game.id}
              game={game}
              onEdit={() => handleEdit(game)}
              onDelete={() => deleteConfirm === game.id ? handleDelete(game.id) : setDeleteConfirm(game.id)}
              showConfirm={deleteConfirm === game.id}
              onCancelDelete={() => setDeleteConfirm(null)}
            />
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