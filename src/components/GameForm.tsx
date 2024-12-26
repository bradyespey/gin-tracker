import React from 'react';
import type { GameFormData } from '../types/game';

interface GameFormProps {
  data: GameFormData;
  onChange: (updates: Partial<GameFormData>) => void;
  showRemove?: boolean;
  onRemove?: () => void;
}

export function GameForm({ data, onChange, showRemove, onRemove }: GameFormProps) {
  const handleChange = (updates: Partial<GameFormData>) => {
    if ('knock' in updates) {
      if (updates.knock) {
        onChange({
          ...updates,
          score: undefined,
          deadwood_difference: 0
        });
      } else {
        onChange({
          ...updates,
          score: data.score || 25,
          deadwood_difference: undefined,
          undercut_by: undefined
        });
      }
    } else {
      onChange(updates);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6 border border-slate-700/50">
      {showRemove && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-200">Game Entry</h3>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date field */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date
          </label>
          <input
            type="date"
            value={data.date}
            onChange={e => handleChange({ date: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Other fields remain the same... */}

        {!data.knock && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Score
            </label>
            <input
              type="number"
              value={data.score === undefined ? '' : data.score}
              onChange={e => {
                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                handleChange({ score: value });
              }}
              min={25}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Rest of the fields remain the same... */}
      </div>
    </div>
  );
}