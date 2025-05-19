//src/components/GameList.tsx

import React, { useState } from 'react';
import { EditGameModal } from './EditGameModal';
import { GameTableHeader } from './GameTableHeader';
import { GameTableRow } from './GameTableRow';
import { GameFilters, type GameFilters as GameFiltersType } from './GameFilters';
import { Pagination } from './Pagination';
import { deleteGame, updateGame } from '../services/gameService';
import { useSortedGames } from '../hooks/useSortedGames';
import { usePagination } from '../hooks/usePagination';
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
  const [filters, setFilters] = useState<GameFiltersType>({});
  
  const { sortedGames, sortConfig, handleSort, resetSort } = useSortedGames(games);

  const filteredGames = sortedGames.filter(game => {
    if (filters.winner && game.winner !== filters.winner) return false;
    if (filters.type === 'Gin' && game.knock) return false;
    if (filters.type === 'Knock' && !game.knock) return false;
    if (filters.type === 'Knock + Undercut' && (!game.knock || !game.undercut_by)) return false;
    if (filters.wentFirst && game.went_first !== filters.wentFirst) return false;
    return true;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems,
    pageSizeOptions
  } = usePagination(filteredGames);

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
      const { error } = await updateGame(editingGame.id, editFormData);
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

  const resetFilters = () => {
    setFilters({});
    resetSort();
    setCurrentPage(1);
    setPageSize(10);
  };

  return (
    <div>
      <GameFilters 
        filters={filters} 
        onFilterChange={setFilters}
        onReset={resetFilters}
      />
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
        <table className="w-full">
          <GameTableHeader 
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {paginatedItems.map((game) => (
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

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