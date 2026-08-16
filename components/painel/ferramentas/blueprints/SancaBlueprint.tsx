// components/painel/ferramentas/blueprints/SancaBlueprint.tsx
import React from 'react';
import { ServiceInstance } from '@/hooks/useRoomEditor';

export function SancaBlueprint({ service }: { service: ServiceInstance }) {
  const perimeter = service.perimeter || 0;
  const height = service.height || 0;
  return (
    <div className="text-center p-4">
      <div className="text-purple-400 text-2xl mb-2">⎔</div>
      <div className="text-xs text-slate-400">
        Sanca com perímetro {perimeter}m e altura {height}m
      </div>
      <div className="text-xs text-slate-500">
        Área: {(perimeter * height).toFixed(2)} m²
      </div>
    </div>
  );
}
