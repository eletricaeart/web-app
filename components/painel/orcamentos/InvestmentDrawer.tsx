// components/painel/orcamentos/InvestmentDrawer.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Wallet, CaretUp } from '@phosphor-icons/react';
import InvestmentCategoryEditor from './InvestmentCategoryEditor';
import {
  InvestmentCategory,
  getInvestmentTotal,
  formatCurrency,
} from '@/lib/types/investment';

interface InvestmentDrawerProps {
  categories: InvestmentCategory[];
  onChange: (categories: InvestmentCategory[]) => void;
  legacyClauseTotal?: number;
}

export const PEEK_HEIGHT = 84; // px — altura da barra sempre visível

export default function InvestmentDrawer({
  categories,
  onChange,
  legacyClauseTotal = 0,
}: InvestmentDrawerProps) {
  const total = getInvestmentTotal(categories) + legacyClauseTotal;
  const [expanded, setExpanded] = useState(false);

  const dragState = useRef<{ startY: number; dragging: boolean } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragState.current = { startY: e.clientY, dragging: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const delta = dragState.current.startY - e.clientY;

    if (Math.abs(delta) > 8) {
      dragState.current.dragging = true;
    }

    if (delta > 40 && !expanded) {
      setExpanded(true);
      dragState.current = null;
    } else if (delta < -40 && expanded) {
      setExpanded(false);
      dragState.current = null;
    }
  };

  const handlePointerUp = () => {
    // Se não houve arraste significativo, trata como toque simples (alterna)
    if (dragState.current && !dragState.current.dragging) {
      setExpanded((prev) => !prev);
    }
    dragState.current = null;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-[#e5e5e5] dark:bg-slate-800 rounded-t-[2rem] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] flex flex-col"
      style={{
        maxHeight: expanded ? '85vh' : `${PEEK_HEIGHT}px`,
        transition: 'max-height 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* --- BARRA "PEEK" SEMPRE VISÍVEL, TOCÁVEL E ARRASTÁVEL --- */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="shrink-0 px-5 pt-2 pb-3 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ height: PEEK_HEIGHT }}
      >
        <span className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-2 rounded-xl">
              <Wallet size={20} weight="duotone" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#00559c] dark:text-sky-300">
                Investimento
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                {categories.length === 0
                  ? 'Nenhuma categoria definida'
                  : `${categories.length} categoria${categories.length > 1 ? 's' : ''} • ${formatCurrency(total)}`}
              </p>
            </div>
          </div>
          <CaretUp
            size={18}
            weight="bold"
            className={`text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* --- CORPO, ANIMANDO A ALTURA JUNTO COM O CONTAINER --- */}
      <div
        className="overflow-y-auto px-4 pb-8"
        style={{
          opacity: expanded ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: expanded ? 'auto' : 'none',
        }}
      >
        <div className="text-center pt-1 pb-4">
          <Wallet
            size={26}
            weight="duotone"
            className="mx-auto text-amber-400 mb-1"
          />
          <span className="text-xl font-black text-amber-400">
            Investimento
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">
          Defina o valor de cada categoria de serviço. Depois, use "+ Adicionar
          Seção" na lista de cláusulas para inserir o texto gerado onde você
          quiser no orçamento.
        </p>

        <InvestmentCategoryEditor categories={categories} onChange={onChange} />
      </div>
    </div>
  );
}
