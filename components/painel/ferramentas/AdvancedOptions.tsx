// components/painel/ferramentas/AdvancedOptions.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CaretDown } from '@phosphor-icons/react';

interface AdvancedOptionsProps {
  boardType: 'ST' | 'RU' | 'RF';
  setBoardType: (value: 'ST' | 'RU' | 'RF') => void;
  profileSize: 48 | 70 | 90;
  setProfileSize: (value: 48 | 70 | 90) => void;
  studSpacing: 0.4 | 0.6;
  setStudSpacing: (value: 0.4 | 0.6) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedOptions({
  boardType,
  setBoardType,
  profileSize,
  setProfileSize,
  studSpacing,
  setStudSpacing,
  isOpen,
  onOpenChange,
}: AdvancedOptionsProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="border rounded-xl p-3 bg-white shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex justify-between text-[12px] font-bold text-indigo-600 uppercase tracking-wide"
        >
          <span>Opções avançadas</span>
          <CaretDown
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
            Tipo de Placa
          </span>
          <div className="flex bg-slate-50 rounded-xl p-1 border gap-1">
            {(['ST', 'RU', 'RF'] as const).map((type) => (
              <Button
                key={type}
                variant={boardType === type ? 'default' : 'outline'}
                onClick={() => setBoardType(type)}
                className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                  boardType === type
                    ? 'bg-[#00559c] text-white'
                    : 'text-slate-400'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
            Perfil (mm)
          </span>
          <div className="flex bg-slate-50 rounded-xl p-1 border gap-1">
            {([48, 70, 90] as const).map((size) => (
              <Button
                key={size}
                variant={profileSize === size ? 'default' : 'outline'}
                onClick={() => setProfileSize(size)}
                className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                  profileSize === size
                    ? 'bg-[#00559c] text-white'
                    : 'text-slate-400'
                }`}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
            Espaçamento Montantes
          </span>
          <div className="flex bg-slate-50 rounded-xl p-1 border gap-1">
            {([0.4, 0.6] as const).map((spacing) => (
              <Button
                key={spacing}
                variant={studSpacing === spacing ? 'default' : 'outline'}
                onClick={() => setStudSpacing(spacing)}
                className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                  studSpacing === spacing
                    ? 'bg-[#00559c] text-white'
                    : 'text-slate-400'
                }`}
              >
                {spacing === 0.4 ? '40cm' : '60cm'}
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
