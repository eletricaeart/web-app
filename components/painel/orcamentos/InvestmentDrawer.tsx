// components/painel/orcamentos/InvestmentDrawer.tsx
'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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

export default function InvestmentDrawer({
  categories,
  onChange,
  legacyClauseTotal = 0,
}: InvestmentDrawerProps) {
  const total = getInvestmentTotal(categories) + legacyClauseTotal;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-5 py-3 flex items-center justify-between active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
              <Wallet size={20} weight="duotone" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Investimento</p>
              <p className="text-xs text-slate-400">
                {categories.length === 0
                  ? 'Nenhuma categoria definida'
                  : `${categories.length} categoria${categories.length > 1 ? 's' : ''} • ${formatCurrency(total)}`}
              </p>
            </div>
          </div>
          <CaretUp size={18} weight="bold" className="text-slate-400" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-indigo-900">
            <Wallet size={20} weight="duotone" /> Investimento
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-8">
          <p className="text-xs text-slate-400 mb-4">
            Defina o valor de cada categoria de serviço. Depois, use "+
            Adicionar Seção" na lista de cláusulas para inserir o texto gerado
            onde você quiser no orçamento.
          </p>
          <InvestmentCategoryEditor
            categories={categories}
            onChange={onChange}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
