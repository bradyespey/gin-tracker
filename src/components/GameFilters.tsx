import React from 'react';
import type { Game } from '../types/game';

interface GameFiltersProps {
  onFilterChange: (filters: GameFilters) => void;
  filters: GameFilters;
}

export interface GameFilters {
  winner?: 'Brady' | 'Jenny';
  type?: 'Gin' | 'Knock';
  wentFirst?: 'Brady' | 'Jenny';
}

export function GameFilters({ onFilterChange, filters }: GameFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Winner</label>
        <select
          value={filters.winner || ''}
          onChange={(e) => onFilterChange({ ...filters, winner: e.target.value as 'Brady' | 'Jenny' | undefined })}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Brady">Brady</option>
          <option value="Jenny">Jenny</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value as 'Gin' | 'Knock' | undefined })}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Gin">Gin</option>
          <option value="Knock">Knock</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Went First</label>
        <select
          value={filters.wentFirst || ''}
          onChange={(e) => onFilterChange({ ...filters, wentFirst: e.target.value as 'Brady' | 'Jenny' | undefined })}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="">All</option>
          <option value="Brady">Brady</option>
          <option value="Jenny">Jenny</option>
        </select>
      </div>
    </div>
  );
}