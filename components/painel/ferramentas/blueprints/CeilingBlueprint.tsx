// components/painel/ferramentas/blueprints/CeilingBlueprint.tsx
import React, { useMemo } from 'react';
import { ServiceInstance } from '@/hooks/useRoomEditor';

interface CeilingBlueprintProps {
  service: ServiceInstance;
  viewMode: 'estrutura' | 'chapas' | 'ambos';
}

export function CeilingBlueprint({ service, viewMode }: CeilingBlueprintProps) {
  const section = service.measures[0];
  if (!section)
    return <p className="text-slate-400 text-xs">Nenhuma medida cadastrada.</p>;

  const width = section.w;
  const length = section.h; // comprimento
  const offset = service.tiranteOffset ?? 0.6;

  // Cálculo das linhas de F530
  const menor = Math.min(width, length);
  const maior = Math.max(width, length);
  const linesCount = Math.ceil(maior / 0.6) + 1;
  const lines = [];
  for (let i = 0; i < linesCount; i++) {
    const pos = i * 0.6;
    if (pos > maior) break;
    lines.push(pos);
  }

  // Tirantes: a cada 1.2m ao longo das linhas
  const tiranteSpacing = 1.2;
  const tirantes = [];
  for (let i = 0; i < lines.length; i++) {
    const y = lines[i];
    let x = offset;
    while (x < (width < length ? width : length)) {
      tirantes.push({ x, y });
      x += tiranteSpacing;
    }
  }

  return (
    <div className="w-full overflow-auto">
      <svg
        viewBox={`-0.5 -0.5 ${width + 1} ${length + 1}`}
        className="w-full max-h-64 bg-slate-900 rounded border border-slate-700"
        style={{ aspectRatio: width / length }}
      >
        {/* Tabica perimetral */}
        <rect
          x="0"
          y="0"
          width={width}
          height={length}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="0.06"
        />

        {/* Canaletas F530 */}
        {lines.map((pos, idx) => (
          <g key={`f530-${idx}`}>
            <line
              x1="0"
              y1={pos}
              x2={width}
              y2={pos}
              stroke="#22d3ee"
              strokeWidth="0.03"
            />
          </g>
        ))}

        {/* Tirantes */}
        {tirantes.map((t, idx) => (
          <circle
            key={`tir-${idx}`}
            cx={t.x}
            cy={t.y}
            r="0.06"
            fill="#facc15"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>Largura: {width}m</span>
        <span>Comprimento: {length}m</span>
        <span>Offset tirantes: {offset}m</span>
      </div>
    </div>
  );
}
