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
    } else if ('undercut_by' in updates && data.knock) {
      // Preserve knock state when updating undercut
      onChange({
        ...updates,
        knock: true
      });
    } else {
      onChange(updates);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6 border border-slate-700/50">
      {/* Rest of the component remains the same */}
    </div>
  );
}