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
  const [formData, setFormData] = useState<GameFormData>({
    date: getLocalDate(),
    winner: 'Brady',
    went_first: 'Brady',
    knock: false,
    score: 25
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
      const { error } = await supabase.from('games').insert([{
        date: formData.date,
        winner: formData.winner,
        went_first: formData.went_first,
        knock: formData.knock,
        score: formData.knock ? (formData.deadwood_difference || 0) : (formData.score || 25),
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <GameForm 
            data={formData}
            onChange={updates => setFormData(prev => ({ ...prev, ...updates }))}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Game'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}