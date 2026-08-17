// components/painel/ferramentas/FurnitureBlueprint.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { FurnitureDimensions } from '@/utils/calculators/drywallFurniture';

interface FurnitureBlueprintProps {
  dimensions: FurnitureDimensions & { name?: string };
}

export function FurnitureBlueprint({ dimensions }: FurnitureBlueprintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { width, height, depth, shelves = 0, dividers = 0 } = dimensions;

    // Escala: vamos usar 1m = 100px (ajustável)
    const scale = 100; // pixels por metro
    const padding = 40;

    // ---- Vista Frontal (elevação) ----
    const startX = padding;
    const startY = padding;
    const w = width * scale;
    const h = height * scale;

    // Desenhar retângulo principal
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, w, h);

    // Preencher com cor clara
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(startX, startY, w, h);

    // Dividir largura se houver divisórias
    if (dividers > 0) {
      const sectionWidth = w / (dividers + 1);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      for (let i = 1; i <= dividers; i++) {
        const x = startX + sectionWidth * i;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + h);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Prateleiras (linhas horizontais)
    if (shelves > 0) {
      const shelfSpacing = h / (shelves + 1);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= shelves; i++) {
        const y = startY + shelfSpacing * i;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + w, y);
        ctx.stroke();
      }
    }

    // Texto com dimensões
    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Largura: ${width}m`, startX + w / 2, startY + h + 20);
    ctx.fillText(`Altura: ${height}m`, startX + w + 10, startY + h / 2 + 5);
    ctx.textAlign = 'left';
    ctx.fillText(`Prof.: ${depth}m`, startX, startY + h + 40);

    // Título
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#00559c';
    ctx.textAlign = 'left';
    ctx.fillText(dimensions.name || 'Móvel Drywall', startX, startY - 10);

    // ---- Vista Superior (planta) ----
    const topStartX = startX + w + 60;
    const topStartY = startY;
    const tw = depth * scale;
    const th = width * scale; // invertido

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(topStartX, topStartY, tw, th);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(topStartX, topStartY, tw, th);

    // Indicar espessura (linhas internas)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Vista Superior', topStartX + tw / 2, topStartY + th + 20);
    ctx.fillText(`Profundidade: ${depth}m`, topStartX + tw / 2, topStartY - 10);
    ctx.fillText(`Largura: ${width}m`, topStartX - 15, topStartY + th / 2 + 5);
  }, [dimensions]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-auto max-w-full"
      />
    </div>
  );
}
