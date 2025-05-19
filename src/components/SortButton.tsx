//src/components/SortButton.tsx

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  direction?: 'asc' | 'desc';
}

export function SortButton({ onClick, children, active, direction }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1 text-slate-400 hover:text-slate-200"
    >
      <span>{children}</span>
      {active ? (
        direction === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      )}
    </button>
  );
}