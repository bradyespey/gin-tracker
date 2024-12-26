import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Import } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GameList } from '../components/GameList';
import { calculateStats } from '../lib/gameLogic';
import type { Game, Stats } from '../types/game';

export function Dashboard() {
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

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching games:', error);
        return;
      }

      setGames(data);
      setStats(calculateStats(data));
    }

    fetchGames();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overall Score</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brady</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bradyScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jenny</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.jennyScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Game Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGames}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brady Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bradyWins}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jenny Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.jennyWins}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}</p>
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

      <div className="flex gap-4">
        <Link
          to="/gin/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Game
        </Link>
        <Link
          to="/gin/import"
          className="inline-flex items-center px-4  py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Import className="h-5 w-5 mr-2" />
          Import Games
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Games</h2>
        <GameList games={games} />
      </div>
    </div>
  );
}