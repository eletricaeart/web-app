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
          style={{ border: '2px solid #00559c !important' }}
          className="sssc fixed bottom-0 left-0 right-0 z-55 bg-[#e5e5e5_!important] rounded-[2rem_2rem_0_0_!important] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center justify-between active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
              <Wallet size={20} weight="duotone" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#00559c]">Investimento</p>
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

      <DrawerContent className="max-h-[85vh] rounded-t-[2rem_!important] bg-[#e5e5e5] shadow-2xl">
        <DrawerHeader className="text-center pb-3">
          <DrawerTitle className="flex flex-col items-center gap-1 text-amber-400">
            <Wallet size={26} weight="duotone" />
            <span className="text-xl font-black">Investimento</span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-8">
          <p className="text-xs text-slate-500 mb-4 text-center">
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
