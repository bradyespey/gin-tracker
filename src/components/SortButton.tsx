import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function SortButton({ onClick, children }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1 text-slate-400 hover:text-slate-200"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );
}