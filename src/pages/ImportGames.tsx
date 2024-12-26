import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import type { GameFormData } from '../types/game';
import { calculateScore } from '../lib/gameLogic';

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
        score: calculateScore(game.knock, game.deadwood_difference),
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Import Games</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {games.map((game, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Game {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeGame(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={game.date}
                    onChange={e => updateGame(index, { date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Winner
                  </label>
                  <select
                    value={game.winner}
                    onChange={e => updateGame(index, { winner: e.target.value as 'Brady' | 'Jenny' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Brady">Brady</option>
                    <option value="Jenny">Jenny</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Went First
                  </label>
                  <select
                    value={game.went_first}
                    onChange={e => updateGame(index, { went_first: e.target.value as 'Brady' | 'Jenny' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Brady">Brady</option>
                    <option value="Jenny">Jenny</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Game End
                  </label>
                  <select
                    value={game.knock ? 'knock' : 'gin'}
                    onChange={e => updateGame(index, { knock: e.target.value === 'knock' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="gin">Gin</option>
                    <option value="knock">Knock</option>
                  </select>
                </div>

                {game.knock && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Deadwood Difference
                      </label>
                      <input
                        type="number"
                        value={game.deadwood_difference || ''}
                        onChange={e => updateGame(index, { 
                          deadwood_difference: parseInt(e.target.value) 
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Undercut By
                      </label>
                      <select
                        value={game.undercut_by || ''}
                        onChange={e => updateGame(index, { 
                          undercut_by: e.target.value as 'Brady' | 'Jenny' | undefined 
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">None</option>
                        <option value="Brady">Brady</option>
                        <option value="Jenny">Jenny</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addGame}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Another Game
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save All Games'}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}