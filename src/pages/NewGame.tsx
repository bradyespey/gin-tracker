import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import { GameForm } from '../components/GameForm';
import { getLocalDate } from '../utils/dateUtils';
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

  // Fetch last game to set default went_first
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
      const gamesToInsert = games.map(game => ({
        date: game.date,
        winner: game.winner,
        went_first: game.went_first,
        knock: game.knock,
        score: game.knock ? (game.deadwood_difference || 0) : (game.score || 25),
        deadwood_difference: game.knock ? game.deadwood_difference : null,
        undercut_by: game.undercut_by || null
      }));

      const { error } = await supabase.from('games').insert(gamesToInsert);
      if (error) throw error;
      navigate('/gin');
    } catch (error) {
      console.error('Error adding games:', error);
      alert('Error adding games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGame = () => {
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
        <h1 className="text-3xl font-bold text-slate-100 mb-8">New Game{games.length > 1 ? 's' : ''}</h1>
        
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
              {loading ? 'Saving...' : `Save Game${games.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}