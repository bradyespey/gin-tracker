import React, { useState } from 'react';
import { EditGameModal } from './EditGameModal';
import { GameActions } from './GameActions';
import { SortButton } from './SortButton';
import { formatDateForDisplay } from '../utils/dateUtils';
import { calculateScore } from '../utils/gameUtils';
import { deleteGame, updateGame } from '../lib/gameOperations';
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
    console.log('Attempting to delete game:', id);
    if (!id) return;
    setLoading(true);
    
    try {
      await deleteGame(id);
      console.log('Game deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Game deletion failed:', error);
      alert('Error deleting game. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Rest of the component remains unchanged...

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table header remains unchanged... */}
        <tbody className="divide-y divide-slate-700/50">
          {sortedGames.map((game) => (
            <tr key={game.id} className="hover:bg-slate-800/30">
              {/* Other cells remain unchanged... */}
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