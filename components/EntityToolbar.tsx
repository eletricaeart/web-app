// components/EntityToolbar.tsx
'use client';

import React from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import './SearchBar.css';

interface EntityToolbarProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  // Propriedades do Botão Dinâmico
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  showAction?: boolean;
  className?: string;
}

export default function EntityToolbar({
  placeholder = 'Buscar...',
  searchValue,
  onSearchChange,
  actionIcon,
  onActionClick,
  showAction = false,
  className = '',
}: EntityToolbarProps) {
  return (
    <div
      className={`w-full flex items-center justify-center gap-2.5 ${className}`}
    >
      <div className="ifood-search-wrapper shadow-xs flex-1 bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <MagnifyingGlass
          size={18}
          weight="bold"
          className="text-slate-400 shrink-0"
        />
        <input
          type="text"
          className="search-input w-full bg-transparent border-none outline-none text-slate-800 text-sm placeholder:text-slate-400 font-medium"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          spellCheck="false"
          autoComplete="off"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Limpar busca"
          >
            <X size={15} weight="bold" />
          </button>
        )}
      </div>

      {showAction && (
        <div
          onClick={onActionClick}
          className="flex items-center justify-center text-slate-600 bg-white border border-slate-200/80 w-11 h-11 rounded-2xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none"
        >
          {actionIcon}
        </div>
      )}
    </div>
  );
}
