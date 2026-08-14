// components/painel/ferramentas/calculadoras/EletricaCalculadora.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightning,
  ShieldCheck,
  WarningCircle,
  Cpu,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  Info,
  Sliders,
  CaretRight,
  Sparkle,
} from '@phosphor-icons/react';
import {
  calculateCableDimension,
  calculateConduitDimension,
  calculateRoomLoads,
  STANDARD_CABLE_SECTIONS,
  ConduitItem,
} from '@/utils/calculators/eletrica';
import { toast } from 'sonner';

type ElectricSubTab = 'condutores' | 'eletrodutos' | 'cargas';

// Presets práticos para o eletricista agilizar no dia a dia
const ELECTRIC_PRESETS = [
  {
    name: 'Chuveiro 5500W (127V)',
    power: 5500,
    voltage: 127,
    distance: 15,
    fp: 1.0,
  },
  {
    name: 'Chuveiro 7500W (220V)',
    power: 7500,
    voltage: 220,
    distance: 20,
    fp: 1.0,
  },
  {
    name: 'Ar-Condicionado 12k BTU',
    power: 1400,
    voltage: 220,
    distance: 18,
    fp: 0.85,
  },
  {
    name: 'Forno Elétrico 3000W',
    power: 3000,
    voltage: 220,
    distance: 12,
    fp: 1.0,
  },
  {
    name: 'Circuito Tomadas TUGs (2200VA)',
    power: 2200,
    voltage: 127,
    distance: 25,
    fp: 0.95,
  },
  {
    name: 'Circuito Iluminação LED (600W)',
    power: 600,
    voltage: 127,
    distance: 30,
    fp: 0.9,
  },
];

export default function EletricaCalculadora() {
  const [subTab, setSubTab] = useState<ElectricSubTab>('condutores');

  // --- Estados do Dimensionamento de Cabos ---
  const [voltage, setVoltage] = useState<number>(220);
  const [power, setPower] = useState<number>(5500);
  const [distance, setDistance] = useState<number>(20);
  const [powerFactor, setPowerFactor] = useState<number>(0.95);
  const [maxDrop, setMaxDrop] = useState<number>(4);
  const [phaseType, setPhaseType] = useState<'monofasico' | 'trifasico'>(
    'monofasico',
  );

  // --- Estados de Eletroduto ---
  const [conduitCables, setConduitCables] = useState<ConduitItem[]>([
    { section: 2.5, quantity: 3 }, // ex: Fase, Neutro, Terra
  ]);

  // --- Estados de Previsão de Cargas ---
  const [roomType, setRoomType] = useState<
    'quarto_sala' | 'cozinha_servico' | 'banheiro' | 'varanda_garagem'
  >('cozinha_servico');
  const [roomArea, setRoomArea] = useState<number>(12);
  const [roomPerimeter, setRoomPerimeter] = useState<number>(14);

  // Cálculos Reativos
  const cableResult = useMemo(() => {
    return calculateCableDimension({
      voltage,
      power,
      powerFactor,
      distance,
      maxVoltageDropPercent: maxDrop,
      phaseType,
    });
  }, [voltage, power, powerFactor, distance, maxDrop, phaseType]);

  const conduitResult = useMemo(() => {
    return calculateConduitDimension(conduitCables);
  }, [conduitCables]);

  const roomLoadsResult = useMemo(() => {
    return calculateRoomLoads({
      roomType,
      area: roomArea,
      perimeter: roomPerimeter,
    });
  }, [roomType, roomArea, roomPerimeter]);

  // Adicionar / Remover cabos no eletroduto
  const addConduitCable = () => {
    setConduitCables([...conduitCables, { section: 2.5, quantity: 1 }]);
  };

  const removeConduitCable = (index: number) => {
    if (conduitCables.length <= 1) return;
    setConduitCables(conduitCables.filter((_, i) => i !== index));
  };

  const updateConduitCable = (
    index: number,
    field: 'section' | 'quantity',
    value: number,
  ) => {
    const updated = [...conduitCables];
    updated[index] = { ...updated[index], [field]: value };
    setConduitCables(updated);
  };

  // Copiar resumo
  const copyCableSummary = () => {
    const text = `⚡ DIMENSIONAMENTO ELÉTRICO (NBR 5410)
• Carga: ${power}W | Tensão: ${voltage}V (${phaseType})
• Distância do circuito: ${distance}m
• Corrente de projeto (Ib): ${cableResult.nominalCurrent.toFixed(1)} A
• Bitola recomendada: ${cableResult.recommendedSection} mm² (Suporta até ${cableResult.cableMaxCurrent}A)
• Disjuntor termomagnético: ${cableResult.recommendedBreaker} A (Curva C/B)
• Queda de tensão real: ${cableResult.voltageDropPercent.toFixed(2)}% (${cableResult.voltageDropVolts.toFixed(1)}V)
• Perda por Joule: ${cableResult.jouleLossWatts.toFixed(1)} W
Calculado com precisão e segurança normativa NBR 5410.`;
    navigator.clipboard.writeText(text);
    toast.success('Resumo do dimensionamento copiado!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-navegação das ferramentas elétricas */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          {
            id: 'condutores',
            label: 'Condutores & Disjuntores',
            icon: <Lightning size={18} weight="duotone" />,
          },
          {
            id: 'eletrodutos',
            label: 'Taxa de Eletrodutos',
            icon: <Cpu size={18} weight="duotone" />,
          },
          {
            id: 'cargas',
            label: 'Cargas & Tomadas (TUG/TUE)',
            icon: <Sliders size={18} weight="duotone" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as ElectricSubTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 ${
              subTab === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- ABA 1: CONDUTORES & DISJUNTORES --- */}
      {subTab === 'condutores' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col gap-6"
        >
          {/* Presets Rápidos */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Sparkle size={16} weight="fill" className="text-amber-500" />
                Atalhos Rápidos (Cargas Comuns)
              </span>
              <span className="text-[11px] text-amber-700">
                Clique para aplicar
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ELECTRIC_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPower(p.power);
                    setVoltage(p.voltage);
                    setDistance(p.distance);
                    setPowerFactor(p.fp);
                    toast.success(`Parâmetros de "${p.name}" aplicados!`);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-amber-500 hover:text-white text-slate-700 border border-amber-200 hover:border-amber-500 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna de Inputs */}
            <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders size={18} className="text-amber-500" />
                Parâmetros do Circuito
              </h3>

              {/* Tipo de Alimentação e Tensão */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Tipo de Circuito
                  </label>
                  <select
                    value={phaseType}
                    onChange={(e) => setPhaseType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="monofasico">Monofásico / Bifásico</option>
                    <option value="trifasico">Trifásico (3 fases)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Tensão Nominal (V)
                  </label>
                  <select
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={127}>127 V</option>
                    <option value={220}>220 V</option>
                    <option value={380}>380 V (Trifásico)</option>
                  </select>
                </div>
              </div>

              {/* Potência e Distância */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Potência Total (Watts)
                  </label>
                  <input
                    type="number"
                    value={power || ''}
                    onChange={(e) =>
                      setPower(Math.max(0, Number(e.target.value)))
                    }
                    placeholder="Ex: 5500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Distância até o QDC (m)
                  </label>
                  <input
                    type="number"
                    value={distance || ''}
                    onChange={(e) =>
                      setDistance(Math.max(1, Number(e.target.value)))
                    }
                    placeholder="Ex: 20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fator de Potência e Queda Máxima */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Fator de Potência (cos φ)
                  </label>
                  <select
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={1.0}>1.00 (Chuveiro / Resistivo)</option>
                    <option value={0.95}>0.95 (Padrão Geral / TUGs)</option>
                    <option value={0.85}>
                      0.85 (Motores / Ar-condicionado)
                    </option>
                    <option value={0.9}>
                      0.90 (Iluminação LED com driver)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Queda Máx. Permitida (%)
                  </label>
                  <select
                    value={maxDrop}
                    onChange={(e) => setMaxDrop(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={2}>2% (Circuito Terminal Crítico)</option>
                    <option value={3}>3% (Terminal Padrão)</option>
                    <option value={4}>4% (Total Padrão NBR 5410)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coluna de Resultados Técnicos */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Card Destaque: Bitola e Disjuntor */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={16} weight="fill" />
                    Conforme NBR 5410
                  </span>
                  <button
                    onClick={copyCableSummary}
                    className="flex items-center gap-1 text-xs bg-white text-amber-800 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 active:scale-95 transition-all"
                  >
                    <Copy size={14} weight="bold" />
                    Copiar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="bg-black/15 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-[11px] font-medium text-amber-100 uppercase tracking-wider">
                      Cabo Recomendado
                    </p>
                    <p className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                      {cableResult.recommendedSection}{' '}
                      <span className="text-lg font-semibold">mm²</span>
                    </p>
                    <p className="text-[11px] text-amber-100 mt-1">
                      Suporta até <b>{cableResult.cableMaxCurrent} A</b>
                    </p>
                  </div>

                  <div className="bg-black/15 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-[11px] font-medium text-amber-100 uppercase tracking-wider">
                      Disjuntor DIN
                    </p>
                    <p className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                      {cableResult.recommendedBreaker}{' '}
                      <span className="text-lg font-semibold">A</span>
                    </p>
                    <p className="text-[11px] text-amber-100 mt-1">
                      Curva C (Geral) ou B
                    </p>
                  </div>
                </div>

                {/* Métricas Detalhadas */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
                  <div>
                    <p className="text-[10px] text-amber-100 uppercase">
                      Corrente (Ib)
                    </p>
                    <p className="text-sm font-bold">
                      {cableResult.nominalCurrent.toFixed(1)} A
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-100 uppercase">
                      Queda Real
                    </p>
                    <p className="text-sm font-bold">
                      {cableResult.voltageDropPercent.toFixed(2)}% (
                      {cableResult.voltageDropVolts.toFixed(1)}V)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-100 uppercase">
                      Perda Térmica
                    </p>
                    <p className="text-sm font-bold">
                      {cableResult.jouleLossWatts.toFixed(0)} W
                    </p>
                  </div>
                </div>
              </div>

              {/* Avisos e Notas Normativas */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Info size={16} className="text-indigo-600" />
                  Observações de Engenharia & Segurança
                </span>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  {cableResult.complianceNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle
                        size={14}
                        className="text-emerald-500 shrink-0 mt-0.5"
                        weight="fill"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                  {cableResult.warnings.map((warn, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg"
                    >
                      <WarningCircle
                        size={15}
                        className="text-amber-600 shrink-0 mt-0.5"
                        weight="fill"
                      />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- ABA 2: ELETRODUTOS --- */}
      {subTab === 'eletrodutos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Configuração dos Cabos */}
          <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={18} className="text-amber-500" />
                Cabos no Eletroduto
              </h3>
              <button
                onClick={addConduitCable}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-all"
              >
                + Adicionar Bitola
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {conduitCables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Bitola do Cabo
                    </label>
                    <select
                      value={item.section}
                      onChange={(e) =>
                        updateConduitCable(
                          idx,
                          'section',
                          Number(e.target.value),
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800"
                    >
                      {STANDARD_CABLE_SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s} mm²
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Qtd. Cabos
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={item.quantity}
                      onChange={(e) =>
                        updateConduitCable(
                          idx,
                          'quantity',
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800"
                    />
                  </div>
                  {conduitCables.length > 1 && (
                    <button
                      onClick={() => removeConduitCable(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 mt-4"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              💡 <b>Regra NBR 5410:</b> 1 cabo = máx 53% | 2 cabos = máx 31% | 3
              ou mais cabos = máx 40% de ocupação interna útil.
            </div>
          </div>

          {/* Resultado Eletroduto */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  Eletroduto Comercial Recomendado
                </span>
                <p className="text-3xl md:text-4xl font-black text-white mt-3">
                  {conduitResult.recommendedConduitNominal}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Diâmetro interno útil: {conduitResult.conduitInnerDiameterMm}
                  mm
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Taxa de Ocupação:</span>
                  <span
                    className={
                      conduitResult.isCompliant
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }
                  >
                    {conduitResult.actualOccupationPercent.toFixed(1)}% (Limite
                    NBR: {conduitResult.maxOccupationPercent}%)
                  </span>
                </div>
                {/* Barra de progresso da ocupação */}
                <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      conduitResult.isCompliant
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, conduitResult.actualOccupationPercent)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle
                size={18}
                className="text-emerald-500 shrink-0 mt-0.5"
                weight="fill"
              />
              <span>{conduitResult.notes}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- ABA 3: PREVISÃO DE CARGAS & TUGs --- */}
      {subTab === 'cargas' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Dimensões do Ambiente
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Tipo de Cômodo
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
              >
                <option value="cozinha_servico">
                  Cozinha / Área de Serviço / Lavanderia
                </option>
                <option value="quarto_sala">
                  Quarto / Sala / Escritório / Corredor
                </option>
                <option value="banheiro">Banheiro / Lavabo</option>
                <option value="varanda_garagem">
                  Varanda / Garagem / Hall Externo
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Área do Cômodo (m²)
                </label>
                <input
                  type="number"
                  value={roomArea || ''}
                  onChange={(e) =>
                    setRoomArea(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Perímetro Total (m)
                </label>
                <input
                  type="number"
                  value={roomPerimeter || ''}
                  onChange={(e) =>
                    setRoomPerimeter(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Previsão Mínima NBR 5410
              </h3>

              {/* Iluminação */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-900">
                  💡 Iluminação Geral
                </p>
                <p className="text-lg font-black text-amber-950 mt-0.5">
                  {roomLoadsResult.minLightingVA} VA
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  {roomLoadsResult.lightingDetails}
                </p>
              </div>

              {/* Tomadas TUGs */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <p className="text-xs font-bold text-indigo-900">
                  🔌 Tomadas de Uso Geral (TUG)
                </p>
                <p className="text-lg font-black text-indigo-950 mt-0.5">
                  {roomLoadsResult.minTugsCount}{' '}
                  {roomLoadsResult.minTugsCount === 1 ? 'Tomada' : 'Tomadas'} (
                  {roomLoadsResult.minTugsTotalVA} VA total)
                </p>
                <p className="text-[11px] text-indigo-800 mt-1">
                  {roomLoadsResult.tugsDetails}
                </p>
              </div>

              {/* Circuitos Específicos TUEs recomendados */}
              {roomLoadsResult.recommendedTues.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-700 mb-1.5">
                    ⚡ Circuitos Específicos Sugeridos (TUE):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {roomLoadsResult.recommendedTues.map((tue, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        {tue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
