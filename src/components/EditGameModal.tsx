//src/components/EditGameModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { GameForm } from './GameForm';
import type { GameFormData } from '../types/game';

interface EditGameModalProps {
  formData: GameFormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (updates: Partial<GameFormData>) => void;
  loading: boolean;
}

export function EditGameModal({ formData, onClose, onSave, onChange, loading }: EditGameModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Edit Game</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <GameForm
          data={formData}
          onChange={onChange}
        />

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}