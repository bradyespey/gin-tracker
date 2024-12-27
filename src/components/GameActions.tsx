import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface GameActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  showConfirm: boolean;
  onCancelDelete: () => void;
}

export function GameActions({ onEdit, onDelete, showConfirm, onCancelDelete }: GameActionsProps) {
  if (showConfirm) {
    return (
      <div className="inline-flex items-center space-x-2">
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-400 text-sm font-medium"
        >
          Confirm
        </button>
        <button
          onClick={onCancelDelete}
          className="text-slate-400 hover:text-slate-300 text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-x-2">
      <button
        onClick={onEdit}
        className="text-slate-400 hover:text-slate-300"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onCancelDelete}
        className="text-slate-400 hover:text-slate-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}