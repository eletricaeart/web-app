// components/painel/ferramentas/modelos/ModeloVisualStudio.tsx
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  Cube,
  PencilSimple,
  Trash,
  Plus,
  ArrowsOutCardinal,
  GridFour,
  CheckCircle,
  Copy,
  ShareNetwork,
  Info,
  Sparkle,
  Ruler,
  Stack,
  CaretRight,
  ArrowsHorizontal,
  ArrowsVertical,
  Download,
  Door,
  Browser,
  Square,
  CaretDown,
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
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

// Interfaces (compatíveis com as do DrywallPainel)
interface Opening {
  id: string;
  name: string;
  type: 'door' | 'window' | 'opening';
  width: number;
  height: number;
  posX: number; // posição horizontal
  posY?: number; // posição vertical (opcional, para janelas/vãos)
}

interface Room {
  id: string;
  name: string;
  type: 'parede' | 'forro' | 'sanca';
  wallLength: number;
  wallHeight: number;
  ceilingWidth: number;
  ceilingLength: number;
  sancaPerimeter: number;
  sancaHeight: number;
  boardType: 'ST' | 'RU' | 'RF';
  profileSize: 48 | 70 | 90;
  studSpacing: 0.4 | 0.6;
  openings: Opening[];
  useInsulation: boolean;
  tiranteOffset: number; // para forro
}

// Estado inicial vazio (sem exemplos)
const initialRoom: Room = {
  id: '1',
  name: '',
  type: 'parede',
  wallLength: 0,
  wallHeight: 0,
  ceilingWidth: 0,
  ceilingLength: 0,
  sancaPerimeter: 0,
  sancaHeight: 0,
  boardType: 'ST',
  profileSize: 48,
  studSpacing: 0.6,
  openings: [],
  useInsulation: false,
  tiranteOffset: 0.6,
};

export default function ModeloVisualStudio() {
  const [rooms, setRooms] = useState<Room[]>([{ ...initialRoom, id: '1' }]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('1');
  const [viewMode, setViewMode] = useState<'estrutura' | 'chapas' | 'ambos'>(
    'estrutura',
  );

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [expandedOpeningId, setExpandedOpeningId] = useState<string | null>(
    null,
  );

  const blueprintRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!blueprintRef.current) return;
    try {
      const dataUrl = await toPng(blueprintRef.current, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
        quality: 0.95,
      });
      saveAs(dataUrl, `blueprint-${selectedRoom?.name || 'projeto'}.png`);
      toast.success('Blueprint exportado!');
    } catch (error) {
      toast.error('Erro ao exportar.');
    }
  };

  const handleShareWhatsApp = async () => {
    if (!blueprintRef.current) return;
    try {
      const dataUrl = await toPng(blueprintRef.current, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
        quality: 0.95,
      });
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File(
        [blob],
        `blueprint-${selectedRoom?.name || 'projeto'}.png`,
        { type: 'image/png' },
      );
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ title: 'Blueprint Drywall', files: [file] });
      } else {
        // fallback: baixar e abrir WhatsApp com texto
        const text = `*Blueprint - ${selectedRoom?.name}*\n${selectedRoom?.type}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          '_blank',
        );
        saveAs(blob, `blueprint-${selectedRoom?.name || 'projeto'}.png`);
      }
      toast.success('Blueprint compartilhado!');
    } catch (error) {
      toast.error('Erro ao compartilhar.');
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Atualizar cômodo
  const updateSelectedRoom = (patch: Partial<Room>) => {
    if (!selectedRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === selectedRoom.id ? { ...r, ...patch } : r)),
    );
  };

  // Adicionar novo elemento (com valores zerados)
  const addRoom = (type: 'parede' | 'forro' | 'sanca') => {
    const newId = Date.now().toString();
    const newRoom: Room = {
      ...initialRoom,
      id: newId,
      name: `${type === 'parede' ? 'Parede' : type === 'forro' ? 'Forro' : 'Sanca'} ${rooms.length + 1}`,
      type,
    };
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newId);
    toast.success('Novo elemento adicionado!');
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) {
      toast.error('Mantenha ao menos um elemento.');
      return;
    }
    const filtered = rooms.filter((r) => r.id !== id);
    setRooms(filtered);
    if (selectedRoomId === id) setSelectedRoomId(filtered[0].id);
    toast.success('Elemento removido');
  };

  // Cálculo de materiais
  const calculateRoomMaterials = (room: Room) => {
    if (room.type === 'parede') {
      const sections: WallSection[] = [
        {
          wallLength: room.wallLength,
          wallHeight: room.wallHeight,
          openings: room.openings.map((o) => ({
            width: o.width,
            height: o.height,
          })),
        },
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
          room.openings.reduce((acc, o) => acc + o.width * o.height, 0);
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
      return calculateCeilingMaterials({ sections, boardType: room.boardType });
    } else {
      return calculateSancaMaterials({
        perimeter: room.sancaPerimeter,
        height: room.sancaHeight,
        boardType: room.boardType,
      });
    }
  };

  // Consolidação
  const consolidatedMaterials = useMemo(() => {
    const totals: Record<string, { item: string; qtd: number; unit: string }> =
      {};
    rooms.forEach((r) => {
      calculateRoomMaterials(r).forEach((m) => {
        if (m.item.toLowerCase().includes('área total')) return;
        if (!totals[m.item])
          totals[m.item] = { item: m.item, qtd: Number(m.qtd), unit: m.unit };
        else totals[m.item].qtd += Number(m.qtd);
      });
    });
    return Object.values(totals).map((m) => ({
      ...m,
      qtd: Number.isInteger(m.qtd) ? m.qtd : Number(m.qtd.toFixed(2)),
    }));
  }, [rooms]);

  // --- Blueprint data ---
  const wallSvgData = useMemo(() => {
    if (!selectedRoom || selectedRoom.type !== 'parede') return null;
    const length = selectedRoom.wallLength || 0;
    const height = selectedRoom.wallHeight || 0;
    if (length === 0 || height === 0) return null;
    const spacing = selectedRoom.studSpacing || 0.6;
    const studPositions = [0];
    let current = spacing;
    while (current < length) {
      studPositions.push(current);
      current += spacing;
    }
    if (studPositions[studPositions.length - 1] !== length)
      studPositions.push(length);

    const boardWidth = 1.2,
      boardHeight = 1.8;
    const boardCols = Math.ceil(length / boardWidth);
    const boardRows = Math.ceil(height / boardHeight);
    const plates = [];
    for (let c = 0; c < boardCols; c++) {
      for (let r = 0; r < boardRows; r++) {
        const x = c * boardWidth;
        const y = r * boardHeight;
        const w = Math.min(boardWidth, length - x);
        const h = Math.min(boardHeight, height - y);
        if (w > 0 && h > 0) plates.push({ x, y, w, h });
      }
    }
    const grossArea = length * height;
    const totalOpeningsArea = selectedRoom.openings.reduce(
      (acc, o) => acc + o.width * o.height,
      0,
    );
    const netArea = grossArea - totalOpeningsArea;
    return { length, height, studPositions, plates, grossArea, netArea };
  }, [selectedRoom]);

  const ceilingSvgData = useMemo(() => {
    if (!selectedRoom || selectedRoom.type !== 'forro') return null;
    const w = selectedRoom.ceilingWidth || 0;
    const l = selectedRoom.ceilingLength || 0;
    if (w === 0 || l === 0) return null;
    const area = w * l;
    const perimeter = (w + l) * 2;
    const linesCount = Math.ceil(Math.max(w, l) / 0.6) + 1;
    return { w, l, area, perimeter, linesCount };
  }, [selectedRoom]);

  // --- Ações de abertura ---
  const addOpening = (type: 'door' | 'window' | 'opening') => {
    if (!selectedRoom) return;
    const typeNames = {
      door: 'Porta',
      window: 'Janela',
      opening: 'Vão',
    };
    const newOpening: Opening = {
      id: Date.now().toString(),
      name: `${typeNames[type]} ${selectedRoom.openings.length + 1}`,
      type,
      width: 0,
      height: 0,
      posX: 0,
      posY: 0,
    };
    updateSelectedRoom({ openings: [...selectedRoom.openings, newOpening] });
    setExpandedOpeningId(newOpening.id);
    setIsAddMenuOpen(false);
    toast.success(`${newOpening.name} adicionada!`);
  };
  const removeOpening = (id: string) => {
    if (!selectedRoom) return;
    updateSelectedRoom({
      openings: selectedRoom.openings.filter((o) => o.id !== id),
    });
  };

  // --- Copiar lista ---
  const copyMaterialsList = () => {
    let txt = `📋 *ESTIMATIVA DRYWALL (STUDIO VISUAL)*\n\n`;
    rooms.forEach((r) => {
      txt += `*${r.name.toUpperCase()}* (${r.type})\n`;
      calculateRoomMaterials(r).forEach((m) => {
        txt += `  • ${m.item}: ${m.qtd} ${m.unit}\n`;
      });
      txt += `\n`;
    });
    txt += `*CONSOLIDADO TOTAL:*\n`;
    consolidatedMaterials.forEach((m) => {
      txt += `• ${m.item}: ${m.qtd} ${m.unit}\n`;
    });
    navigator.clipboard.writeText(txt);
    toast.success('Lista copiada!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
              <Cube size={18} weight="duotone" /> Modelo 1: Blueprint & Estúdio
              Visual 2D
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Modelagem Espacial de Drywall
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Visualização paramétrica da estrutura, modulação de chapas e
              consolidação normativa ABNT.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyMaterialsList}
              className="px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Copy size={16} weight="bold" /> Copiar Resumo
            </button>
            <button
              onClick={() => {
                const text = `*PROJETO DRYWALL - STUDIO VISUAL*\n\n${consolidatedMaterials.map((m) => `• ${m.item}: ${m.qtd} ${m.unit}`).join('\n')}`;
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text)}`,
                  '_blank',
                );
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <ShareNetwork size={16} weight="bold" /> WhatsApp
            </button>
          </div>
        </div>

        {/* Tabs de elementos */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                selectedRoomId === room.id
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${room.type === 'parede' ? 'bg-amber-400' : room.type === 'forro' ? 'bg-cyan-400' : 'bg-purple-400'}`}
              />
              {room.name || 'Sem nome'}
            </button>
          ))}
          {/* Botões adicionar */}
          <div className="flex items-center gap-1 pl-2">
            <button
              onClick={() => addRoom('parede')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-500/30 transition"
            >
              <Plus size={14} weight="bold" /> + Parede
            </button>
            <button
              onClick={() => addRoom('forro')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-cyan-500/30 transition"
            >
              <Plus size={14} weight="bold" /> + Forro
            </button>
            <button
              onClick={() => addRoom('sanca')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-purple-500/30 transition"
            >
              <Plus size={14} weight="bold" /> + Sanca
            </button>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Painel de parâmetros */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <PencilSimple size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      Parâmetros do Elemento
                    </h3>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {selectedRoom.type}
                    </p>
                  </div>
                </div>
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(selectedRoom.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Trash size={16} /> Excluir
                  </button>
                )}
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Nome / Identificação
                </label>
                <input
                  type="text"
                  value={selectedRoom.name}
                  onChange={(e) => updateSelectedRoom({ name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Sala de Estar"
                />
              </div>

              {/* Parede */}
              {selectedRoom.type === 'parede' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Comprimento (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={selectedRoom.wallLength || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            wallLength: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Altura (m)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={selectedRoom.wallHeight || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            wallHeight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Espaçamento Montantes
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        {[0.6, 0.4].map((sp) => (
                          <button
                            key={sp}
                            onClick={() =>
                              updateSelectedRoom({
                                studSpacing: sp as 0.4 | 0.6,
                              })
                            }
                            className={`py-1.5 text-xs font-bold rounded-lg transition ${selectedRoom.studSpacing === sp ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                          >
                            {sp * 100} cm
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Perfil
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                        {[48, 70, 90].map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              updateSelectedRoom({
                                profileSize: size as 48 | 70 | 90,
                              })
                            }
                            className={`py-1.5 text-xs font-bold rounded-lg transition ${selectedRoom.profileSize === size ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                          >
                            {size}mm
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Tipo de Chapa
                      </label>
                      <select
                        value={selectedRoom.boardType}
                        onChange={(e) =>
                          updateSelectedRoom({
                            boardType: e.target.value as 'ST' | 'RU' | 'RF',
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        <option value="ST">ST (Padrão)</option>
                        <option value="RU">RU (Umidade)</option>
                        <option value="RF">RF (Fogo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Isolamento
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedRoom({
                            useInsulation: !selectedRoom.useInsulation,
                          })
                        }
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${selectedRoom.useInsulation ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                      >
                        <CheckCircle
                          size={16}
                          weight={
                            selectedRoom.useInsulation ? 'fill' : 'regular'
                          }
                          className={
                            selectedRoom.useInsulation
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        />
                        {selectedRoom.useInsulation ? 'Com Lã' : 'Sem Lã'}
                      </button>
                    </div>
                  </div>
                  {/* Aberturas */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        Vãos ({selectedRoom.openings.length})
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Plus size={14} weight="bold" /> Adicionar
                        </button>
                        {isAddMenuOpen && (
                          <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-10 min-w-[130px]">
                            <button
                              onClick={() => {
                                addOpening('door');
                                setIsAddMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-orange-50 rounded-lg flex items-center gap-2"
                            >
                              <Door size={16} className="text-orange-500" />{' '}
                              Porta
                            </button>
                            <button
                              onClick={() => {
                                addOpening('window');
                                setIsAddMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                            >
                              <Browser size={16} className="text-blue-500" />{' '}
                              Janela
                            </button>
                            <button
                              onClick={() => {
                                addOpening('opening');
                                setIsAddMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                            >
                              <Square size={16} className="text-slate-500" />{' '}
                              Vão
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedRoom.openings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        Nenhum vão cadastrado.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedRoom.openings.map((op) => {
                          const isExpanded = expandedOpeningId === op.id;
                          const icon =
                            op.type === 'door'
                              ? '🚪'
                              : op.type === 'window'
                                ? '🪟'
                                : '▢';
                          const colorClass =
                            op.type === 'door'
                              ? 'text-orange-500'
                              : op.type === 'window'
                                ? 'text-blue-500'
                                : 'text-slate-500';

                          return (
                            <div
                              key={op.id}
                              className={`bg-white rounded-xl border transition-all ${
                                isExpanded
                                  ? 'border-indigo-300 shadow-md'
                                  : 'border-slate-200'
                              }`}
                            >
                              {/* Cabeçalho do card (sempre visível) */}
                              <div
                                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 rounded-xl"
                                onClick={() =>
                                  setExpandedOpeningId(
                                    isExpanded ? null : op.id,
                                  )
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-bold ${colorClass}`}
                                  >
                                    {icon}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {op.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {op.width > 0 && op.height > 0
                                      ? `${op.width}x${op.height}m`
                                      : 'sem medidas'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeOpening(op.id);
                                    }}
                                    className="p-1 text-rose-500 hover:bg-rose-100 rounded transition"
                                  >
                                    <Trash size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOpeningId(
                                        isExpanded ? null : op.id,
                                      );
                                    }}
                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded transition"
                                  >
                                    <CaretDown
                                      size={14}
                                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                </div>
                              </div>

                              {/* Conteúdo expandido */}
                              {isExpanded && (
                                <div className="p-3 pt-0 border-t border-slate-100 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <input
                                      type="text"
                                      value={op.name}
                                      onChange={(e) =>
                                        updateSelectedRoom({
                                          openings: selectedRoom.openings.map(
                                            (o) =>
                                              o.id === op.id
                                                ? { ...o, name: e.target.value }
                                                : o,
                                          ),
                                        })
                                      }
                                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                                      placeholder="Nome"
                                    />
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400">L:</span>
                                      <input
                                        type="number"
                                        step="0.05"
                                        min="0"
                                        value={op.width || ''}
                                        onChange={(e) =>
                                          updateSelectedRoom({
                                            openings: selectedRoom.openings.map(
                                              (o) =>
                                                o.id === op.id
                                                  ? {
                                                      ...o,
                                                      width:
                                                        parseFloat(
                                                          e.target.value,
                                                        ) || 0,
                                                    }
                                                  : o,
                                            ),
                                          })
                                        }
                                        className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold"
                                      />
                                      <span className="text-slate-400">m</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400">A:</span>
                                      <input
                                        type="number"
                                        step="0.05"
                                        min="0"
                                        value={op.height || ''}
                                        onChange={(e) =>
                                          updateSelectedRoom({
                                            openings: selectedRoom.openings.map(
                                              (o) =>
                                                o.id === op.id
                                                  ? {
                                                      ...o,
                                                      height:
                                                        parseFloat(
                                                          e.target.value,
                                                        ) || 0,
                                                    }
                                                  : o,
                                            ),
                                          })
                                        }
                                        className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold"
                                      />
                                      <span className="text-slate-400">m</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400">
                                        PosX:
                                      </span>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={op.posX || ''}
                                        onChange={(e) =>
                                          updateSelectedRoom({
                                            openings: selectedRoom.openings.map(
                                              (o) =>
                                                o.id === op.id
                                                  ? {
                                                      ...o,
                                                      posX:
                                                        parseFloat(
                                                          e.target.value,
                                                        ) || 0,
                                                    }
                                                  : o,
                                            ),
                                          })
                                        }
                                        className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold"
                                      />
                                      <span className="text-slate-400">m</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400">
                                        PosY:
                                      </span>
                                      <input
                                        type="number"
                                        step="0.05"
                                        min="0"
                                        value={op.posY ?? 0}
                                        onChange={(e) => {
                                          const val = parseFloat(
                                            e.target.value,
                                          );
                                          updateSelectedRoom({
                                            openings: selectedRoom.openings.map(
                                              (o) =>
                                                o.id === op.id
                                                  ? {
                                                      ...o,
                                                      posY: isNaN(val)
                                                        ? 0
                                                        : val,
                                                    }
                                                  : o,
                                            ),
                                          });
                                        }}
                                        className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold"
                                      />
                                      <span className="text-slate-400">m</span>
                                    </div>{' '}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>{' '}
                </div>
              )}

              {/* Forro */}
              {selectedRoom.type === 'forro' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Largura (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={selectedRoom.ceilingWidth || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            ceilingWidth: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Comprimento (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={selectedRoom.ceilingLength || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            ceilingLength: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Offset dos Tirantes (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={selectedRoom.tiranteOffset || ''}
                      onChange={(e) =>
                        updateSelectedRoom({
                          tiranteOffset: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                    />
                    <span className="text-[9px] text-slate-400 italic">
                      Padrão NBR: 0,60m
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Tipo de Chapa
                    </label>
                    <select
                      value={selectedRoom.boardType}
                      onChange={(e) =>
                        updateSelectedRoom({
                          boardType: e.target.value as 'ST' | 'RU' | 'RF',
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      <option value="ST">ST (Padrão)</option>
                      <option value="RU">RU (Umidade)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Sanca */}
              {selectedRoom.type === 'sanca' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Perímetro (m)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={selectedRoom.sancaPerimeter || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            sancaPerimeter: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Altura (m)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={selectedRoom.sancaHeight || ''}
                        onChange={(e) =>
                          updateSelectedRoom({
                            sancaHeight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-950"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Materiais do elemento */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Materiais Deste Elemento</span>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedRoom.type === 'parede'
                    ? `${wallSvgData?.netArea.toFixed(2) ?? 0} m² líq.`
                    : selectedRoom.type === 'forro'
                      ? `${ceilingSvgData?.area.toFixed(2) ?? 0} m²`
                      : `${selectedRoom.sancaPerimeter} m lin.`}
                </span>
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {calculateRoomMaterials(selectedRoom).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1.5 px-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg text-xs transition"
                  >
                    <span className="text-slate-700 font-medium">
                      {item.item}
                    </span>
                    <span className="font-black text-indigo-900">
                      {item.qtd}{' '}
                      <small className="text-slate-500 font-normal">
                        {item.unit}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Palco visual com blueprints (agora em cards separados) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Eye size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Blueprint 2D & Modulação
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Elevação técnica em escala com modulação ABNT
                    </p>
                  </div>
                </div>
                {selectedRoom.type === 'parede' && (
                  <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl text-xs">
                    {(['estrutura', 'chapas', 'ambos'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 rounded-lg font-bold capitalize transition ${viewMode === mode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPNG}
                    className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={14} /> PNG
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <ShareNetwork size={14} /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Blueprints em cards separados para cada serviço (aqui temos apenas um serviço por "room", mas pode ser adaptado) */}
              {/* Como o ModeloVisualStudio tem um room por vez, mostramos apenas o blueprint do room selecionado */}
              <div className="space-y-4">
                {selectedRoom && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        {selectedRoom.name || 'Sem nome'} ({selectedRoom.type})
                      </h4>
                      <span className="text-[10px] text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                        {selectedRoom.type === 'parede'
                          ? `${selectedRoom.wallLength}x${selectedRoom.wallHeight}m`
                          : selectedRoom.type === 'forro'
                            ? `${selectedRoom.ceilingWidth}x${selectedRoom.ceilingLength}m`
                            : `${selectedRoom.sancaPerimeter}m`}
                      </span>
                    </div>
                    <div
                      ref={blueprintRef}
                      className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60 min-h-[200px] flex items-center justify-center relative overflow-hidden"
                    >
                      {/* Grade de fundo */}
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
                          backgroundSize: '20px 20px',
                        }}
                      />
                      {selectedRoom.type === 'parede' && wallSvgData && (
                        <WallBlueprintSVG
                          data={wallSvgData}
                          openings={selectedRoom.openings}
                          boardType={selectedRoom.boardType}
                          profileSize={selectedRoom.profileSize}
                          viewMode={viewMode}
                        />
                      )}
                      {selectedRoom.type === 'forro' && ceilingSvgData && (
                        <CeilingBlueprintSVG
                          data={ceilingSvgData}
                          tiranteOffset={selectedRoom.tiranteOffset || 0.6}
                        />
                      )}
                      {selectedRoom.type === 'sanca' && (
                        <div className="text-center p-4">
                          <div className="text-purple-400 text-4xl mb-2">⎔</div>
                          <p className="text-xs text-slate-400">
                            Sanca com perímetro {selectedRoom.sancaPerimeter}m e
                            altura {selectedRoom.sancaHeight}m
                          </p>
                          <p className="text-xs text-slate-500">
                            Área:{' '}
                            {(
                              selectedRoom.sancaPerimeter *
                              selectedRoom.sancaHeight
                            ).toFixed(2)}{' '}
                            m²
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo consolidado */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Sparkle size={16} weight="fill" /> Total Consolidado (
                    {rooms.length} elementos)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {consolidatedMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-between"
                    >
                      <span
                        className="text-[11px] text-slate-300 font-medium line-clamp-1"
                        title={mat.item}
                      >
                        {mat.item}
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-black text-white">
                          {mat.qtd}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">
                          {mat.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponentes SVG (separados para clareza)
function WallBlueprintSVG({
  data,
  openings,
  boardType,
  profileSize,
  viewMode,
}: any) {
  const { length, height, studPositions, plates } = data;
  const boardColor =
    boardType === 'RU' ? '#059669' : boardType === 'RF' ? '#e11d48' : '#e0e7ff';

  return (
    <div className="w-full overflow-auto">
      <svg
        viewBox={`-0.5 -0.5 ${length + 1} ${height + 1}`}
        className="w-full max-h-64 bg-slate-900 rounded border border-slate-700"
        style={{ aspectRatio: length / height }}
      >
        {/* Guias */}
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
          studPositions.map((pos: number, idx: number) => (
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
                strokeWidth="0.01"
                strokeDasharray="0.05,0.05"
              />
            </g>
          ))}
        {/* Chapas */}
        {(viewMode === 'chapas' || viewMode === 'ambos') &&
          plates.map((plate: any, idx: number) => (
            <rect
              key={`plate-${idx}`}
              x={plate.x + 0.02}
              y={plate.y + 0.02}
              width={plate.w - 0.04}
              height={plate.h - 0.04}
              fill={boardColor}
              fillOpacity={viewMode === 'ambos' ? 0.25 : 0.4}
              stroke="#fff"
              strokeWidth="0.015"
              strokeDasharray="0.04,0.04"
            />
          ))}
        {/* Aberturas */}
        {openings.map((op: any) => {
          const isDoor = op.type === 'door';
          const isWindow = op.type === 'window';
          const isOpening = op.type === 'opening';

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

          // posY agora é distância do chão até o topo do vão
          const posX = op.posX ?? 0;
          const posY = op.posY ?? height - op.height; // distância do chão

          const baseY = op.posY ?? 0; // altura do peitoril (base)
          const topY = height - (baseY + op.height); // coordenada Y do topo do vão
          const y = height - posY - op.height; // posY é a distância da base até o peitoril (altura do peitoril)
          const x = posX;

          return (
            <g key={op.id}>
              {/* Área do vão */}
              <rect
                x={x}
                y={topY}
                width={op.width}
                height={op.height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="0.04"
                strokeDasharray="0.06, 0.04"
              />
              {/* Reforços laterais */}
              <rect
                x={posX - 0.04}
                y="0"
                width="0.04"
                height={height}
                fill={strokeColor}
                opacity="0.8"
              />
              <rect
                x={posX + op.width}
                y="0"
                width="0.04"
                height={height}
                fill={strokeColor}
                opacity="0.8"
              />
              {/* Verga superior */}
              <rect
                x={posX}
                y={topY - 0.06}
                width={op.width}
                height="0.06"
                fill={strokeColor}
                opacity="0.9"
              />
              {/* Texto */}
              <text
                x={posX + op.width / 2}
                y={topY + op.height / 2}
                fill={strokeColor}
                fontSize="0.2"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {op.name || label}
                <tspan
                  x={posX + op.width / 2}
                  dy="0.25"
                  fontSize="0.15"
                  fill="#cbd5e1"
                >
                  {op.width}x{op.height}m
                </tspan>
              </text>
              {/* ... resto do código ... */}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>Comprimento: {length}m</span>
        <span>Altura: {height}m</span>
        <span>Perfil: {profileSize}mm</span>
      </div>
    </div>
  );
}

function CeilingBlueprintSVG({ data, tiranteOffset }: any) {
  const { w, l, linesCount } = data;
  const lines = [];
  for (let i = 0; i < linesCount; i++) {
    const pos = i * 0.6;
    if (pos > l) break;
    lines.push(pos);
  }
  const tirantes = [];
  for (const y of lines) {
    let x = tiranteOffset;
    while (x < w) {
      tirantes.push({ x, y });
      x += 1.2;
    }
  }

  return (
    <div className="w-full overflow-auto">
      <svg
        viewBox={`-0.5 -0.5 ${w + 1} ${l + 1}`}
        className="w-full max-h-64 bg-slate-900 rounded border border-slate-700"
        style={{ aspectRatio: w / l }}
      >
        <rect
          x="0"
          y="0"
          width={w}
          height={l}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="0.06"
        />
        {lines.map((pos, idx) => (
          <line
            key={`f530-${idx}`}
            x1="0"
            y1={pos}
            x2={w}
            y2={pos}
            stroke="#22d3ee"
            strokeWidth="0.03"
          />
        ))}
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
        <span>Largura: {w}m</span>
        <span>Comprimento: {l}m</span>
        <span>Offset tirantes: {tiranteOffset}m</span>
      </div>
    </div>
  );
}
