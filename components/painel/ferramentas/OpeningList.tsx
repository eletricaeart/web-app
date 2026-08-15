// components/painel/ferramentas/OpeningList.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Door, Browser, Trash } from '@phosphor-icons/react';
import { Opening } from '@/hooks/useRoomEditor';

interface OpeningListProps {
  measureIndex: number;
  openings: Opening[];
  addOpening: (measureIndex: number, type: 'door' | 'window') => void;
  updateOpening: (
    mIdx: number,
    oIdx: number,
    field: 'w' | 'h',
    val: number,
  ) => void;
  removeOpening: (mIdx: number, oIdx: number) => void;
}

export function OpeningList({
  measureIndex,
  openings,
  addOpening,
  updateOpening,
  removeOpening,
}: OpeningListProps) {
  return (
    <div className="space-y-2 mt-2 px-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-orange-500 capitalize">
          Descontar Vãos
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-bold border-orange-200 text-orange-600"
            onClick={() => addOpening(measureIndex, 'door')}
          >
            <Door size={14} className="mr-1" /> Porta
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-bold border-blue-200 text-blue-600"
            onClick={() => addOpening(measureIndex, 'window')}
          >
            <Browser size={14} className="mr-1" /> Janela
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {openings.map((o, oIdx) => (
          <div
            key={o.id}
            className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-right-2"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 w-4">
              {o.type === 'door' ? 'P' : 'J'}
            </span>
            <Input
              className="h-8 text-[12px]"
              type="number"
              placeholder="L"
              value={o.w || ''}
              onChange={(e) =>
                updateOpening(
                  measureIndex,
                  oIdx,
                  'w',
                  parseFloat(e.target.value),
                )
              }
            />
            <Input
              className="h-8 text-[12px]"
              type="number"
              placeholder="A"
              value={o.h || ''}
              onChange={(e) =>
                updateOpening(
                  measureIndex,
                  oIdx,
                  'h',
                  parseFloat(e.target.value),
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 bg-red-50 rounded-full"
              onClick={() => removeOpening(measureIndex, oIdx)}
            >
              <Trash size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
