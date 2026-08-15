// components/painel/ferramentas/MeasureInput.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import View from '@/components/layout/View';
import { Plus, Trash } from '@phosphor-icons/react';
import { Opening } from '@/hooks/useRoomEditor';
import { OpeningList } from './OpeningList';

type ServiceType = 'wall' | 'ceiling' | 'sanca';

interface MeasureInputProps {
  type: ServiceType;
  measures: { w: number; h: number; openings: Opening[] }[];
  setMeasures: (measures: any) => void;
  // Para sanca
  perimeter?: number;
  setPerimeter?: (val: number) => void;
  height?: number;
  setHeight?: (val: number) => void;
  // Funções de abertura (apenas wall)
  addOpening?: (measureIndex: number, type: 'door' | 'window') => void;
  updateOpening?: (
    mIdx: number,
    oIdx: number,
    field: 'w' | 'h',
    val: number,
  ) => void;
  removeOpening?: (mIdx: number, oIdx: number) => void;
}

export function MeasureInput({
  type,
  measures,
  setMeasures,
  perimeter,
  setPerimeter,
  height,
  setHeight,
  addOpening,
  updateOpening,
  removeOpening,
}: MeasureInputProps) {
  if (type === 'sanca') {
    return (
      <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
        <label>
          <span className="text-[10px] font-bold text-slate-400">
            Perímetro (m)
          </span>
          <Input
            type="number"
            placeholder="0.00"
            value={perimeter || ''}
            onChange={(e) =>
              setPerimeter && setPerimeter(parseFloat(e.target.value) || 0)
            }
          />
        </label>
        <label>
          <span className="text-[10px] font-bold text-slate-400">
            Altura (m)
          </span>
          <Input
            type="number"
            placeholder="0.00"
            value={height || ''}
            onChange={(e) =>
              setHeight && setHeight(parseFloat(e.target.value) || 0)
            }
          />
        </label>
      </div>
    );
  }

  const addMeasure = () => {
    setMeasures([...measures, { w: 0, h: 0, openings: [] }]);
  };

  const updateMeasure = (index: number, field: 'w' | 'h', value: number) => {
    const newMeasures = [...measures];
    newMeasures[index][field] = value;
    setMeasures(newMeasures);
  };

  const removeMeasure = (index: number) => {
    if (measures.length <= 1) return;
    const newMeasures = measures.filter((_, i) => i !== index);
    setMeasures(newMeasures);
  };

  return (
    <View className="space-y-4">
      <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
        Medidas
      </span>
      <div className="flex flex-col space-y-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
        {measures.map((m, mIdx) => (
          <div key={mIdx} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="text-[10px] font-bold text-slate-400 capitalize">
                  Largura (m)
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={m.w || ''}
                  onChange={(e) =>
                    updateMeasure(mIdx, 'w', parseFloat(e.target.value) || 0)
                  }
                />
              </label>
              <label>
                <span className="text-[10px] font-bold text-slate-400 capitalize">
                  {type === 'wall' ? 'Altura (m)' : 'Comprimento (m)'}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={m.h || ''}
                  onChange={(e) =>
                    updateMeasure(mIdx, 'h', parseFloat(e.target.value) || 0)
                  }
                />
              </label>
            </div>

            {type === 'wall' &&
              addOpening &&
              updateOpening &&
              removeOpening && (
                <OpeningList
                  measureIndex={mIdx}
                  openings={m.openings}
                  addOpening={addOpening}
                  updateOpening={updateOpening}
                  removeOpening={removeOpening}
                />
              )}

            {measures.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 text-[10px] uppercase font-bold h-6"
                onClick={() => removeMeasure(mIdx)}
              >
                <Trash size={12} className="mr-1" /> Remover seção
              </Button>
            )}
            {mIdx < measures.length - 1 && (
              <div className="border-b border-slate-50 my-2" />
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={addMeasure}
          className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl mt-2"
        >
          <Plus size={14} className="mr-1" /> Adicionar seção
        </Button>
      </div>
    </View>
  );
}
