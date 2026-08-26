// components/painel/ferramentas/eletrica/EletricalBlueprint.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import {
  AmbienteEletrico,
  ProfileSegment,
  SpotPoint,
} from '@/utils/calculators/eletricaProfileSpots';

interface EletricalBlueprintProps {
  ambiente: AmbienteEletrico;
}

export function EletricalBlueprint({ ambiente }: EletricalBlueprintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const scale = 100; // pixels por metro
    const w = ambiente.width * scale;
    const h = ambiente.height * scale;

    const startX = padding;
    const startY = padding;

    // Desenhar contorno do ambiente
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, startY, w, h);

    // ---- Desenhar Perfis de LED ----
    if (ambiente.profiles && ambiente.profiles.length > 0) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);

      // Simplificação: posicionar os perfis ao longo das paredes
      // Cada perfil tem um comprimento, vamos distribuí-los
      let currentX = startX + 10;
      let currentY = startY + 10;
      ambiente.profiles.forEach((profile, idx) => {
        const lengthPx = profile.length * scale;
        // Alternar entre horizontal e vertical
        if (idx % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(currentX + lengthPx, currentY);
          ctx.stroke();
          // Legenda
          ctx.fillStyle = '#f59e0b';
          ctx.font = '10px sans-serif';
          ctx.fillText(
            `${profile.ledType} ${profile.ledDensity}LED`,
            currentX,
            currentY - 5,
          );
          currentX += lengthPx + 20;
        } else {
          ctx.beginPath();
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(currentX, currentY + lengthPx);
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.font = '10px sans-serif';
          ctx.fillText(
            `${profile.ledType}`,
            currentX + 5,
            currentY + lengthPx / 2,
          );
          currentY += lengthPx + 20;
        }
      });
      ctx.setLineDash([]);
    }

    // ---- Desenhar Spots ----
    if (ambiente.spots && ambiente.spots.length > 0) {
      ambiente.spots.forEach((spot) => {
        const x = startX + spot.x * scale;
        const y = startY + spot.y * scale;
        const radius = (spot.diameter / 2) * (scale / 100); // converter cm para escala

        // Círculo do spot
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle =
          spot.color === 'branco'
            ? '#ffffff'
            : spot.color === 'preto'
              ? '#1a1a1a'
              : spot.color === 'cromo'
                ? '#b0b0b0'
                : '#d4af37';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Símbolo do tipo
        ctx.fillStyle = '#1e293b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol =
          spot.type === 'embutido' ? '⬤' : spot.type === 'sobrepor' ? '⏺' : '⌃';
        ctx.fillText(symbol, x, y);

        // Legenda
        ctx.fillStyle = '#64748b';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${spot.diameter}cm`, x, y + radius + 4);
      });
    }

    // Legendas
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(ambiente.name, startX, startY - 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Largura: ${ambiente.width}m`, startX + 10, startY + h + 10);
    ctx.fillText(
      `Altura: ${ambiente.height}m`,
      startX + w - 80,
      startY + h + 10,
    );
  }, [ambiente]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto max-w-full"
      />
    </div>
  );
}
