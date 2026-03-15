// components/EntityToolbar.tsx
"use client";

import React from "react";
import View from "./layout/View";
import { MagnifyingGlass } from "@phosphor-icons/react";
import "./SearchBar.css"; // Reutilizando seu CSS de busca

interface EntityToolbarProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  // Propriedades do Botão Dinâmico
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  showAction?: boolean;
}

export default function EntityToolbar({
  placeholder = "Buscar...",
  searchValue,
  onSearchChange,
  actionIcon,
  onActionClick,
  showAction = false,
}: EntityToolbarProps) {
  return (
    <View
      tag="toolbar-container"
      className="flex items-center bg-[#f5f5f5] pr-4"
    >
      <div className="flex-1">
        <View tag="toolbar" className="search-bar-container">
          <div className="ifood-search-wrapper">
            <MagnifyingGlass
              size={20}
              weight="duotone"
              className="ifood-search-icon"
            />
            <input
              type="text"
              className="search-input"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        </View>
      </div>

      {showAction && (
        <View
          tag="btn-action"
          onClick={onActionClick}
          className="flex items-center justify-center p-3 bg-white text-slate-600 rounded-2xl shadow-sm active:scale-90 transition-transform"
        >
          {actionIcon}
        </View>
      )}
    </View>
  );
}
