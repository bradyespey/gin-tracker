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
    
    if (field === 'date') {
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

  // ... rest of the component remains the same ...