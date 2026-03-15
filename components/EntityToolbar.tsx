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
    <View tag="toolbar" className="flex items-center bg-[#f5f5f5] flex-1">
      <View
        tag="toolbar-contents"
        className="sticky top-0 z-[100] flex flex-1 items-center justify-center gap-3 px-[1rem] py-[12px]"
      >
        <View tag="searchbar" className="ifood-search-wrapper shadow-sm">
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
        </View>

        {showAction && (
          <View
            tag="btn-toolbar"
            onClick={onActionClick}
            className="flex items-center justify-center text-slate-600 rounded-2xl shadow-sm active:scale-90 transition-transform"
          >
            {actionIcon}
          </View>
        )}
      </View>
    </View>
  );
}
