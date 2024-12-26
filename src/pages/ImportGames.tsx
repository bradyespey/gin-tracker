import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import { GameForm } from '../components/GameForm';
import type { GameFormData } from '../types/game';

export function ImportGames() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameFormData[]>([getEmptyGame()]);
  const [loading, setLoading] = useState(false);

  function getEmptyGame(): GameFormData {
    return {
      date: new Date().toISOString().split('T')[0],
      winner: 'Brady',
      went_first: 'Brady',
      knock: false,
    };
  }

  const addGame = () => {
    setGames(prev => [...prev, getEmptyGame()]);
  };

  const removeGame = (index: number) => {
    setGames(prev => prev.filter((_, i) => i !== index));
  };

  const updateGame = (index: number, updates: Partial<GameFormData>) => {
    setGames(prev => prev.map((game, i) => 
      i === index ? { ...game, ...updates } : game
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gamesToInsert = games.map(game => ({
        date: game.date,
        winner: game.winner,
        went_first: game.went_first,
        knock: game.knock,
        score: game.knock ? (game.deadwood_difference || 0) : 25,
        deadwood_difference: game.deadwood_difference,
        undercut_by: game.undercut_by || null
      }));

      const { error } = await supabase
        .from('games')
        .insert(gamesToInsert);

      if (error) throw error;
      navigate('/gin');
    } catch (error) {
      console.error('Error importing games:', error);
      alert('Error importing games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Import Games</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {games.map((game, index) => (
            <GameForm
              key={index}
              data={game}
              onChange={updates => updateGame(index, updates)}
              showRemove={games.length > 1}
              onRemove={() => removeGame(index)}
            />
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addGame}
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Add Another Game
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save All Games'}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}