// components/painel/ferramentas/MaterialSummary.tsx
'use client';

import React from 'react';
import View from '@/components/layout/View';
import { Package } from '@phosphor-icons/react';

interface MaterialSummaryProps {
  materials: { item: string; qtd: number; unit: string }[];
}

export function MaterialSummary({ materials }: MaterialSummaryProps) {
  if (materials.length === 0) return null;

  return (
    <View className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
          <Package size={18} weight="bold" /> Lista Total de Materiais
        </h2>
      </div>
      <div className="space-y-4">
        {materials.map((item, idx) => (
          <View
            key={idx}
            className="flex justify-between items-center border-b border-b-emerald-100 pb-3 last:border-0"
          >
            <span className="text-slate-700 text-sm font-medium">
              {item.item}
            </span>
            <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
              {item.qtd} <small className="text-[12px]">{item.unit}</small>
            </span>
          </View>
        ))}
      </div>
    </View>
  );
}
