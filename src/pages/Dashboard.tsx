import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { GameList } from '../components/GameList';
import { calculateStats } from '../lib/gameLogic';
import { fetchGames } from '../services/gameService';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/numberFormat';
import type { Game, Stats } from '../types/game';

// ... rest of the file stays the same, just update the stats display to use formatNumber:

<div>
  <p className="text-sm text-gray-500 dark:text-gray-400">Brady</p>
  <p className="text-2xl font-bold text-gray-900 dark:text-white">
    {formatNumber(stats.bradyScore)}
  </p>
</div>
<div>
  <p className="text-sm text-gray-500 dark:text-gray-400">Jenny</p>
  <p className="text-2xl font-bold text-gray-900 dark:text-white">
    {formatNumber(stats.jennyScore)}
  </p>
</div>