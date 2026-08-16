// components/painel/ferramentas/blueprints/WallBlueprint.tsx
'use client';

import React, { useRef, useMemo, useState } from 'react';
import { ServiceInstance, Opening } from '@/hooks/useRoomEditor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, ShareNetwork } from '@phosphor-icons/react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

interface WallBlueprintProps {
  service: ServiceInstance;
  viewMode: 'estrutura' | 'chapas' | 'ambos';
}

export function WallBlueprint({ service, viewMode }: WallBlueprintProps) {
  const blueprintRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const section = service.measures?.[0];
  if (!section) {
    return (
      <div className="text-center text-slate-400 text-xs py-8">
        Nenhuma medida cadastrada para este serviço.
      </div>
    );
  }

  const length = section.w || 0;
  const height = section.h || 0;
  const openings = section.openings || [];
  const spacing = service.studSpacing || 0.6;
  const boardType = service.boardType || 'ST';
  const profileSize = service.profileSize || 48;

  if (length === 0 || height === 0) {
    return (
      <div className="text-center text-slate-400 text-xs py-8">
        Preencha as dimensões (largura e altura) para visualizar o blueprint.
      </div>
    );
  }

  // Posições dos montantes
  const studPositions = useMemo(() => {
    const positions = [0];
    let current = spacing;
    while (current < length) {
      positions.push(Number(current.toFixed(2)));
      current += spacing;
    }
    if (positions[positions.length - 1] !== length) {
      positions.push(length);
    }
    return positions;
  }, [length, spacing]);

  // Modulação de placas 1.20 x 1.80
  const boardWidth = 1.2;
  const boardHeight = 1.8;
  const boardCols = Math.ceil(length / boardWidth);
  const boardRows = Math.ceil(height / boardHeight);
  const plates = useMemo(() => {
    const result = [];
    for (let c = 0; c < boardCols; c++) {
      for (let r = 0; r < boardRows; r++) {
        const x = c * boardWidth;
        const y = r * boardHeight;
        const w = Math.min(boardWidth, length - x);
        const h = Math.min(boardHeight, height - y);
        if (w > 0 && h > 0) {
          result.push({ x, y, w, h });
        }
      }
    }
    return result;
  }, [length, height]);

  // Cores conforme tipo de placa
  const boardColor =
    boardType === 'RU' ? '#059669' : boardType === 'RF' ? '#e11d48' : '#e0e7ff';
  const boardLabel =
    boardType === 'RU'
      ? 'RU (Umidade)'
      : boardType === 'RF'
        ? 'RF (Fogo)'
        : 'ST (Padrão)';

  // Nome do serviço
  const serviceName = service.tag || 'Parede sem nome';

  // Função para exportar PNG
  const handleExportPNG = async () => {
    if (!blueprintRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(blueprintRef.current, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
        quality: 0.95,
      });
      const fileName = `blueprint-${serviceName.replace(/\s+/g, '-')}.png`;
      saveAs(dataUrl, fileName);
      toast.success('Blueprint exportado como PNG!');
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      toast.error('Falha ao exportar o blueprint.');
    } finally {
      setIsExporting(false);
    }
  };

  // Função para compartilhar via WhatsApp (compartilha a imagem como arquivo)
  const handleShareWhatsApp = async () => {
    if (!blueprintRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(blueprintRef.current, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
        quality: 0.95,
      });
      // Converte dataURL para Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `blueprint-${serviceName}.png`, {
        type: 'image/png',
      });

      if (
        navigator.share &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Blueprint - ${serviceName}`,
          files: [file],
        });
      } else {
        // Fallback: baixar e abrir WhatsApp com texto + imagem
        const text = `*Blueprint - ${serviceName}*\nComprimento: ${length}m | Altura: ${height}m | Perfil: ${profileSize}mm | Placa: ${boardLabel}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        // Baixa a imagem também
        saveAs(blob, `blueprint-${serviceName.replace(/\s+/g, '-')}.png`);
      }
      toast.success('Blueprint compartilhado!');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Falha ao compartilhar.');
    } finally {
      setIsExporting(false);
    }
  };

  // Verificar se há aberturas
  const hasOpenings = openings.length > 0;

  // Área líquida
  const grossArea = length * height;
  const openingsArea = openings.reduce((acc, o) => acc + o.w * o.h, 0);
  const netArea = grossArea - openingsArea;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-slate-400">
          <span className="font-bold text-white">{serviceName}</span> – {length}
          m x {height}m
          <span className="ml-2 text-indigo-300">
            Área líquida: {netArea.toFixed(2)} m²
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] border-slate-600 text-slate-300 hover:bg-slate-700 h-7 px-2"
            onClick={handleExportPNG}
            disabled={isExporting}
          >
            <Download size={14} className="mr-1" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] border-emerald-600 text-emerald-300 hover:bg-emerald-900/30 h-7 px-2"
            onClick={handleShareWhatsApp}
            disabled={isExporting}
          >
            <ShareNetwork size={14} className="mr-1" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div
        ref={blueprintRef}
        className="bg-slate-950 rounded-xl p-4 border border-slate-800/60 relative overflow-hidden"
        style={{ minHeight: '180px' }}
      >
        {/* Grade de fundo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative">
          {/* Dimensões horizontais */}
          <div className="flex justify-between text-[10px] text-indigo-300/70 mb-1 px-1">
            <span>0.00m</span>
            <span className="bg-slate-800/60 px-2 py-0.5 rounded border border-indigo-800/30">
              Comprimento: {length}m
            </span>
            <span>{length}m</span>
          </div>

          {/* SVG */}
          <svg
            viewBox={`-0.2 -0.2 ${length + 0.4} ${height + 0.4}`}
            className="w-full max-h-64 border border-indigo-500/20 rounded-lg bg-slate-950/90 shadow-inner"
          >
            {/* Guias superior e inferior */}
            <rect
              x="0"
              y="0"
              width={length}
              height="0.06"
              fill="#6366f1"
              opacity="0.9"
            />
            <rect
              x="0"
              y={height - 0.06}
              width={length}
              height="0.06"
              fill="#6366f1"
              opacity="0.9"
            />

            {/* Montantes */}
            {(viewMode === 'estrutura' || viewMode === 'ambos') &&
              studPositions.map((pos, idx) => (
                <g key={`stud-${idx}`}>
                  <rect
                    x={pos - 0.02}
                    y="0.06"
                    width="0.04"
                    height={height - 0.12}
                    fill={pos === 0 || pos === length ? '#a5b4fc' : '#818cf8'}
                    opacity={pos === 0 || pos === length ? 0.9 : 0.6}
                  />
                  <line
                    x1={pos}
                    y1="0"
                    x2={pos}
                    y2={height}
                    stroke="#c7d2fe"
                    strokeWidth="0.012"
                    strokeDasharray="0.05, 0.05"
                    opacity="0.5"
                  />
                </g>
              ))}

            {/* Chapas */}
            {(viewMode === 'chapas' || viewMode === 'ambos') &&
              plates.map((plate, idx) => (
                <rect
                  key={`plate-${idx}`}
                  x={plate.x + 0.02}
                  y={plate.y + 0.02}
                  width={plate.w - 0.04}
                  height={plate.h - 0.04}
                  fill={boardColor}
                  fillOpacity={viewMode === 'ambos' ? 0.2 : 0.35}
                  stroke="#ffffff"
                  strokeWidth="0.015"
                  strokeDasharray="0.04, 0.04"
                  opacity={0.9}
                />
              ))}

            {/* Aberturas (portas, janelas, vãos) com estruturas adicionais */}
            {hasOpenings &&
              openings.map((op, idx) => {
                const posX = (op as any).posX ?? 0;
                const posY = (op as any).posY ?? height - op.h;
                const isDoor = op.type === 'door';
                const isWindow = op.type === 'window';
                const isOpening = op.type === 'opening';

                // Cor padrão: laranja para portas, azul para janelas, cinza para vãos
                let strokeColor = '#94a3b8';
                let fillColor = '#1e293b';
                let label = 'Vão';
                if (isDoor) {
                  strokeColor = '#f59e0b';
                  fillColor = '#451a03';
                  label = 'Porta';
                } else if (isWindow) {
                  strokeColor = '#0ea5e9';
                  fillColor = '#0c4a6e';
                  label = 'Janela';
                } else {
                  strokeColor = '#94a3b8';
                  fillColor = '#1e293b';
                  label = 'Vão';
                }

                const opName = (op as any).name || `${label} ${idx + 1}`;

                return (
                  <g key={`op-${idx}`}>
                    {/* Área do vão */}
                    <rect
                      x={posX}
                      y={posY}
                      width={op.w}
                      height={op.h}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="0.04"
                      strokeDasharray="0.06, 0.04"
                    />

                    {/* Reforços laterais (+2 montantes) */}
                    <rect
                      x={posX - 0.04}
                      y="0"
                      width="0.04"
                      height={height}
                      fill={strokeColor}
                      opacity="0.8"
                    />
                    <rect
                      x={posX + op.w}
                      y="0"
                      width="0.04"
                      height={height}
                      fill={strokeColor}
                      opacity="0.8"
                    />

                    {/* Verga superior */}
                    <rect
                      x={posX}
                      y={posY - 0.06}
                      width={op.w}
                      height="0.06"
                      fill={strokeColor}
                      opacity="0.9"
                    />

                    {/* Texto com nome e dimensões */}
                    <text
                      x={posX + op.w / 2}
                      y={posY + op.h / 2}
                      fill={strokeColor}
                      fontSize="0.2"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {opName}
                      <tspan
                        x={posX + op.w / 2}
                        dy="0.25"
                        fontSize="0.15"
                        fill="#cbd5e1"
                      >
                        {op.w}x{op.h}m
                      </tspan>
                    </text>

                    {/* Para janelas: indicador de vidro (linhas) */}
                    {isWindow && (
                      <g stroke="#94a3b8" strokeWidth="0.015" opacity="0.4">
                        <line
                          x1={posX}
                          y1={posY + op.h * 0.3}
                          x2={posX + op.w}
                          y2={posY + op.h * 0.3}
                        />
                        <line
                          x1={posX}
                          y1={posY + op.h * 0.7}
                          x2={posX + op.w}
                          y2={posY + op.h * 0.7}
                        />
                        <line
                          x1={posX + op.w * 0.3}
                          y1={posY}
                          x2={posX + op.w * 0.3}
                          y2={posY + op.h}
                        />
                        <line
                          x1={posX + op.w * 0.7}
                          y1={posY}
                          x2={posX + op.w * 0.7}
                          y2={posY + op.h}
                        />
                      </g>
                    )}

                    {/* Para portas: indicador de batente e arco de abertura (simples) */}
                    {isDoor && (
                      <path
                        d={`M ${posX + op.w} ${posY + op.h} A ${op.w * 0.8} ${op.h * 0.5} 0 0 0 ${posX} ${posY + op.h}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="0.015"
                        strokeDasharray="0.04, 0.04"
                        opacity="0.4"
                      />
                    )}
                  </g>
                );
              })}

            {/* Legenda de cores no canto inferior direito */}
            <g transform={`translate(${length - 2.8}, ${height - 1.2})`}>
              <rect
                x="0"
                y="0"
                width="2.6"
                height="1.0"
                fill="#0f172a"
                opacity="0.85"
                rx="0.1"
              />
              <text
                x="0.15"
                y="0.25"
                fill="#cbd5e1"
                fontSize="0.12"
                fontWeight="bold"
              >
                Legenda
              </text>
              <rect
                x="0.15"
                y="0.4"
                width="0.15"
                height="0.12"
                fill="#f59e0b"
              />
              <text x="0.35" y="0.5" fill="#cbd5e1" fontSize="0.1">
                Porta
              </text>
              <rect x="1.2" y="0.4" width="0.15" height="0.12" fill="#0ea5e9" />
              <text x="1.4" y="0.5" fill="#cbd5e1" fontSize="0.1">
                Janela
              </text>
              <rect
                x="0.15"
                y="0.6"
                width="0.15"
                height="0.12"
                fill="#94a3b8"
              />
              <text x="0.35" y="0.7" fill="#cbd5e1" fontSize="0.1">
                Vão
              </text>
              <rect x="1.2" y="0.6" width="0.15" height="0.12" fill="#818cf8" />
              <text x="1.4" y="0.7" fill="#cbd5e1" fontSize="0.1">
                Montante
              </text>
            </g>

            {/* Texto de escala e informações técnicas */}
            <text
              x="0.1"
              y={height + 0.25}
              fill="#475569"
              fontSize="0.1"
              fontFamily="monospace"
            >
              Escala: 1:{Math.round(length / 4)} | Perfil: {profileSize}mm |
              Placa: {boardLabel}
            </text>
          </svg>

          {/* Dimensões verticais */}
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block" />
                Guias/Montantes ({profileSize}mm)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block" />
                Reforço de Vão (+2 mont.)
              </span>
            </div>
            <span className="font-mono text-indigo-300">Altura: {height}m</span>
          </div>
        </div>
      </div>

      {/* Informações adicionais do serviço */}
      <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
        <span>Comprimento: {length}m</span>
        <span>Altura: {height}m</span>
        <span>Área bruta: {grossArea.toFixed(2)} m²</span>
        <span>Área de vãos: {openingsArea.toFixed(2)} m²</span>
        <span>Área líquida: {netArea.toFixed(2)} m²</span>
        {service.useInsulation && (
          <span className="text-emerald-400">✓ Com lã acústica</span>
        )}
        <span>Placas: {plates.length} un (1.20x1.80m)</span>
        <span>Montantes: {studPositions.length} un</span>
      </div>
    </div>
  );
}
