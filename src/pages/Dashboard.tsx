//src/pages/Dashboard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { GameList } from '../components/GameList';
import { calculateStats } from '../lib/gameLogic';
import { fetchGames } from '../services/gameService';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/numberFormat';
import { triggerSync } from '../lib/syncManagerFirebase';
import type { Game, Stats } from '../types/game';

export function Dashboard() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<Stats>({
    bradyScore: 0,
    jennyScore: 0,
    totalGames: 0,
    bradyWins: 0,
    jennyWins: 0,
    averageScore: 0,
    ginPercentage: 0,
    knockPercentage: 0,
    undercutPercentage: 0,
  });

  const loadGames = useCallback(async () => {
    const { data, error } = await fetchGames();
    if (error) {
      console.error('Error fetching games:', error);
      return;
    }
    setGames(data);
    setStats(calculateStats(data));
  }, []);

  useEffect(() => {
    loadGames();
    // Try to sync any pending games when component mounts
    triggerSync();
  }, [loadGames]);

  // Listen for games updated event
  useEffect(() => {
    const handleGamesUpdated = () => {
      loadGames();
    };
    window.addEventListener('gamesUpdated', handleGamesUpdated);
    return () => window.removeEventListener('gamesUpdated', handleGamesUpdated);
  }, [loadGames]);

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">Welcome to Gin Rummy Tracker</h1>
        <p className="text-slate-300 mb-8">Please sign in to view and manage games.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overall Score</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brady</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.bradyScore)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jenny</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.jennyScore)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Game Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalGames)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brady Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.bradyWins)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jenny Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.jennyWins)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.averageScore)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gin %</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ginPercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Knock %</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.knockPercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Undercut %</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.undercutPercentage}%</p>
          </div>
        </div>
      </div>

      <div>
        <Link
          to="/gin/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Game
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Games</h2>
        <GameList games={games} onUpdate={loadGames} />
      </div>
    </div>
  );
}