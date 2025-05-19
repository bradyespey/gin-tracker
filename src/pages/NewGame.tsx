//src/pages/NewGame.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import { GameForm } from '../components/GameForm';
import { getLocalDate } from '../utils/dateUtils';
import { addGame } from '../services/gameService';
import type { GameFormData } from '../types/game';

export function NewGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<GameFormData[]>([{
    date: getLocalDate(),
    winner: 'Brady',
    went_first: 'Brady',
    knock: false,
    score: 25
  }]);

  useEffect(() => {
    async function fetchLastGame() {
      const { data: lastGames } = await supabase
        .from('games')
        .select('went_first')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastGames?.length) {
        setGames(prev => prev.map((game, index) => 
          index === 0 ? {
            ...game,
            went_first: lastGames[0].went_first === 'Brady' ? 'Jenny' : 'Brady'
          } : game
        ));
      }
    }
    fetchLastGame();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const game of games) {
        const { error } = await addGame(game);
        if (error) throw error;
      }
      navigate('/gin');
    } catch (error) {
      console.error('Error adding games:', error);
      alert('Error adding games. Games will be synced when back online.');
    } finally {
      setLoading(false);
    }
  };

  const addGameForm = () => {
    setGames(prev => [...prev, {
      date: getLocalDate(),
      winner: 'Brady',
      went_first: prev[prev.length - 1].went_first === 'Brady' ? 'Jenny' : 'Brady',
      knock: false,
      score: 25
    }]);
  };

  const updateGame = (index: number, updates: Partial<GameFormData>) => {
    setGames(prev => prev.map((game, i) => 
      i === index ? { ...game, ...updates } : game
    ));
  };

  const removeGame = (index: number) => {
    setGames(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          New Game{games.length > 1 ? 's' : ''}
        </h1>
        
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
              onClick={addGameForm}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Add Another Game
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : `Save Game${games.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}