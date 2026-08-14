// components/painel/ferramentas/calculadoras/PinturaCalculadora.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  PaintBrush,
  PaintRoller,
  CheckCircle,
  Copy,
  Info,
  Sliders,
  Drop,
  Sparkle,
  Door,
  Package,
} from '@phosphor-icons/react';
import {
  calculatePaint,
  PaintCalculationInput,
} from '@/utils/calculators/pintura';
import { toast } from 'sonner';

export default function PinturaCalculadora() {
  const [calcMode, setCalcMode] = useState<'dimensions' | 'direct'>(
    'dimensions',
  );

  // Dimensões
  const [wallWidth, setWallWidth] = useState<number>(4);
  const [wallLength, setWallLength] = useState<number>(5);
  const [wallHeight, setWallHeight] = useState<number>(2.7);
  const [directArea, setDirectArea] = useState<number>(45);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);

  // Aberturas
  const [doorsCount, setDoorsCount] = useState<number>(1);
  const [windowsCount, setWindowsCount] = useState<number>(1);

  // Parâmetros de Pintura
  const [paintType, setPaintType] =
    useState<PaintCalculationInput['paintType']>('acrilica_premium');
  const [surfaceType, setSurfaceType] =
    useState<PaintCalculationInput['surfaceType']>('repintura_lisa');
  const [coats, setCoats] = useState<number>(2);
  const [wasteMargin, setWasteMargin] = useState<number>(10);
  const [includePrimer, setIncludePrimer] = useState<boolean>(false);
  const [includeSpaklingPaste, setIncludeSpaklingPaste] =
    useState<boolean>(false);

  // Cálculo reativo
  const paintResult = useMemo(() => {
    return calculatePaint({
      wallWidth: calcMode === 'dimensions' ? wallWidth : 0,
      wallLength: calcMode === 'dimensions' ? wallLength : 0,
      wallHeight: calcMode === 'dimensions' ? wallHeight : 0,
      directWallArea: calcMode === 'direct' ? directArea : 0,
      includeCeiling: calcMode === 'dimensions' ? includeCeiling : false,
      doorsCount,
      windowsCount,
      paintType,
      surfaceType,
      coats,
      wasteMarginPercent: wasteMargin,
      includePrimer,
      includeSpaklingPaste,
    });
  }, [
    calcMode,
    wallWidth,
    wallLength,
    wallHeight,
    directArea,
    includeCeiling,
    doorsCount,
    windowsCount,
    paintType,
    surfaceType,
    coats,
    wasteMargin,
    includePrimer,
    includeSpaklingPaste,
  ]);

  const copySummary = () => {
    const text = `🎨 ESTIMATIVA DE PINTURA E ACABAMENTO
• Área Bruta: ${paintResult.grossAreaM2.toFixed(1)} m²
• Desconto de Vãos: -${paintResult.openingsDiscountM2.toFixed(1)} m² (${doorsCount} portas, ${windowsCount} janelas)
• Área Líquida de Aplicação: ${paintResult.netAreaM2.toFixed(1)} m² (${coats} demãos)
• Tinta Necessária: ${paintResult.totalLitersNeeded.toFixed(1)} Litros

📦 EMBALAGENS RECOMENDADAS:
${paintResult.cans18L > 0 ? `• Latas de 18 Litros: ${paintResult.cans18L} un\n` : ''}${
      paintResult.gallons3_6L > 0
        ? `• Galões de 3,6 Litros: ${paintResult.gallons3_6L} un\n`
        : ''
    }${paintResult.quarts900mL > 0 ? `• Quartos de 900 mL: ${paintResult.quarts900mL} un\n` : ''}${
      includePrimer
        ? `• Fundo Preparador/Selador: ${paintResult.primerLitersNeeded.toFixed(1)} Litros\n`
        : ''
    }${
      includeSpaklingPaste
        ? `• Massa Corrida/Acrílica: ${paintResult.spaklingPasteKgNeeded.toFixed(0)} kg (~${paintResult.spaklingPasteCans25Kg} baldes de 25kg)\n`
        : ''
    }
Calculado com rendimento técnico de fabricante e margem de perda de ${wasteMargin}%.`;

    navigator.clipboard.writeText(text);
    toast.success('Resumo de materiais de pintura copiado!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Medidas e Superfície */}
        <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PaintBrush size={18} className="text-violet-500" />
              Área e Superfície
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setCalcMode('dimensions')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calcMode === 'dimensions'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Dimensões
              </button>
              <button
                onClick={() => setCalcMode('direct')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calcMode === 'direct'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Área Direta (m²)
              </button>
            </div>
          </div>

          {calcMode === 'dimensions' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Largura (m)
                </label>
                <input
                  type="number"
                  value={wallWidth || ''}
                  onChange={(e) =>
                    setWallWidth(Math.max(0.5, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Comprimento (m)
                </label>
                <input
                  type="number"
                  value={wallLength || ''}
                  onChange={(e) =>
                    setWallLength(Math.max(0.5, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Pé Direito (m)
                </label>
                <input
                  type="number"
                  value={wallHeight || ''}
                  onChange={(e) =>
                    setWallHeight(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Área Total das Paredes (m²)
              </label>
              <input
                type="number"
                value={directArea || ''}
                onChange={(e) =>
                  setDirectArea(Math.max(1, Number(e.target.value)))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          )}

          {calcMode === 'dimensions' && (
            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={includeCeiling}
                onChange={(e) => setIncludeCeiling(e.target.checked)}
                className="rounded text-violet-600 w-4 h-4"
              />
              Incluir Pintura do Teto (+{(wallWidth * wallLength).toFixed(1)}{' '}
              m²)
            </label>
          )}

          {/* Desconto de Vãos */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Portas (0.80 x 2.10m)
              </label>
              <input
                type="number"
                min={0}
                value={doorsCount}
                onChange={(e) =>
                  setDoorsCount(Math.max(0, Number(e.target.value)))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Janelas (1.20 x 1.20m)
              </label>
              <input
                type="number"
                min={0}
                value={windowsCount}
                onChange={(e) =>
                  setWindowsCount(Math.max(0, Number(e.target.value)))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Tipo de Tinta e Superfície */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Tipo de Tinta
              </label>
              <select
                value={paintType}
                onChange={(e) => setPaintType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
              >
                <option value="acrilica_premium">
                  Acrílica Premium (12 m²/L)
                </option>
                <option value="acrilica_standard">
                  Acrílica Standard (9 m²/L)
                </option>
                <option value="latex_pva">Látex PVA Interior (8 m²/L)</option>
                <option value="esmalte">
                  Esmalte Base Água/Sintético (14 m²/L)
                </option>
                <option value="epoxi">Tinta Epóxi (10 m²/L)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Estado da Superfície
              </label>
              <select
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
              >
                <option value="repintura_lisa">Repintura Lisa (Padrão)</option>
                <option value="alvenaria_nova">
                  Alvenaria Nova / Reboco Curado
                </option>
                <option value="gesso_drywall">Gesso Liso ou Drywall</option>
                <option value="reboco_poroso">Reboco Rústico / Poroso</option>
              </select>
            </div>
          </div>

          {/* Demãos e Adicionais */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Número de Demãos
              </label>
              <select
                value={coats}
                onChange={(e) => setCoats(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
              >
                <option value={1}>1 Demão (Retoque)</option>
                <option value={2}>2 Demãos (Recomendado)</option>
                <option value={3}>3 Demãos (Troca de Cor Forte)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Margem de Perda (%)
              </label>
              <select
                value={wasteMargin}
                onChange={(e) => setWasteMargin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
              >
                <option value={5}>5% (Aplicação com rolo profissional)</option>
                <option value={10}>10% (Padrão de obra)</option>
                <option value={15}>15% (Airless / Superfície irregular)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes de Selador e Massa Corrida */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrimer}
                onChange={(e) => setIncludePrimer(e.target.checked)}
                className="rounded text-violet-600 w-4 h-4"
              />
              Calcular Fundo Preparador / Selador Acrílico
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSpaklingPaste}
                onChange={(e) => setIncludeSpaklingPaste(e.target.checked)}
                className="rounded text-violet-600 w-4 h-4"
              />
              Calcular Massa Corrida / Acrílica para emassamento
            </label>
          </div>
        </div>

        {/* Coluna 2: Resultados e Embalagens */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Card Principal */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider">
                <PaintRoller size={16} weight="fill" />
                Rendimento & Embalagens
              </span>
              <button
                onClick={copySummary}
                className="flex items-center gap-1 text-xs bg-white text-violet-900 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-violet-50 active:scale-95 transition-all"
              >
                <Copy size={14} weight="bold" />
                Copiar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="bg-black/15 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[11px] font-medium text-violet-100 uppercase tracking-wider">
                  Área Líquida
                </p>
                <p className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                  {paintResult.netAreaM2.toFixed(1)}{' '}
                  <span className="text-lg font-semibold">m²</span>
                </p>
                <p className="text-[11px] text-violet-100 mt-1">
                  Desconto de vãos: -{paintResult.openingsDiscountM2.toFixed(1)}{' '}
                  m²
                </p>
              </div>

              <div className="bg-black/15 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[11px] font-medium text-violet-100 uppercase tracking-wider">
                  Volume Total
                </p>
                <p className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                  {paintResult.totalLitersNeeded.toFixed(1)}{' '}
                  <span className="text-lg font-semibold">Litros</span>
                </p>
                <p className="text-[11px] text-violet-100 mt-1">
                  Com {wasteMargin}% margem de segurança
                </p>
              </div>
            </div>

            {/* Sugestão de Compra de Embalagens */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs font-bold text-violet-100 uppercase mb-2">
                Compre exatamente:
              </p>
              <div className="flex flex-wrap gap-2">
                {paintResult.cans18L > 0 && (
                  <div className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur flex items-center gap-1.5">
                    <Package size={16} />
                    {paintResult.cans18L}x Lata 18L
                  </div>
                )}
                {paintResult.gallons3_6L > 0 && (
                  <div className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur flex items-center gap-1.5">
                    <Package size={16} />
                    {paintResult.gallons3_6L}x Galão 3,6L
                  </div>
                )}
                {paintResult.quarts900mL > 0 && (
                  <div className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur flex items-center gap-1.5">
                    <Package size={16} />
                    {paintResult.quarts900mL}x Quarto 900ml
                  </div>
                )}
                {paintResult.cans18L === 0 &&
                  paintResult.gallons3_6L === 0 &&
                  paintResult.quarts900mL === 0 && (
                    <span className="text-xs">
                      Insira as medidas para calcular as latas
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Itens Adicionais (Selador e Massa) */}
          {(includePrimer || includeSpaklingPaste) && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Complementos de Preparação
              </span>
              <div className="grid grid-cols-2 gap-3">
                {includePrimer && (
                  <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                    <p className="text-xs font-bold text-violet-900">
                      Selador / Fundo Preparador
                    </p>
                    <p className="text-lg font-black text-violet-950 mt-0.5">
                      {paintResult.primerLitersNeeded.toFixed(1)} L
                    </p>
                    <p className="text-[11px] text-violet-700 mt-1">
                      1 demão prévia
                    </p>
                  </div>
                )}
                {includeSpaklingPaste && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-900">
                      Massa Corrida / Acrílica
                    </p>
                    <p className="text-lg font-black text-indigo-950 mt-0.5">
                      {paintResult.spaklingPasteKgNeeded.toFixed(0)} kg
                    </p>
                    <p className="text-[11px] text-indigo-700 mt-1">
                      ~{paintResult.spaklingPasteCans25Kg}{' '}
                      {paintResult.spaklingPasteCans25Kg === 1
                        ? 'balde'
                        : 'baldes'}{' '}
                      de 25kg
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dicas e Recomendações */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info size={16} className="text-violet-600" />
              Recomendações do Pintor Profissional
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5">
              {paintResult.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle
                    size={14}
                    className="text-emerald-500 shrink-0 mt-0.5"
                    weight="fill"
                  />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
