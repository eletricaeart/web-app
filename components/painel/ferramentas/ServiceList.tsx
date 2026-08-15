// components/painel/ferramentas/ServiceList.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import View from '@/components/layout/View';
import { Wall, HardHat, PencilSimple, Trash } from '@phosphor-icons/react';
import { ServiceInstance } from '@/hooks/useRoomEditor';

interface ServiceListProps {
  services: ServiceInstance[];
  onEdit: (service: ServiceInstance) => void;
  onRemove: (id: string) => void;
}

export function ServiceList({ services, onEdit, onRemove }: ServiceListProps) {
  if (services.length === 0) return null;

  return (
    <View tag="temp-services" className="space-y-3">
      <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
        Serviços no rascunho
      </span>
      {services.map((s) => (
        <div
          key={s.id}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              {s.type === 'wall' && <Wall size={24} />}
              {s.type === 'ceiling' && <HardHat size={24} />}
              {s.type === 'sanca' && <span className="text-2xl">⎔</span>}
            </div>
            <div>
              <div className="font-black text-slate-800 text-xs uppercase">
                {s.tag}
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                {s.totalArea.toFixed(2)} m² | {s.boardType}
                {s.type === 'wall' && ` | ${s.profileSize}mm`}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-indigo-600 bg-indigo-50 rounded-xl"
              onClick={() => onEdit(s)}
            >
              <PencilSimple size={18} weight="bold" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-500 bg-red-50 rounded-xl"
              onClick={() => onRemove(s.id)}
            >
              <Trash size={18} weight="bold" />
            </Button>
          </div>
        </div>
      ))}
    </View>
  );
}
