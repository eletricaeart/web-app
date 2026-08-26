// components/painel/ferramentas/eletrica/InteractiveBlueprint.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ProfileSegment,
  SpotPoint,
} from '@/utils/calculators/eletricaProfileSpots';

interface InteractiveBlueprintProps {
  width: number; // largura do ambiente (metros)
  height: number; // altura do ambiente (metros)
  profiles: ProfileSegment[];
  spots: SpotPoint[];
  onUpdate: (profiles: ProfileSegment[], spots: SpotPoint[]) => void;
  readOnly?: boolean;
}

type InteractionMode = 'spot' | 'profile';

export function InteractiveBlueprint({
  width,
  height,
  profiles,
  spots,
  onUpdate,
  readOnly = false,
}: InteractiveBlueprintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<InteractionMode>('spot');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const scale = 80; // pixels por metro
  const padding = 40;

  // Converter coordenadas do canvas para metros
  const canvasToMeters = useCallback(
    (canvasX: number, canvasY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const px = canvasX - rect.left - padding;
      const py = canvasY - rect.top - padding;
      return { x: px / scale, y: py / scale };
    },
    [scale, padding],
  );

  // Desenhar o blueprint
  const drawBlueprint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = width * scale;
    const h = height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Contorno do ambiente
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, w, h);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.3)';
    ctx.fillRect(padding, padding, w, h);

    // Dimensões
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${width}m`, padding + w / 2, padding + h + 20);
    ctx.textAlign = 'center';
    ctx.fillText(`${height}m`, padding - 30, padding + h / 2 + 4);

    // --- Desenhar Perfis ---
    profiles.forEach((profile, idx) => {
      // Simular posição aleatória para visualização (será substituída por posições reais)
      // Nesta versão, vamos desenhar os perfis como linhas horizontais/verticais
      // Para uma versão mais realista, o usuário deve poder posicionar os perfis.
      // Vamos usar uma distribuição simples: perfis alternam horizontal/vertical
      const posX = padding + 20 + (idx % 3) * 60;
      const posY = padding + 20 + Math.floor(idx / 3) * 60;
      const lengthPx = profile.length * scale;

      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);

      if (idx % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX + lengthPx, posY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX, posY + lengthPx);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${profile.ledType} ${profile.ledDensity}LED`,
        posX,
        posY - 6,
      );
      ctx.restore();
    });

    // --- Desenhar Spots ---
    spots.forEach((spot) => {
      const x = padding + spot.x * scale;
      const y = padding + spot.y * scale;
      const radius = (spot.diameter / 2) * (scale / 100);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      const colorMap = {
        branco: '#ffffff',
        preto: '#1a1a1a',
        cromo: '#b0b0b0',
        ouro: '#d4af37',
      };
      ctx.fillStyle = colorMap[spot.color] || '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Símbolo do tipo
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol =
        spot.type === 'embutido' ? '⬤' : spot.type === 'sobrepor' ? '◉' : '⌃';
      ctx.fillText(symbol, x, y);

      // Legenda
      ctx.fillStyle = '#64748b';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${spot.diameter}cm`, x, y + radius + 4);
      ctx.restore();

      // Se selecionado, destacar
      if (selectedSpotId === spot.id) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Instruções
    if (!readOnly) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        'Modo: ' +
          (mode === 'spot'
            ? 'Adicionar Spots (clique)'
            : 'Desenhar Perfil (clique e arraste)'),
        padding,
        padding - 20,
      );
    }

    // Legenda do modo
    if (!readOnly) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        'Clique com botão direito para remover',
        canvas.width - padding,
        canvas.height - 10,
      );
    }
  }, [
    width,
    height,
    profiles,
    spots,
    mode,
    readOnly,
    selectedSpotId,
    scale,
    padding,
  ]);

  // Efeito para redesenhar sempre que os dados mudarem
  useEffect(() => {
    drawBlueprint();
  }, [drawBlueprint]);

  // --- Eventos do Canvas ---
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (readOnly) return;
      const { x, y } = canvasToMeters(e.clientX, e.clientY);
      if (x < 0 || y < 0 || x > width || y > height) return;

      if (mode === 'spot') {
        // Adicionar spot
        const newSpot: SpotPoint = {
          id: Math.random().toString(36),
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          type: 'embutido',
          diameter: 10,
          color: 'branco',
          beamAngle: 36,
        };
        onUpdate(profiles, [...spots, newSpot]);
      }
    },
    [mode, readOnly, canvasToMeters, width, height, profiles, spots, onUpdate],
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (readOnly || mode !== 'profile') return;
      const { x, y } = canvasToMeters(e.clientX, e.clientY);
      if (x < 0 || y < 0 || x > width || y > height) return;
      setIsDrawing(true);
      setDrawStart({ x, y });
    },
    [mode, readOnly, canvasToMeters, width, height],
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (readOnly || mode !== 'profile' || !isDrawing || !drawStart) return;
      const { x, y } = canvasToMeters(e.clientX, e.clientY);
      if (x < 0 || y < 0 || x > width || y > height) return;

      const dx = x - drawStart.x;
      const dy = y - drawStart.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length < 0.2) return; // mínimo 20cm

      // Adicionar perfil
      const newProfile: ProfileSegment = {
        id: Math.random().toString(36),
        length: Math.round(length * 100) / 100,
        ledType: 'SMD5050',
        ledDensity: 120,
        colorTemp: '4000K',
      };
      onUpdate([...profiles, newProfile], spots);
      setIsDrawing(false);
      setDrawStart(null);
    },
    [
      readOnly,
      mode,
      isDrawing,
      drawStart,
      canvasToMeters,
      width,
      height,
      profiles,
      spots,
      onUpdate,
    ],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (readOnly) return;
      const { x, y } = canvasToMeters(e.clientX, e.clientY);
      // Remover spot mais próximo
      let closestSpot: SpotPoint | null = null;
      let closestDist = Infinity;
      spots.forEach((spot) => {
        const dist = Math.sqrt((spot.x - x) ** 2 + (spot.y - y) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          closestSpot = spot;
        }
      });
      if (closestSpot && closestDist < 0.2) {
        const newSpots = spots.filter((s) => s.id !== closestSpot!.id);
        onUpdate(profiles, newSpots);
      }
    },
    [readOnly, spots, profiles, onUpdate, canvasToMeters],
  );

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Blueprint</span>
          {!readOnly && (
            <div className="flex gap-1">
              <button
                className={`px-2 py-0.5 text-xs rounded ${mode === 'spot' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                onClick={() => setMode('spot')}
              >
                Spot
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded ${mode === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                onClick={() => setMode('profile')}
              >
                Perfil
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-400">
          {spots.length} spots | {profiles.length} perfis
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-auto max-w-full"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={() => {
          if (isDrawing) {
            setIsDrawing(false);
            setDrawStart(null);
          }
        }}
        onContextMenu={handleContextMenu}
        style={{ cursor: readOnly ? 'default' : 'crosshair' }}
      />
    </div>
  );
}
