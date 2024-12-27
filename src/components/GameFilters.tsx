import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { Game } from '../types/game';

interface GameFiltersProps {
  onFilterChange: (filters: GameFilters) => void;
  onReset: () => void;
  filters: GameFilters;
}

export interface GameFilters {
  winner?: 'Brady' | 'Jenny';
  type?: 'Gin' | 'Knock' | 'Knock + Undercut';
  wentFirst?: 'Brady' | 'Jenny';
}

export function GameFilters({ onFilterChange, onReset, filters }: GameFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Winner</label>
        <select
          value={filters.winner || ''}
          onChange={(e) => onFilterChange({ ...filters, winner: e.target.value as 'Brady' | 'Jenny' | undefined })}
          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Brady">Brady</option>
          <option value="Jenny">Jenny</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value as 'Gin' | 'Knock' | 'Knock + Undercut' | undefined })}
          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Gin">Gin</option>
          <option value="Knock">Knock</option>
          <option value="Knock + Undercut">Knock + Undercut</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Went First</label>
        <select
          value={filters.wentFirst || ''}
          onChange={(e) => onFilterChange({ ...filters, wentFirst: e.target.value as 'Brady' | 'Jenny' | undefined })}
          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Brady">Brady</option>
          <option value="Jenny">Jenny</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        title="Reset filters"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}