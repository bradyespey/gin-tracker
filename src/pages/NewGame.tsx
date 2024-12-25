import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthGuard } from '../components/AuthGuard';

export function NewGame() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [winner, setWinner] = useState<'Brady' | 'Jenny'>('Brady');
  const [wentFirst, setWentFirst] = useState<'Brady' | 'Jenny'>('Brady');
  const [isKnock, setIsKnock] = useState(false);
  const [score, setScore] = useState('');
  const [undercutBy, setUndercutBy] = useState<'Brady' | 'Jenny' | ''>('');
  const [loading, setLoading] = useState(false);

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
    <AuthGuard>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rest of the form content remains the same */}
        </form>
      </div>
    </AuthGuard>
  );
}