import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function NewGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [winner, setWinner] = useState<'Brady' | 'Jenny'>('Brady');
  const [wentFirst, setWentFirst] = useState<'Brady' | 'Jenny'>('Brady');
  const [isKnock, setIsKnock] = useState(false);
  const [score, setScore] = useState('');
  const [undercutBy, setUndercutBy] = useState<'Brady' | 'Jenny' | ''>('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-red-600">Please sign in to add new games.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('games').insert([{
        date,
        winner,
        score: parseInt(score),
        went_first: wentFirst,
        knock: isKnock,
        undercut_by: undercutBy || null
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Game</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Winner
          </label>
          <select
            value={winner}
            onChange={(e) => setWinner(e.target.value as 'Brady' | 'Jenny')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
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
            value={wentFirst}
            onChange={(e) => setWentFirst(e.target.value as 'Brady' | 'Jenny')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="Brady">Brady</option>
            <option value="Jenny">Jenny</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isKnock}
              onChange={(e) => setIsKnock(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Knock</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Score
          </label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            min="0"
          />
        </div>

        {isKnock && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Undercut By
            </label>
            <select
              value={undercutBy}
              onChange={(e) => setUndercutBy(e.target.value as 'Brady' | 'Jenny' | '')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">No Undercut</option>
              <option value="Brady">Brady</option>
              <option value="Jenny">Jenny</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Game'}
        </button>
      </form>
    </div>
  );
}