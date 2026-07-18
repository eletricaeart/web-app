// components/EntitySortFilter.tsx
"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Funnel, SortAscending } from "@phosphor-icons/react";

interface FilterOption {
  label: string;
  value: string;
}

interface EntitySortFilterProps {
  sortOptions: FilterOption[];
  currentSort: string;
  onSortChange: (value: string) => void;

  filterOptions?: FilterOption[];
  currentFilter?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
}

export default function EntitySortFilter({
  sortOptions,
  currentSort,
  onSortChange,
  filterOptions,
  currentFilter,
  onFilterChange,
  filterLabel = "Filtrar por",
}: EntitySortFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center p-3 bg-white text-slate-600 rounded-2xl shadow-sm active:scale-90 transition-transform cursor-pointer">
          <Funnel size={20} weight="duotone" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white rounded-2xl shadow-2xl border-none p-2">
        <DropdownMenuLabel className="flex items-center gap-2 text-indigo-600">
          <SortAscending size={18} /> Ordenar por
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={onSortChange}
        >
          {sortOptions.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={opt.value}
              className="rounded-lg"
            >
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {filterOptions && onFilterChange && (
          <>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuLabel className="flex items-center gap-2 text-indigo-600">
              <Funnel size={18} /> {filterLabel}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentFilter}
              onValueChange={onFilterChange}
            >
              {filterOptions.map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg"
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
