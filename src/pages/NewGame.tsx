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

  // Rest of the component remains the same...
}