// components/painel/ferramentas/ServiceTypeSelector.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wall, HardHat } from '@phosphor-icons/react';

type ServiceType = 'wall' | 'ceiling' | 'sanca';

interface ServiceTypeSelectorProps {
  value: ServiceType;
  onChange: (type: ServiceType) => void;
}

export function ServiceTypeSelector({
  value,
  onChange,
}: ServiceTypeSelectorProps) {
  return (
    <div className="flex bg-white rounded-xl p-1 border gap-1">
      {(['wall', 'ceiling', 'sanca'] as const).map((type) => (
        <Button
          key={type}
          variant={value === type ? 'default' : 'outline'}
          onClick={() => onChange(type)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-bold uppercase transition-all ${
            value === type ? 'bg-[#00559c] text-white' : 'text-slate-400'
          }
               ${type === 'wall' ? 'rounded-[.9rem_.2rem_.2rem_.9rem]' : ''}
               ${type === 'ceiling' ? 'rounded-[.2rem]' : ''}
               ${type === 'sanca' ? 'rounded-[.2rem_.9rem_.9rem_.2rem]' : ''}`}
        >
          {type === 'wall' && <Wall size={18} />}
          {type === 'ceiling' && <HardHat size={18} />}
          {type === 'sanca' && <span className="text-lg">⎔</span>}
          {type === 'wall' ? 'Parede' : type === 'ceiling' ? 'Forro' : 'Sanca'}
        </Button>
      ))}
    </div>
  );
}
