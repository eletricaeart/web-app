// components/painel/ferramentas/calculadoras/DrywallCalculadora.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Wall,
  SquareHalf,
  CheckCircle,
  Copy,
  Info,
  Sliders,
  Sparkle,
  Package,
  Wrench,
} from '@phosphor-icons/react';
import {
  calculateDrywallWall,
  calculateDrywallCeiling,
  DrywallWallInput,
  DrywallCeilingInput,
} from '@/utils/calculators/drywallQuick';
import { toast } from 'sonner';

type DrywallSubTab = 'parede' | 'forro';

export default function DrywallCalculadora() {
  const [subTab, setSubTab] = useState<DrywallSubTab>('parede');

  // Estados de Parede
  const [wallLength, setWallLength] = useState<number>(6);
  const [wallHeight, setWallHeight] = useState<number>(2.8);
  const [structureType, setStructureType] =
    useState<DrywallWallInput['structureType']>('W111_simples');
  const [studSpacing, setStudSpacing] = useState<400 | 600>(600);
  const [studWidth, setStudWidth] = useState<48 | 70 | 90>(70);
  const [boardType, setBoardType] =
    useState<DrywallWallInput['boardType']>('ST');
  const [boardSize, setBoardSize] =
    useState<DrywallWallInput['boardSize']>('1.20x1.80');
  const [includeInsulation, setIncludeInsulation] = useState<boolean>(false);
  const [doorsCount, setDoorsCount] = useState<number>(1);
  const [wasteMargin, setWasteMargin] = useState<number>(10);

  // Estados de Forro
  const [ceilingWidth, setCeilingWidth] = useState<number>(4);
  const [ceilingLength, setCeilingLength] = useState<number>(5);
  const [ceilingProfileSpacing, setCeilingProfileSpacing] = useState<500 | 600>(
    500,
  );

  // Cálculos reativos
  const wallResult = useMemo(() => {
    return calculateDrywallWall({
      wallLength,
      wallHeight,
      structureType,
      studSpacing,
      studWidth,
      boardType,
      boardSize,
      includeInsulation,
      doorsCount,
      wasteMarginPercent: wasteMargin,
    });
  }, [
    wallLength,
    wallHeight,
    structureType,
    studSpacing,
    studWidth,
    boardType,
    boardSize,
    includeInsulation,
    doorsCount,
    wasteMargin,
  ]);

  const ceilingResult = useMemo(() => {
    return calculateDrywallCeiling({
      roomWidth: ceilingWidth,
      roomLength: ceilingLength,
      boardType,
      boardSize,
      profileSpacing: ceilingProfileSpacing,
      wasteMarginPercent: wasteMargin,
    });
  }, [
    ceilingWidth,
    ceilingLength,
    boardType,
    boardSize,
    ceilingProfileSpacing,
    wasteMargin,
  ]);

  const copySummary = () => {
    let text = '';
    if (subTab === 'parede') {
      text = `🧱 QUANTITATIVO DE DRYWALL - PAREDE W111/W112
• Dimensões: ${wallLength}m x ${wallHeight}m (${wallResult.areaM2.toFixed(1)} m²)
• Estrutura: Perfis ${studWidth}mm | Montantes a cada ${studSpacing}mm
• Chapas (${boardType} ${boardSize}m): ${wallResult.boardsCount} unidades
• Guias de piso/teto (3m): ${wallResult.guidesCount} barras
• Montantes verticais (3m): ${wallResult.studsCount} barras
• Parafusos GN 25: ${wallResult.screwsGN25} unidades
${wallResult.screwsGN35 ? `• Parafusos GN 35 (2ª camada): ${wallResult.screwsGN35} un\n` : ''}• Parafusos LB 9,5 (metal-metal): ${wallResult.screwsLB9_5} unidades
• Fita microperfurada para juntas: ${wallResult.jointTapeMeters} metros
• Massa de junta para acabamento: ${wallResult.jointCompoundKg} kg
• Fita banda acústica para guias: ${wallResult.acousticBandMeters} metros
${wallResult.insulationM2 ? `• Lã de isolamento acústico: ${wallResult.insulationM2} m²\n` : ''}
Calculado com normas ABNT NBR 15758 e margem de perda de ${wasteMargin}%.`;
    } else {
      text = `🧱 QUANTITATIVO DE DRYWALL - FORRO ESTRUTURADO F530
• Dimensões do teto: ${ceilingWidth}m x ${ceilingLength}m (${ceilingResult.areaM2.toFixed(1)} m²)
• Chapas (${boardType} ${boardSize}m): ${ceilingResult.boardsCount} unidades
• Canaletas F530 (3m): ${ceilingResult.f530ProfilesCount} barras
• Cantoneiras/Tabicas perimetrais (3m): ${ceilingResult.perimeterProfilesCount} barras
• Tirantes galvanizados com reguladores: ${ceilingResult.hangersWithRodCount} conjuntos
• Parafusos GN 25: ${ceilingResult.screwsGN25} unidades
• Parafusos LB 9,5: ${ceilingResult.screwsLB9_5} unidades
• Fita microperfurada para juntas: ${ceilingResult.jointTapeMeters} metros
• Massa de junta para acabamento: ${ceilingResult.jointCompoundKg} kg
Calculado com normas ABNT NBR 15758 e margem de perda de ${wasteMargin}%.`;
    }

    navigator.clipboard.writeText(text);
    toast.success('Quantitativo de Drywall copiado!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-navegação Parede / Forro */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          {
            id: 'parede',
            label: 'Paredes & Divisórias (W111/W112)',
            icon: <Wall size={18} weight="duotone" />,
          },
          {
            id: 'forro',
            label: 'Forro Estruturado (F530)',
            icon: <SquareHalf size={18} weight="duotone" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as DrywallSubTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 ${
              subTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTEÚDO PAREDE --- */}
      {subTab === 'parede' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Inputs de Parede */}
          <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders size={18} className="text-emerald-600" />
              Dimensões e Estrutura
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Comprimento da Parede (m)
                </label>
                <input
                  type="number"
                  value={wallLength || ''}
                  onChange={(e) =>
                    setWallLength(Math.max(0.5, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Pé Direito / Altura (m)
                </label>
                <input
                  type="number"
                  value={wallHeight || ''}
                  onChange={(e) =>
                    setWallHeight(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Tipo de Estrutura
                </label>
                <select
                  value={structureType}
                  onChange={(e) => setStructureType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="W111_simples">
                    W111 - 1 Placa por Lado (Padrão)
                  </option>
                  <option value="W112_dupla">
                    W112 - 2 Placas por Lado (Dupla/Acústica)
                  </option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Largura do Perfil
                </label>
                <select
                  value={studWidth}
                  onChange={(e) => setStudWidth(Number(e.target.value) as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value={48}>48 mm (Mais compacta)</option>
                  <option value={70}>70 mm (Padrão mais usado)</option>
                  <option value={90}>90 mm (Hidráulica / Acústica)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Espaçamento dos Montantes
                </label>
                <select
                  value={studSpacing}
                  onChange={(e) =>
                    setStudSpacing(Number(e.target.value) as any)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value={600}>600 mm (Padrão Residencial)</option>
                  <option value={400}>400 mm (Reforçado / Cerâmica)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Portas / Vãos
                </label>
                <input
                  type="number"
                  min={0}
                  value={doorsCount}
                  onChange={(e) =>
                    setDoorsCount(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Tipo de Placa de Gesso
                </label>
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="ST">ST - Standard (Áreas Secas)</option>
                  <option value="RU">RU - Verde (Áreas Úmidas)</option>
                  <option value="RF">RF - Rosa (Resistente ao Fogo)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Dimensão da Placa
                </label>
                <select
                  value={boardSize}
                  onChange={(e) => setBoardSize(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="1.20x1.80">1,20 x 1,80 m (2,16 m²)</option>
                  <option value="1.20x2.40">1,20 x 2,40 m (2,88 m²)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInsulation}
                  onChange={(e) => setIncludeInsulation(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                Isolamento Acústico (Lã de Vidro/Rocha)
              </label>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>Perda:</span>
                <select
                  value={wasteMargin}
                  onChange={(e) => setWasteMargin(Number(e.target.value))}
                  className="bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs"
                >
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados Parede */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider">
                  <Wall size={16} weight="fill" />
                  Lista de Materiais Exata
                </span>
                <button
                  onClick={copySummary}
                  className="flex items-center gap-1 text-xs bg-white text-emerald-900 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  <Copy size={14} weight="bold" />
                  Copiar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 my-2">
                <div className="bg-black/15 p-3.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-medium text-emerald-100 uppercase">
                    Área Total de Parede
                  </p>
                  <p className="text-2xl font-black mt-0.5">
                    {wallResult.areaM2.toFixed(1)} m²
                  </p>
                </div>
                <div className="bg-black/15 p-3.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-medium text-emerald-100 uppercase">
                    Chapas ({boardType})
                  </p>
                  <p className="text-2xl font-black mt-0.5">
                    {wallResult.boardsCount} un
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">Guias (3m):</p>
                  <p className="font-bold">{wallResult.guidesCount} barras</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">
                    Montantes (3m):
                  </p>
                  <p className="font-bold">{wallResult.studsCount} barras</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">Paraf. GN25:</p>
                  <p className="font-bold">{wallResult.screwsGN25} un</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">Paraf. LB 9,5:</p>
                  <p className="font-bold">{wallResult.screwsLB9_5} un</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">Fita Junta:</p>
                  <p className="font-bold">{wallResult.jointTapeMeters} m</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-100">
                    Massa de Junta:
                  </p>
                  <p className="font-bold">{wallResult.jointCompoundKg} kg</p>
                </div>
              </div>
            </div>

            {/* Dicas e Normas */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info size={16} className="text-emerald-600" />
                Especificação ABNT NBR 15758
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {wallResult.technicalSpecs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 shrink-0 mt-0.5"
                      weight="fill"
                    />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- CONTEÚDO FORRO --- */}
      {subTab === 'forro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Dimensões do Teto
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Largura do Cômodo (m)
                </label>
                <input
                  type="number"
                  value={ceilingWidth || ''}
                  onChange={(e) =>
                    setCeilingWidth(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Comprimento do Cômodo (m)
                </label>
                <input
                  type="number"
                  value={ceilingLength || ''}
                  onChange={(e) =>
                    setCeilingLength(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Espaçamento Perfis F530
                </label>
                <select
                  value={ceilingProfileSpacing}
                  onChange={(e) =>
                    setCeilingProfileSpacing(Number(e.target.value) as any)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value={500}>500 mm (Recomendado)</option>
                  <option value={600}>600 mm (Padrão leve)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Tipo de Placa
                </label>
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="ST">ST - Standard</option>
                  <option value="RU">RU - Verde (Banheiro/Cozinha)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-teal-700 to-slate-900 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider">
                  Forro F530
                </span>
                <button
                  onClick={copySummary}
                  className="flex items-center gap-1 text-xs bg-white text-teal-950 font-bold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Copy size={14} weight="bold" />
                  Copiar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 my-2">
                <div className="bg-black/20 p-3.5 rounded-xl">
                  <p className="text-[10px] text-teal-200 uppercase">
                    Área do Forro
                  </p>
                  <p className="text-2xl font-black mt-0.5">
                    {ceilingResult.areaM2.toFixed(1)} m²
                  </p>
                </div>
                <div className="bg-black/20 p-3.5 rounded-xl">
                  <p className="text-[10px] text-teal-200 uppercase">
                    Chapas de Gesso
                  </p>
                  <p className="text-2xl font-black mt-0.5">
                    {ceilingResult.boardsCount} un
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-teal-200">Perfis F530 (3m):</p>
                  <p className="font-bold">
                    {ceilingResult.f530ProfilesCount} barras
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-teal-200">
                    Tabicas/Cantoneiras:
                  </p>
                  <p className="font-bold">
                    {ceilingResult.perimeterProfilesCount} barras
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <p className="text-[10px] text-teal-200">
                    Tirantes + Regulador:
                  </p>
                  <p className="font-bold">
                    {ceilingResult.hangersWithRodCount} conjuntos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
