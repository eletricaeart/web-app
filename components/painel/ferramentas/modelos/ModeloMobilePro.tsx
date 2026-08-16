// components/painel/ferramentas/modelos/ModeloMobilePro.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DeviceMobile,
  Plus,
  Minus,
  Trash,
  Door,
  FrameCorners,
  ShareNetwork,
  Copy,
  Sliders,
  CheckCircle,
  Lightning,
  Sparkle,
  ShieldCheck,
  HouseLine,
  Drop,
  Fire,
  Sun,
} from '@phosphor-icons/react';
import { calculateWallMaterials } from '@/utils/calculators/drywallWall';
import { calculateCeilingMaterials } from '@/utils/calculators/drywallCeiling';
import { calculateSancaMaterials } from '@/utils/calculators/drywallSanca';
import { toast } from 'sonner';

interface QuickRoom {
  id: string;
  name: string;
  category: 'quarto' | 'sala' | 'banheiro' | 'cozinha' | 'personalizado';
  type: 'parede' | 'forro' | 'ambos';
  wallLength: number;
  wallHeight: number;
  ceilingWidth: number;
  ceilingLength: number;
  doorsCount: number;
  windowsCount: number;
  boardType: 'ST' | 'RU' | 'RF';
  profileSize: 48 | 70 | 90;
  studSpacing: 0.4 | 0.6;
  useInsulation: boolean;
}

export default function ModeloMobilePro() {
  const [rooms, setRooms] = useState<QuickRoom[]>([
    {
      id: '1',
      name: 'Banheiro Suíte',
      category: 'banheiro',
      type: 'ambos',
      wallLength: 8.0,
      wallHeight: 2.7,
      ceilingWidth: 1.6,
      ceilingLength: 2.4,
      doorsCount: 1,
      windowsCount: 1,
      boardType: 'RU', // Chapa verde
      profileSize: 70,
      studSpacing: 0.6,
      useInsulation: false,
    },
    {
      id: '2',
      name: 'Dormitório 01',
      category: 'quarto',
      type: 'parede',
      wallLength: 12.0,
      wallHeight: 2.8,
      ceilingWidth: 3.0,
      ceilingLength: 4.0,
      doorsCount: 1,
      windowsCount: 1,
      boardType: 'ST',
      profileSize: 70,
      studSpacing: 0.6,
      useInsulation: true,
    },
  ]);

  const [activeRoomIndex, setActiveRoomIndex] = useState<number>(0);
  const [safetyMargin, setSafetyMargin] = useState<number>(1.05); // 5%

  const activeRoom = rooms[activeRoomIndex] || rooms[0];

  const updateActiveRoom = (patch: Partial<QuickRoom>) => {
    if (!activeRoom) return;
    setRooms((prev) =>
      prev.map((r, idx) => (idx === activeRoomIndex ? { ...r, ...patch } : r)),
    );
  };

  // Presets rápidos com 1 clique
  const applyPreset = (preset: 'banheiro' | 'quarto' | 'sala' | 'cozinha') => {
    const presetsConfig: Record<string, Partial<QuickRoom>> = {
      banheiro: {
        name: `Banheiro ${rooms.length + 1}`,
        category: 'banheiro',
        type: 'ambos',
        boardType: 'RU',
        wallLength: 7.0,
        wallHeight: 2.7,
        ceilingWidth: 1.5,
        ceilingLength: 2.0,
        doorsCount: 1,
        windowsCount: 1,
        profileSize: 70,
        studSpacing: 0.6,
        useInsulation: false,
      },
      quarto: {
        name: `Quarto ${rooms.length + 1}`,
        category: 'quarto',
        type: 'parede',
        boardType: 'ST',
        wallLength: 12.0,
        wallHeight: 2.8,
        ceilingWidth: 3.0,
        ceilingLength: 3.5,
        doorsCount: 1,
        windowsCount: 1,
        profileSize: 70,
        studSpacing: 0.6,
        useInsulation: false,
      },
      sala: {
        name: `Sala ${rooms.length + 1}`,
        category: 'sala',
        type: 'ambos',
        boardType: 'ST',
        wallLength: 16.0,
        wallHeight: 2.8,
        ceilingWidth: 4.0,
        ceilingLength: 5.0,
        doorsCount: 2,
        windowsCount: 2,
        profileSize: 70,
        studSpacing: 0.6,
        useInsulation: true,
      },
      cozinha: {
        name: `Cozinha ${rooms.length + 1}`,
        category: 'cozinha',
        type: 'ambos',
        boardType: 'RU',
        wallLength: 10.0,
        wallHeight: 2.7,
        ceilingWidth: 2.5,
        ceilingLength: 3.5,
        doorsCount: 1,
        windowsCount: 1,
        profileSize: 70,
        studSpacing: 0.4, // espaçamento menor para pendurar armários
        useInsulation: false,
      },
    };

    const newId = Date.now().toString();
    const newRoom: QuickRoom = {
      id: newId,
      name: `Novo Ambiente ${rooms.length + 1}`,
      category: preset,
      type: 'parede',
      wallLength: 10.0,
      wallHeight: 2.8,
      ceilingWidth: 3.0,
      ceilingLength: 4.0,
      doorsCount: 1,
      windowsCount: 1,
      boardType: 'ST',
      profileSize: 70,
      studSpacing: 0.6,
      useInsulation: false,
      ...presetsConfig[preset],
    };

    setRooms([...rooms, newRoom]);
    setActiveRoomIndex(rooms.length);
    toast.success(`Preset "${newRoom.name}" adicionado com sucesso!`);
  };

  const removeRoom = (index: number) => {
    if (rooms.length <= 1) {
      toast.error('Mantenha ao menos um ambiente.');
      return;
    }
    const updated = rooms.filter((_, i) => i !== index);
    setRooms(updated);
    setActiveRoomIndex(Math.max(0, index - 1));
    toast.success('Ambiente removido');
  };

  // Cálculo individual
  const calculateSingleRoom = (room: QuickRoom) => {
    const list: { item: string; qtd: number; unit: string }[] = [];

    // Parede
    if (room.type === 'parede' || room.type === 'ambos') {
      const openings = [
        ...Array.from({ length: room.doorsCount }).map(() => ({
          width: 0.8,
          height: 2.1,
        })),
        ...Array.from({ length: room.windowsCount }).map(() => ({
          width: 1.2,
          height: 1.0,
        })),
      ];

      const wallMats = calculateWallMaterials({
        sections: [
          {
            wallLength: room.wallLength,
            wallHeight: room.wallHeight,
            openings,
          },
        ],
        studSpacing: room.studSpacing,
        boardType: room.boardType,
        profileSize: room.profileSize,
      });

      wallMats.forEach((m) => {
        if (!m.item.toLowerCase().includes('área total')) {
          list.push(m);
        }
      });

      if (room.useInsulation) {
        const netArea =
          room.wallLength * room.wallHeight -
          (room.doorsCount * (0.8 * 2.1) + room.windowsCount * (1.2 * 1.0));
        list.push({
          item: 'Lã de Vidro / Pet Acústica',
          qtd: Number(netArea.toFixed(2)),
          unit: 'm²',
        });
      }
    }

    // Forro
    if (room.type === 'forro' || room.type === 'ambos') {
      const ceilingMats = calculateCeilingMaterials({
        sections: [
          {
            width: room.ceilingWidth,
            length: room.ceilingLength,
          },
        ],
        boardType: room.boardType,
      });

      ceilingMats.forEach((m) => {
        if (!m.item.toLowerCase().includes('área total')) {
          list.push(m);
        }
      });
    }

    return list;
  };

  // Consolidação Total de Todos os Ambientes
  const consolidatedMaterials = useMemo(() => {
    const totals: Record<string, { item: string; qtd: number; unit: string }> =
      {};

    rooms.forEach((r) => {
      const mats = calculateSingleRoom(r);
      mats.forEach((m) => {
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
  }, [rooms, safetyMargin]);

  const sendWhatsAppBudget = () => {
    let msg = `🛠️ *ORÇAMENTO DE DRYWALL - CANTEIRO ÁGIL*\n`;
    msg += `📍 *ELÉTRICA & ART*\n\n`;

    rooms.forEach((r, idx) => {
      msg += `*${idx + 1}. ${r.name.toUpperCase()}* (${r.type})\n`;
      if (r.type === 'parede' || r.type === 'ambos') {
        msg += `   • Parede: ${r.wallLength}m x ${r.wallHeight}m (Portas: ${r.doorsCount}, Janelas: ${r.windowsCount})\n`;
      }
      if (r.type === 'forro' || r.type === 'ambos') {
        msg += `   • Forro: ${r.ceilingWidth}m x ${r.ceilingLength}m (${(r.ceilingWidth * r.ceilingLength).toFixed(1)}m²)\n`;
      }
      msg += `   • Chapa: ${r.boardType === 'RU' ? 'Verde (Umidade)' : r.boardType === 'RF' ? 'Rosa (Fogo)' : 'Branca (ST)'}\n\n`;
    });

    msg += `📦 *LISTA DE MATERIAIS PARA COMPRA (CONSOLIDADO):*\n`;
    consolidatedMaterials.forEach((m) => {
      msg += `• ${m.item}: *${m.qtd} ${m.unit}*\n`;
    });

    msg += `\n_Orçamento gerado via aplicativo no canteiro de obras._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-28 text-slate-800">
      {/* Header Mobile-First */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <DeviceMobile size={22} weight="duotone" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 block">
                Modelo 2: Canteiro Ágil
              </span>
              <h1 className="text-xl font-black text-white">
                Calculadora Touch p/ Obra
              </h1>
            </div>
          </div>

          <button
            onClick={sendWhatsAppBudget}
            className="px-3.5 py-2 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <ShareNetwork size={16} weight="bold" /> WhatsApp
          </button>
        </div>

        {/* Barra de Presets Rápidos */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="text-[11px] font-bold text-amber-100 mb-2 flex items-center gap-1">
            <Lightning size={14} weight="fill" /> + Adicionar Ambiente com 1
            Toque:
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => applyPreset('banheiro')}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
            >
              <Drop size={18} weight="fill" className="text-emerald-200" />
              <span className="text-[11px] truncate">Banheiro RU</span>
            </button>
            <button
              onClick={() => applyPreset('quarto')}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
            >
              <HouseLine size={18} weight="fill" className="text-amber-100" />
              <span className="text-[11px] truncate">Quarto ST</span>
            </button>
            <button
              onClick={() => applyPreset('sala')}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
            >
              <Sun size={18} weight="fill" className="text-yellow-200" />
              <span className="text-[11px] truncate">Sala Ampla</span>
            </button>
            <button
              onClick={() => applyPreset('cozinha')}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
            >
              <ShieldCheck size={18} weight="fill" className="text-teal-200" />
              <span className="text-[11px] truncate">Cozinha RU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs dos Ambientes Cadastrados */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {rooms.map((room, idx) => (
          <button
            key={room.id}
            onClick={() => setActiveRoomIndex(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
              activeRoomIndex === idx
                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>
              {idx + 1}. {room.name}
            </span>
            {room.boardType === 'RU' && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                title="Chapa Verde RU"
              />
            )}
          </button>
        ))}
      </div>

      {activeRoom && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
          {/* Topo do Card de Edição */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <input
                type="text"
                value={activeRoom.name}
                onChange={(e) => updateActiveRoom({ name: e.target.value })}
                className="font-black text-lg text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Toque no nome para editar
              </span>
            </div>

            {rooms.length > 1 && (
              <button
                onClick={() => removeRoom(activeRoomIndex)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <Trash size={16} /> Excluir
              </button>
            )}
          </div>

          {/* Seleção rápida do tipo de serviço no cômodo */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
              Tipo de Aplicação no Cômodo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'parede', label: 'Apenas Paredes' },
                { id: 'forro', label: 'Apenas Forro' },
                { id: 'ambos', label: 'Parede + Forro' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateActiveRoom({ type: opt.id as any })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition ${
                    activeRoom.type === opt.id
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUTS DE PAREDE COM STEPPERS GRANDES */}
          {(activeRoom.type === 'parede' || activeRoom.type === 'ambos') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                🧱 Medidas da Parede
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Comprimento */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Comprimento Total (m)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          wallLength: Math.max(
                            0.5,
                            Number((activeRoom.wallLength - 0.5).toFixed(1)),
                          ),
                        })
                      }
                      className="w-11 h-11 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-xs"
                    >
                      <Minus size={16} weight="bold" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="0.1"
                        value={activeRoom.wallLength}
                        onChange={(e) =>
                          updateActiveRoom({
                            wallLength: Math.max(0.1, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-center text-lg font-black text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                        m
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          wallLength: Number(
                            (activeRoom.wallLength + 0.5).toFixed(1),
                          ),
                        })
                      }
                      className="w-11 h-11 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-xs"
                    >
                      <Plus size={16} weight="bold" />
                    </button>
                  </div>
                </div>

                {/* Pé-direito com botões de 1 toque */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Pé-Direito / Altura (m)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    {[2.6, 2.7, 2.8, 3.0].map((h) => (
                      <button
                        key={h}
                        onClick={() => updateActiveRoom({ wallHeight: h })}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                          activeRoom.wallHeight === h
                            ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {h.toFixed(2)}m
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={activeRoom.wallHeight}
                    onChange={(e) =>
                      updateActiveRoom({
                        wallHeight: Math.max(0.1, Number(e.target.value)),
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-center font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Botões de portas e janelas com contadores rápidos */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Door
                      size={20}
                      weight="duotone"
                      className="text-amber-600"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Portas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          doorsCount: Math.max(0, activeRoom.doorsCount - 1),
                        })
                      }
                      className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-black text-sm w-4 text-center">
                      {activeRoom.doorsCount}
                    </span>
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          doorsCount: activeRoom.doorsCount + 1,
                        })
                      }
                      className="w-7 h-7 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FrameCorners
                      size={20}
                      weight="duotone"
                      className="text-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Janelas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          windowsCount: Math.max(
                            0,
                            activeRoom.windowsCount - 1,
                          ),
                        })
                      }
                      className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-black text-sm w-4 text-center">
                      {activeRoom.windowsCount}
                    </span>
                    <button
                      onClick={() =>
                        updateActiveRoom({
                          windowsCount: activeRoom.windowsCount + 1,
                        })
                      }
                      className="w-7 h-7 bg-indigo-100 text-indigo-800 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INPUTS DE FORRO COM STEPPERS */}
          {(activeRoom.type === 'forro' || activeRoom.type === 'ambos') && (
            <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-200/80 space-y-4">
              <span className="text-xs font-black uppercase text-cyan-900 tracking-wider flex items-center gap-1.5">
                📐 Medidas do Forro (Teto)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Largura (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={activeRoom.ceilingWidth}
                    onChange={(e) =>
                      updateActiveRoom({
                        ceilingWidth: Math.max(0.1, Number(e.target.value)),
                      })
                    }
                    className="w-full bg-white border border-cyan-300 rounded-xl py-2 px-3 text-center font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Comprimento (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={activeRoom.ceilingLength}
                    onChange={(e) =>
                      updateActiveRoom({
                        ceilingLength: Math.max(0.1, Number(e.target.value)),
                      })
                    }
                    className="w-full bg-white border border-cyan-300 rounded-xl py-2 px-3 text-center font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OPÇÕES DE CHAPA E PERFIL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Tipo da Chapa Drywall
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'ST',
                    label: 'ST Padrão',
                    color: 'bg-slate-100 text-slate-800',
                  },
                  {
                    id: 'RU',
                    label: 'RU Verde',
                    color: 'bg-emerald-100 text-emerald-800',
                  },
                  {
                    id: 'RF',
                    label: 'RF Fogo',
                    color: 'bg-rose-100 text-rose-800',
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateActiveRoom({ boardType: b.id as any })}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      activeRoom.boardType === b.id
                        ? `${b.color} border-current shadow-xs`
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Isolamento Térmico/Acústico
              </label>
              <button
                onClick={() =>
                  updateActiveRoom({ useInsulation: !activeRoom.useInsulation })
                }
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeRoom.useInsulation
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle
                  size={16}
                  weight={activeRoom.useInsulation ? 'fill' : 'regular'}
                />
                {activeRoom.useInsulation
                  ? 'Com Lã de Vidro (Acústico)'
                  : 'Sem Lã de Vidro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUMO TOTAL DE MATERIAIS PARA COMPRA */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Lista Geral de Compra
            </span>
            <h3 className="text-lg font-black text-white">
              Total Consolidado ({rooms.length} Ambientes)
            </h3>
          </div>
          <button
            onClick={() => {
              const text = consolidatedMaterials
                .map((m) => `• ${m.item}: ${m.qtd} ${m.unit}`)
                .join('\n');
              navigator.clipboard.writeText(text);
              toast.success('Lista de compras copiada!');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Copy size={14} /> Copiar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {consolidatedMaterials.map((mat, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between"
            >
              <span className="text-xs font-medium text-slate-200 pr-2">
                {mat.item}
              </span>
              <div className="text-right whitespace-nowrap">
                <span className="text-sm font-black text-amber-400">
                  {mat.qtd}
                </span>
                <span className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                  {mat.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
