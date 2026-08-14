// components/layout/PageHeader.tsx
'use client';

import React from 'react';
import { DotsThreeVertical } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useScrollThreshold } from '@/hooks/useScrollThreshold';

export interface PageHeaderOption {
  icon?: React.ReactNode;
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  options?: PageHeaderOption[] | React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  options,
  className = '',
}: PageHeaderProps) {
  const isScrolled = useScrollThreshold(30);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`transition-all duration-300 ease-out origin-left ${
            isScrolled
              ? 'opacity-0 scale-[0.88] -translate-y-3 pointer-events-none'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-0.5 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {actions}

        {/* Kebab menu das opções da página */}
        {Array.isArray(options) && options.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer focus:outline-none"
                aria-label="Mais opções da página"
              >
                <DotsThreeVertical size={22} weight="bold" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 p-1 rounded-2xl shadow-xl border-slate-200 bg-white"
            >
              {options.map((opt, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={opt.action}
                  variant={opt.variant}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                    opt.variant === 'destructive'
                      ? 'text-red-600 focus:text-red-600 focus:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.icon && (
                    <span className="text-base shrink-0">{opt.icon}</span>
                  )}
                  <span>{opt.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!Array.isArray(options) && options}
      </div>
    </div>
  );
}
