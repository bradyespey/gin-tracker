import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';
import { calculateScore } from '../lib/gameLogic';
import type { GameFormData } from '../types/game';

export function NewGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GameFormData>({
    date: new Date().toISOString().split('T')[0],
    winner: 'Brady',
    went_first: 'Brady',
    knock: false,
  });

  // Fetch last game to set default went_first
  useEffect(() => {
    async function fetchLastGame() {
      const { data: games } = await supabase
        .from('games')
        .select('went_first')
        .order('created_at', { ascending: false })
        .limit(1);

      if (games?.length) {
        setFormData(prev => ({
          ...prev,
          went_first: games[0].went_first === 'Brady' ? 'Jenny' : 'Brady'
        }));
      }
    }
    fetchLastGame();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const score = calculateScore(formData.knock, formData.deadwood_difference);
      
      const { error } = await supabase.from('games').insert([{
        date: formData.date,
        winner: formData.winner,
        went_first: formData.went_first,
        knock: formData.knock,
        score,
        deadwood_difference: formData.deadwood_difference,
        undercut_by: formData.undercut_by || null
      }]);

      if (error) throw error;
      navigate('/gin');
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Error adding game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Winner
            </label>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, winner: 'Brady' }))}
                className={`p-4 rounded-lg border ${
                  formData.winner === 'Brady'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Brady
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, winner: 'Jenny' }))}
                className={`p-4 rounded-lg border ${
                  formData.winner === 'Jenny'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Jenny
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Went First
            </label>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, went_first: 'Brady' }))}
                className={`p-4 rounded-lg border ${
                  formData.went_first === 'Brady'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Brady
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, went_first: 'Jenny' }))}
                className={`p-4 rounded-lg border ${
                  formData.went_first === 'Jenny'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Jenny
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Game End
            </label>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, knock: false }))}
                className={`p-4 rounded-lg border ${
                  !formData.knock
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Gin
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, knock: true }))}
                className={`p-4 rounded-lg border ${
                  formData.knock
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Knock
              </button>
            </div>
          </div>

          {formData.knock ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deadwood Difference
                </label>
                <input
                  type="number"
                  value={formData.deadwood_difference || ''}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    deadwood_difference: parseInt(e.target.value) 
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Undercut By
                </label>
                <div className="mt-1 grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, undercut_by: undefined }))}
                    className={`p-4 rounded-lg border ${
                      !formData.undercut_by
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, undercut_by: 'Brady' }))}
                    className={`p-4 rounded-lg border ${
                      formData.undercut_by === 'Brady'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Brady
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, undercut_by: 'Jenny' }))}
                    className={`p-4 rounded-lg border ${
                      formData.undercut_by === 'Jenny'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Jenny
                  </button>
                </div>
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Game'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}