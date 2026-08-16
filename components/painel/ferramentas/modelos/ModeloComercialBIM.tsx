// components/painel/ferramentas/modelos/ModeloComercialBIM.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CurrencyDollar,
  Package,
  Receipt,
  FilePdf,
  ShareNetwork,
  Copy,
  Sliders,
  Plus,
  Trash,
  CheckCircle,
  PencilSimple,
  Buildings,
  ChartPieSlice,
  Tag,
  ArrowSquareOut,
  Info,
} from '@phosphor-icons/react';
import {
  calculateWallMaterials,
  WallSection,
} from '@/utils/calculators/drywallWall';
import {
  calculateCeilingMaterials,
  CeilingSection,
} from '@/utils/calculators/drywallCeiling';
import { calculateSancaMaterials } from '@/utils/calculators/drywallSanca';
import { toast } from 'sonner';

interface CommercialRoom {
  id: string;
  name: string;
  type: 'parede' | 'forro' | 'sanca';
  wallLength: number;
  wallHeight: number;
  ceilingWidth: number;
  ceilingLength: number;
  sancaPerimeter: number;
  sancaHeight: number;
  doorsCount: number;
  windowsCount: number;
  boardType: 'ST' | 'RU' | 'RF';
  profileSize: 48 | 70 | 90;
  studSpacing: 0.4 | 0.6;
  useInsulation: boolean;
}

// Preços padrão médios de mercado para materiais
const DEFAULT_PRICES: Record<string, number> = {
  'Placa Drywall ST (1.20x1.80)': 38.5,
  'Placa Drywall RU (Umidade) (1.20x1.80)': 54.0,
  'Placa Drywall RF (Fogo) (1.20x1.80)': 58.0,
  'Guia 48mm (3m)': 21.0,
  'Guia 70mm (3m)': 24.5,
  'Guia 90mm (3m)': 29.0,
  'Montante 48mm (3m)': 23.5,
  'Montante 70mm (3m)': 27.0,
  'Montante 90mm (3m)': 32.0,
  'Tabica Metálica (3m)': 18.5,
  'Perfil Canaleta F530 (3m)': 19.5,
  'Emenda para Perfil F530': 2.8,
  'Regulador / Tirante': 3.5,
  'Parafuso GN25': 0.12, // Caixa 500 un ~ R$ 60
  'Parafuso LB 9,5 (ponta broca)': 0.15, // Cento ~ R$ 15
  'Parafuso / Bucha n°6': 0.35,
  'Parafuso / Bucha p/ Tabica': 0.35,
  'Fita Drywall': 0.8, // Rolo ~ R$ 60
  'Fita Telada': 0.9,
  'Fita Banda Acústica': 2.5,
  'Massa p/ Drywall': 4.5, // Balde 28kg ~ R$ 110 (R$ 3.9/kg)
  'Lã de Vidro / Pet Acústica': 22.0, // m²
};

export default function ModeloComercialBIM() {
  const [rooms, setRooms] = useState<CommercialRoom[]>([
    {
      id: '1',
      name: 'Paredes Divisórias - Escritório',
      type: 'parede',
      wallLength: 14.5,
      wallHeight: 2.8,
      ceilingWidth: 4.0,
      ceilingLength: 5.0,
      sancaPerimeter: 18.0,
      sancaHeight: 0.2,
      doorsCount: 2,
      windowsCount: 1,
      boardType: 'ST',
      profileSize: 70,
      studSpacing: 0.6,
      useInsulation: true,
    },
    {
      id: '2',
      name: 'Forro Rebaixado c/ Tabica',
      type: 'forro',
      wallLength: 4.0,
      wallHeight: 2.8,
      ceilingWidth: 4.5,
      ceilingLength: 6.0,
      sancaPerimeter: 21.0,
      sancaHeight: 0.2,
      doorsCount: 0,
      windowsCount: 0,
      boardType: 'ST',
      profileSize: 48,
      studSpacing: 0.6,
      useInsulation: false,
    },
  ]);

  // Preços unitários customizáveis
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);

  // Parâmetros comerciais
  const [laborCostPerM2, setLaborCostPerM2] = useState<number>(45.0); // R$ 45/m² de mão de obra
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(30); // 30% lucro/BDI
  const [activeTab, setActiveTab] = useState<
    'orcamento' | 'embalagens' | 'precos'
  >('orcamento');

  // Adicionar novo cômodo
  const addRoom = (type: 'parede' | 'forro' | 'sanca') => {
    const newId = Date.now().toString();
    const newRoom: CommercialRoom = {
      id: newId,
      name:
        type === 'parede'
          ? `Parede ${rooms.length + 1}`
          : type === 'forro'
            ? `Forro ${rooms.length + 1}`
            : `Sanca ${rooms.length + 1}`,
      type,
      wallLength: 8.0,
      wallHeight: 2.8,
      ceilingWidth: 3.5,
      ceilingLength: 4.0,
      sancaPerimeter: 15.0,
      sancaHeight: 0.2,
      doorsCount: 1,
      windowsCount: 0,
      boardType: 'ST',
      profileSize: 70,
      studSpacing: 0.6,
      useInsulation: false,
    };
    setRooms([...rooms, newRoom]);
    toast.success('Novo ambiente adicionado!');
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) {
      toast.error('Mantenha ao menos um ambiente.');
      return;
    }
    setRooms(rooms.filter((r) => r.id !== id));
    toast.success('Ambiente removido');
  };

  // Calcular materiais de um cômodo
  const calculateRoomMaterials = (room: CommercialRoom) => {
    if (room.type === 'parede') {
      const openings = [
        ...Array.from({ length: room.doorsCount }).map(() => ({
          width: 0.9,
          height: 2.1,
        })),
        ...Array.from({ length: room.windowsCount }).map(() => ({
          width: 1.2,
          height: 1.2,
        })),
      ];
      const sections: WallSection[] = [
        { wallLength: room.wallLength, wallHeight: room.wallHeight, openings },
      ];
      const res = calculateWallMaterials({
        sections,
        studSpacing: room.studSpacing,
        boardType: room.boardType,
        profileSize: room.profileSize,
      });

      if (room.useInsulation) {
        const netArea =
          room.wallLength * room.wallHeight -
          (room.doorsCount * 0.9 * 2.1 + room.windowsCount * 1.2 * 1.2);
        res.push({
          item: 'Lã de Vidro / Pet Acústica',
          qtd: Number(netArea.toFixed(2)),
          unit: 'm²',
        });
      }
      return res;
    } else if (room.type === 'forro') {
      const sections: CeilingSection[] = [
        { width: room.ceilingWidth, length: room.ceilingLength },
      ];
      return calculateCeilingMaterials({
        sections,
        boardType: room.boardType,
      });
    } else {
      return calculateSancaMaterials({
        perimeter: room.sancaPerimeter,
        height: room.sancaHeight,
        boardType: room.boardType,
      });
    }
  };

  // Metragem quadrada total instalada
  const totalAreaM2 = useMemo(() => {
    let total = 0;
    rooms.forEach((r) => {
      if (r.type === 'parede') {
        const gross = r.wallLength * r.wallHeight;
        const openings =
          r.doorsCount * (0.9 * 2.1) + r.windowsCount * (1.2 * 1.2);
        total += Math.max(0, gross - openings);
      } else if (r.type === 'forro') {
        total += r.ceilingWidth * r.ceilingLength;
      } else {
        total += r.sancaPerimeter * r.sancaHeight;
      }
    });
    return Number(total.toFixed(2));
  }, [rooms]);

  // Lista Consolidada de Materiais (sem somar 'área total')
  const consolidatedMaterials = useMemo(() => {
    const totals: Record<string, { item: string; qtd: number; unit: string }> =
      {};

    rooms.forEach((r) => {
      const mats = calculateRoomMaterials(r);
      mats.forEach((m) => {
        if (m.item.toLowerCase().includes('área total')) return;
        if (!totals[m.item]) {
          totals[m.item] = { item: m.item, qtd: Number(m.qtd), unit: m.unit };
        } else {
          totals[m.item].qtd += Number(m.qtd);
        }
      });
    });

    return Object.values(totals).map((m) => ({
      ...m,
      qtd: Number.isInteger(m.qtd) ? m.qtd : Number(m.qtd.toFixed(2)),
    }));
  }, [rooms]);

  // Conversão para Embalagens Comerciais (Pacotes Fechados)
  const commercialPackages = useMemo(() => {
    return consolidatedMaterials.map((mat) => {
      let packageText = '';
      let packageCount = mat.qtd;
      let packageUnit = mat.unit;
      let unitPrice = prices[mat.item] || 0;

      if (mat.item === 'Parafuso GN25') {
        // Caixas de 500 un
        const boxes = Math.ceil(mat.qtd / 500);
        packageText = `${boxes} cx (${boxes * 500} un - sobra ${boxes * 500 - mat.qtd} un)`;
        packageCount = boxes;
        packageUnit = 'cx 500un';
      } else if (mat.item === 'Parafuso LB 9,5 (ponta broca)') {
        // Centos ou caixas de 500
        const boxes = Math.ceil(mat.qtd / 100);
        packageText = `${boxes} cento(s) (${boxes * 100} un)`;
        packageCount = boxes;
        packageUnit = 'cento';
      } else if (mat.item === 'Massa p/ Drywall') {
        // Baldes de 28kg
        const buckets28 = Math.floor(mat.qtd / 28);
        const remainder = mat.qtd % 28;
        if (buckets28 > 0 && remainder > 0) {
          packageText = `${buckets28} balde(s) 28kg + 1 balde 15kg`;
        } else if (buckets28 > 0 && remainder === 0) {
          packageText = `${buckets28} balde(s) 28kg`;
        } else {
          packageText = `1 balde 15kg ou 28kg`;
        }
      } else if (mat.item.includes('Fita')) {
        // Rolos de 150m ou 45m
        const rolls150 = Math.ceil(mat.qtd / 150);
        packageText = `${rolls150} rolo(s) de 150m`;
      } else if (mat.item === 'Regulador / Tirante') {
        // Pacotes de 50 ou 100
        const packs = Math.ceil(mat.qtd / 50);
        packageText = `${packs} pct(s) c/ 50un`;
      } else {
        packageText = `${mat.qtd} ${mat.unit}`;
      }

      const totalItemCost = Number(mat.qtd) * unitPrice;

      return {
        ...mat,
        packageText,
        unitPrice,
        totalItemCost,
      };
    });
  }, [consolidatedMaterials, prices]);

  // Totais Financeiros
  const financialSummary = useMemo(() => {
    const totalMaterialsCost = commercialPackages.reduce(
      (acc, item) => acc + item.totalItemCost,
      0,
    );
    const totalLaborCost = totalAreaM2 * laborCostPerM2;
    const directCost = totalMaterialsCost + totalLaborCost;
    const profitMarginValue = directCost * (profitMarginPercent / 100);
    const finalBudgetPrice = directCost + profitMarginValue;
    const pricePerM2 = totalAreaM2 > 0 ? finalBudgetPrice / totalAreaM2 : 0;

    return {
      totalMaterialsCost,
      totalLaborCost,
      directCost,
      profitMarginValue,
      finalBudgetPrice,
      pricePerM2,
    };
  }, [commercialPackages, totalAreaM2, laborCostPerM2, profitMarginPercent]);

  const sendCommercialWhatsApp = () => {
    let msg = `📊 *PROPOSTA COMERCIAL & ORÇAMENTO DRYWALL*\n`;
    msg += `🏢 *ELÉTRICA & ART — Soluções em Construção a Seco*\n\n`;
    msg += `📐 *METRAGEM TOTAL DA OBRA:* ${totalAreaM2} m²\n\n`;

    msg += `*AMBIENTES INCLUÍDOS:*\n`;
    rooms.forEach((r, idx) => {
      msg += `${idx + 1}. *${r.name}* (${r.type})\n`;
    });

    msg += `\n💰 *RESUMO DO INVESTIMENTO:*\n`;
    msg += `• Custo Estimado de Materiais: R$ ${financialSummary.totalMaterialsCost.toFixed(2)}\n`;
    msg += `• Mão de Obra Especializada (${totalAreaM2}m²): R$ ${financialSummary.totalLaborCost.toFixed(2)}\n`;
    msg += `• *VALOR TOTAL DO SERVIÇO:* *R$ ${financialSummary.finalBudgetPrice.toFixed(2)}*\n`;
    msg += `• Valor Médio Fechado: *R$ ${financialSummary.pricePerM2.toFixed(2)} / m²*\n\n`;

    msg += `📋 *LISTA DE MATERIAIS CONSOLIDADA:*\n`;
    commercialPackages.forEach((m) => {
      msg += `• ${m.item}: ${m.packageText}\n`;
    });

    msg += `\n_Orçamento com garantia técnica ABNT e suporte completo Elétrica & Art._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 text-slate-800">
      {/* Header Comercial & Engenharia */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">
              <CurrencyDollar size={18} weight="bold" /> Modelo 3: Orçamentista
              Pro & Engenharia Comercial
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Orçamento de Custos, Venda e Embalagens
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Cálculo completo de compras com conversão para caixas/baldes
              fechados, precificação de mão de obra (R$/m²), BDI de lucro e
              envio de proposta comercial.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={sendCommercialWhatsApp}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition"
            >
              <ShareNetwork size={16} weight="bold" /> Enviar Proposta
              (WhatsApp)
            </button>
          </div>
        </div>

        {/* Big Numbers de Resumo no Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-bold uppercase block">
              Área Total
            </span>
            <span className="text-xl font-black text-white">
              {totalAreaM2}{' '}
              <small className="text-xs text-slate-400 font-normal">m²</small>
            </span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-bold uppercase block">
              Materiais
            </span>
            <span className="text-xl font-black text-emerald-400">
              R$ {financialSummary.totalMaterialsCost.toFixed(2)}
            </span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-cyan-400 font-bold uppercase block">
              Mão de Obra
            </span>
            <span className="text-xl font-black text-cyan-400">
              R$ {financialSummary.totalLaborCost.toFixed(2)}
            </span>
          </div>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 rounded-2xl text-white shadow-lg">
            <span className="text-[11px] text-emerald-100 font-bold uppercase block">
              Preço Final Sugerido
            </span>
            <span className="text-xl font-black">
              R$ {financialSummary.finalBudgetPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Internas do Modelo 3 */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('orcamento')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'orcamento'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Receipt size={16} weight="bold" /> Ambientes & Projeto
        </button>
        <button
          onClick={() => setActiveTab('embalagens')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'embalagens'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Package size={16} weight="bold" /> Embalagens & Compra
        </button>
        <button
          onClick={() => setActiveTab('precos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'precos'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Tag size={16} weight="bold" /> Tabela de Preços
        </button>
      </div>

      {/* CONTEÚDO TAB: ORÇAMENTO & AMBIENTES */}
      {activeTab === 'orcamento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista e Configuração dos Ambientes */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">
                Ambientes Cadastrados ({rooms.length})
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => addRoom('parede')}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} weight="bold" /> + Parede
                </button>
                <button
                  onClick={() => addRoom('forro')}
                  className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} weight="bold" /> + Forro
                </button>
                <button
                  onClick={() => addRoom('sanca')}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} weight="bold" /> + Sanca
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {rooms.map((room, rIdx) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                        {rIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) =>
                          setRooms(
                            rooms.map((r) =>
                              r.id === room.id
                                ? { ...r, name: e.target.value }
                                : r,
                            ),
                          )
                        }
                        className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          room.type === 'parede'
                            ? 'bg-amber-100 text-amber-800'
                            : room.type === 'forro'
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {room.type}
                      </span>
                    </div>

                    {rooms.length > 1 && (
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Inputs específicos do tipo */}
                  {room.type === 'parede' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Comprimento
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={room.wallLength}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      wallLength: Math.max(
                                        0.1,
                                        Number(e.target.value),
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Altura / Pé-dir.
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={room.wallHeight}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      wallHeight: Math.max(
                                        0.1,
                                        Number(e.target.value),
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Portas (0.9x2.1)
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={room.doorsCount}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      doorsCount: Math.max(
                                        0,
                                        Number(e.target.value),
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Chapa
                        </span>
                        <select
                          value={room.boardType}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? { ...r, boardType: e.target.value as any }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        >
                          <option value="ST">ST Padrão</option>
                          <option value="RU">RU Verde</option>
                          <option value="RF">RF Rosa</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {room.type === 'forro' && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Largura (m)
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={room.ceilingWidth}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      ceilingWidth: Math.max(
                                        0.1,
                                        Number(e.target.value),
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Comprimento (m)
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={room.ceilingLength}
                          onChange={(e) =>
                            setRooms(
                              rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      ceilingLength: Math.max(
                                        0.1,
                                        Number(e.target.value),
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">
                          Área Forro
                        </span>
                        <div className="bg-slate-100 rounded-lg p-1.5 font-black text-cyan-900">
                          {(room.ceilingWidth * room.ceilingLength).toFixed(2)}{' '}
                          m²
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DRE / Painel de Parâmetros Comerciais */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Sliders size={16} weight="bold" /> Engenharia de Preço & BDI
              </h3>

              {/* Mão de Obra */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-600">
                    Mão de Obra por m²
                  </span>
                  <span className="font-black text-indigo-600">
                    R$ {laborCostPerM2.toFixed(2)} / m²
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="120"
                  step="5"
                  value={laborCostPerM2}
                  onChange={(e) => setLaborCostPerM2(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Margem de Lucro BDI */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-600">
                    Margem de Lucro (BDI)
                  </span>
                  <span className="font-black text-emerald-600">
                    {profitMarginPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={profitMarginPercent}
                  onChange={(e) =>
                    setProfitMarginPercent(Number(e.target.value))
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Detalhamento de Custos */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Materiais:</span>
                  <span className="font-bold">
                    R$ {financialSummary.totalMaterialsCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Mão de Obra ({totalAreaM2}m²):</span>
                  <span className="font-bold">
                    R$ {financialSummary.totalLaborCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Custo Direto:</span>
                  <span className="font-bold text-slate-800">
                    R$ {financialSummary.directCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl">
                  <span>Lucro Bruto ({profitMarginPercent}%):</span>
                  <span>
                    + R$ {financialSummary.profitMarginValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t">
                  <span>Preço Total Proposta:</span>
                  <span className="text-emerald-600">
                    R$ {financialSummary.finalBudgetPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO TAB: EMBALAGENS & LISTA DE COMPRA */}
      {activeTab === 'embalagens' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-800">
                Lista de Compras c/ Conversão para Embalagens Fechadas
              </h3>
              <p className="text-xs text-slate-400">
                Converte quantidades líquidas da norma em caixas de 500
                parafusos, baldes de 28kg e rolos comerciais
              </p>
            </div>
            <button
              onClick={() => {
                const txt = commercialPackages
                  .map(
                    (m) =>
                      `• ${m.item}: ${m.packageText} (Estimado: R$ ${m.totalItemCost.toFixed(2)})`,
                  )
                  .join('\n');
                navigator.clipboard.writeText(txt);
                toast.success('Lista de compras copiada!');
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start transition"
            >
              <Copy size={16} /> Copiar Lista para Depósito
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Item / Material</th>
                  <th className="pb-3 text-center">Qtd. Líquida</th>
                  <th className="pb-3 text-center">Embalagem Comercial</th>
                  <th className="pb-3 text-right">Preço Unit. (R$)</th>
                  <th className="pb-3 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commercialPackages.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-700">
                      {item.item}
                    </td>
                    <td className="py-3 text-center font-semibold text-slate-500">
                      {item.qtd} {item.unit}
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-amber-50 border border-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
                        {item.packageText}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600 font-mono">
                      R$ {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-black text-emerald-600 font-mono">
                      R$ {item.totalItemCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO TAB: TABELA DE PREÇOS UNITÁRIOS */}
      {activeTab === 'precos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-800">
                Tabela de Preços Unitários de Mercado
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste os valores unitários conforme a cotação do seu fornecedor
                local
              </p>
            </div>
            <button
              onClick={() => {
                setPrices(DEFAULT_PRICES);
                toast.success('Preços restaurados para os padrões!');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
            >
              Restaurar Padrões
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(prices).map(([name, price]) => (
              <div
                key={name}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
              >
                <span
                  className="text-xs font-bold text-slate-700 line-clamp-1"
                  title={name}
                >
                  {name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.1"
                    value={price}
                    onChange={(e) =>
                      setPrices({
                        ...prices,
                        [name]: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-sm font-bold text-slate-800 text-right focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
