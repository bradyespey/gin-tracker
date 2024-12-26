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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Winner
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange({ winner: 'Brady' })}
              className={`px-4 py-2 rounded-lg border ${
                data.winner === 'Brady'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Brady
            </button>
            <button
              type="button"
              onClick={() => handleChange({ winner: 'Jenny' })}
              className={`px-4 py-2 rounded-lg border ${
                data.winner === 'Jenny'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Jenny
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Went First
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange({ went_first: 'Brady' })}
              className={`px-4 py-2 rounded-lg border ${
                data.went_first === 'Brady'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Brady
            </button>
            <button
              type="button"
              onClick={() => handleChange({ went_first: 'Jenny' })}
              className={`px-4 py-2 rounded-lg border ${
                data.went_first === 'Jenny'
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Jenny
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Game End
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange({ knock: false })}
              className={`px-4 py-2 rounded-lg border ${
                !data.knock
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Gin
            </button>
            <button
              type="button"
              onClick={() => handleChange({ knock: true })}
              className={`px-4 py-2 rounded-lg border ${
                data.knock
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Knock
            </button>
          </div>
        </div>

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
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {data.knock && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deadwood Difference
              </label>
              <input
                type="number"
                value={data.deadwood_difference === undefined ? '' : data.deadwood_difference}
                onChange={e => handleChange({ 
                  deadwood_difference: e.target.value === '' ? undefined : parseInt(e.target.value)
                })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Undercut By
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange({ undercut_by: undefined })}
                  className={`px-4 py-2 rounded-lg border ${
                    !data.undercut_by
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ undercut_by: 'Brady' })}
                  className={`px-4 py-2 rounded-lg border ${
                    data.undercut_by === 'Brady'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Brady
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ undercut_by: 'Jenny' })}
                  className={`px-4 py-2 rounded-lg border ${
                    data.undercut_by === 'Jenny'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Jenny
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}