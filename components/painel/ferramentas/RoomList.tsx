// components/painel/ferramentas/RoomList.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import View from '@/components/layout/View';
import {
  Wall,
  HardHat,
  PencilSimple,
  Trash,
  CaretDown,
} from '@phosphor-icons/react';
import { Room } from '@/hooks/useRoomEditor';

interface RoomListProps {
  rooms: Room[];
  roomMaterials: Record<string, any[]>;
  onEditRoom: (room: Room) => void;
  onRemoveRoom: (id: string) => void;
}

export function RoomList({
  rooms,
  roomMaterials,
  onEditRoom,
  onRemoveRoom,
}: RoomListProps) {
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  return (
    <View tag="listagem-de-ambientes" className="space-y-6 mb-12">
      {rooms.map((room) => (
        <View
          key={room.id}
          className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500" />
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm font-black text-indigo-900 uppercase tracking-tighter">
              {room.name}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                onClick={() => onEditRoom(room)}
              >
                <PencilSimple size={18} weight="bold" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                onClick={() => onRemoveRoom(room.id)}
              >
                <Trash size={18} weight="bold" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 mb-3">
            {room.services.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <div className="text-xs font-black capitalize text-indigo-400 mb-1 flex items-center gap-1">
                    {s.type === 'wall' && <Wall size={12} />}
                    {s.type === 'ceiling' && <HardHat size={12} />}
                    {s.type === 'sanca' && <span className="text-lg">⎔</span>}
                    {s.type === 'wall'
                      ? 'Parede'
                      : s.type === 'ceiling'
                        ? 'Forro'
                        : 'Sanca'}
                    {s.useInsulation && (
                      <span className="bg-emerald-100 text-emerald-700 px-1 rounded ml-1 text-[9px]">
                        C/ LÃ
                      </span>
                    )}
                    <span className="bg-slate-200 text-slate-600 px-1 rounded ml-1 text-[9px]">
                      {s.boardType}
                    </span>
                    {s.type === 'wall' && (
                      <span className="bg-slate-200 text-slate-600 px-1 rounded ml-1 text-[9px]">
                        {s.profileSize}mm
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-700 text-sm">
                    {s.tag}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    {s.totalArea.toFixed(2)} m²
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {s.type === 'sanca'
                      ? 'perímetro'
                      : s.measures.length > 1
                        ? 'seções'
                        : 'seção'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setExpandedRoomId(expandedRoomId === room.id ? null : room.id)
            }
            className="w-full flex items-center justify-between text-[11px] font-bold text-indigo-500 uppercase tracking-widest py-2"
          >
            Materiais deste ambiente
            <CaretDown
              size={14}
              weight="bold"
              className={`transition-transform ${expandedRoomId === room.id ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedRoomId === room.id && (
            <div className="bg-indigo-50/50 rounded-xl p-3 space-y-2 mt-1">
              {(roomMaterials[room.id] || []).map((m, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-slate-600">{m.item}</span>
                  <span className="font-bold text-indigo-700">
                    {m.qtd} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </View>
      ))}
    </View>
  );
}
