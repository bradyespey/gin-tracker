//src/pages/Dashboard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { GameList } from '../components/GameList';
import { calculateStats } from '../lib/gameLogic';
import { fetchGames } from '../services/gameService';
import { fetchMockGames } from '../services/demoGameService';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/numberFormat';
import { triggerSync } from '../lib/syncManager';
import type { Game, Stats } from '../types/game';

export function Dashboard() {
  const { user, isDemo } = useAuth();
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
    if (isDemo) {
      const { data, error } = await fetchMockGames();
      if (error) {
        console.error('Error fetching mock games:', error);
        return;
      }
      setGames(data);
      setStats(calculateStats(data));
      return;
    }
    
    // Only fetch real games if authenticated
    const { data, error } = await fetchGames();
    if (error) {
      // Suppress permission errors in demo/public mode
      if (error.message?.includes('permission') || error.message?.includes('Missing or insufficient')) {
        console.warn('Firestore permission error (expected in demo mode):', error);
        return;
      }
      console.error('Error fetching games:', error);
      return;
    }
    setGames(data);
    setStats(calculateStats(data));
  }, [isDemo]);

  useEffect(() => {
    loadGames();
    // Try to sync any pending games when component mounts, only if not in demo mode
    if (!isDemo) {
      triggerSync();
    }
  }, [loadGames, isDemo]);

  // Listen for games updated event
  useEffect(() => {
    const handleGamesUpdated = () => {
      loadGames();
    };
    window.addEventListener('gamesUpdated', handleGamesUpdated);
    return () => window.removeEventListener('gamesUpdated', handleGamesUpdated);
  }, [loadGames]);

  if (!user && !isDemo) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">Welcome to Gin Rummy Tracker</h1>
        <p className="text-slate-300 mb-8">Please sign in to view and manage games.</p>
      </div>
    );
  }

  const p1Name = isDemo ? 'User 1' : 'Brady';
  const p2Name = isDemo ? 'User 2' : 'Jenny';

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-center text-sm">
            <strong>Demo Mode Enabled:</strong> You are viewing mock data. Changes will not be saved.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overall Score</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{p1Name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.bradyScore)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{p2Name}</p>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{p1Name} Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.bradyWins)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{p2Name} Wins</p>
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
        <GameList games={games} onUpdate={loadGames} isDemo={isDemo} />
      </div>
    </div>
  );
}