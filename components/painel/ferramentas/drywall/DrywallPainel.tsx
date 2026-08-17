// components/painel/ferramentas/DrywallPainel.tsx
'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import ShareDrywallMenu from '../ShareDrywallMenu';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import View from '@/components/layout/View';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Check,
  SquareHalf,
  X,
  ShareNetwork,
  Lightning,
  Plus,
  DownloadSimple,
  Door,
  Square,
  ArrowsVertical,
  PencilSimple,
  Trash,
  Sparkle,
} from '@phosphor-icons/react';
import { calculateWallMaterials } from '@/utils/calculators/drywallWall';
import { calculateCeilingMaterials } from '@/utils/calculators/drywallCeiling';
import { calculateSancaMaterials } from '@/utils/calculators/drywallSanca';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';
import DrywallCalculadora from '../calculadoras/DrywallCalculadora';
import { useRoomEditor, ServiceInstance, Opening } from '@/hooks/useRoomEditor';
import { ServiceForm } from '../ServiceForm';
import { MaterialSummary } from '../MaterialSummary';
import { ServiceList } from '../ServiceList';
import { WallBlueprint } from '../blueprints/WallBlueprint';
import { CeilingBlueprint } from '../blueprints/CeilingBlueprint';
import { SancaBlueprint } from '../blueprints/SancaBlueprint';
import ModeloVisualStudio from '../modelos/ModeloVisualStudio';
import ModeloMobilePro from '../modelos/ModeloMobilePro';
import ModeloComercialBIM from '../modelos/ModeloComercialBIM';
import { ShareBlueprintButton } from '../ShareBlueprintButton';
import '../Drywall.css';

import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export default function DrywallPainel() {
  const router = usePainelRouter();
  const [activeMode, setActiveMode] = useState<
    'completa' | 'rapida' | 'modelo1' | 'modelo2' | 'modelo3'
  >('completa');
  const {
    rooms,
    setRooms,
    editingRoomId,
    setEditingRoomId,
    isDrawerOpen,
    setIsDrawerOpen,
    removeRoom,
    startEditRoom,
    closeDrawer,
  } = useRoomEditor();

  const [currentRoomName, setCurrentRoomName] = useState('');
  const [tempServices, setTempServices] = useState<ServiceInstance[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Estado para visualização do blueprint
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'estrutura' | 'chapas' | 'ambos'>(
    'estrutura',
  );
  const blueprintRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // --- Funções de serviço ---
  const handleEditTempService = (service: ServiceInstance) => {
    setEditingServiceId(service.id);
    // ServiceForm irá carregar via initialService
  };

  const handleRemoveTempService = (id: string) => {
    setTempServices(tempServices.filter((s) => s.id !== id));
    toast.success('Serviço removido');
  };

  const handleAddService = (serviceData: Partial<ServiceInstance>) => {
    const newService: ServiceInstance = {
      id: editingServiceId || Math.random().toString(36),
      type: serviceData.type!,
      tag: serviceData.tag!,
      useInsulation: serviceData.useInsulation || false,
      measures: serviceData.measures || [],
      totalArea: serviceData.totalArea || 0,
      boardType: serviceData.boardType || 'ST',
      profileSize: serviceData.profileSize,
      studSpacing: serviceData.studSpacing,
      perimeter: serviceData.perimeter,
      height: serviceData.height,
      tiranteOffset: serviceData.tiranteOffset,
    };

    if (editingServiceId) {
      setTempServices(
        tempServices.map((s) => (s.id === editingServiceId ? newService : s)),
      );
      setEditingServiceId(null);
      toast.success('Serviço atualizado!');
    } else {
      setTempServices([...tempServices, newService]);
      toast.success('Serviço adicionado!');
    }
  };

  const handleFinalSave = () => {
    if (!currentRoomName.trim())
      return toast.error('Informe o nome do ambiente.');
    if (tempServices.length === 0)
      return toast.error('Adicione pelo menos um serviço.');

    setRooms((prev) => {
      if (editingRoomId) {
        return prev.map((r) =>
          r.id === editingRoomId
            ? { ...r, name: currentRoomName, services: tempServices }
            : r,
        );
      }
      const roomIndex = prev.findIndex(
        (r) => r.name.toLowerCase() === currentRoomName.toLowerCase(),
      );
      if (roomIndex > -1) {
        const updatedRooms = [...prev];
        updatedRooms[roomIndex].services.push(...tempServices);
        return updatedRooms;
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: currentRoomName,
          services: tempServices,
        },
      ];
    });

    setIsDrawerOpen(false);
    setTempServices([]);
    setCurrentRoomName('');
    setEditingRoomId(null);
    toast.success(editingRoomId ? 'Ambiente atualizado!' : 'Ambiente salvo!');
  };

  // --- Cálculo de materiais ---
  const computeMaterialsForServices = (services: ServiceInstance[]) => {
    const totalsMap: Record<
      string,
      { item: string; qtd: number; unit: string }
    > = {};

    services.forEach((s) => {
      let res: any[] = [];
      if (s.type === 'wall') {
        res = calculateWallMaterials({
          sections: s.measures.map((m) => ({
            wallLength: m.w,
            wallHeight: m.h,
            openings: m.openings.map((o) => ({ width: o.w, height: o.h })),
          })),
          studSpacing: s.studSpacing || 0.6,
          boardType: s.boardType || 'ST',
          profileSize: s.profileSize || 48,
        });
        if (s.useInsulation) {
          const totalNetArea = s.measures.reduce((acc, m) => {
            const net =
              m.w * m.h - m.openings.reduce((a, o) => a + o.w * o.h, 0);
            return acc + net;
          }, 0);
          res.push({
            item: 'Lã de Vidro/Pet (m²)',
            qtd: Number(totalNetArea.toFixed(2)),
            unit: 'm²',
          });
        }
      } else if (s.type === 'ceiling') {
        res = calculateCeilingMaterials({
          sections: s.measures.map((m) => ({ width: m.w, length: m.h })),
          boardType: s.boardType || 'ST',
        });
      } else if (s.type === 'sanca') {
        res = calculateSancaMaterials({
          perimeter: s.perimeter || 0,
          height: s.height || 0,
          boardType: s.boardType || 'ST',
        });
      }

      res.forEach((m) => {
        if (m.item.toLocaleLowerCase().includes('área total')) return;
        if (totalsMap[m.item]) {
          totalsMap[m.item].qtd += Number(m.qtd);
        } else {
          totalsMap[m.item] = {
            item: m.item,
            qtd: Number(m.qtd),
            unit: m.unit,
          };
        }
      });
    });

    return Object.values(totalsMap).map((m) => ({
      ...m,
      qtd: Number.isInteger(m.qtd) ? m.qtd : Number(m.qtd.toFixed(2)),
    }));
  };

  const consolidatedMaterials = useMemo(() => {
    const allServices = rooms.flatMap((r) => r.services);
    return computeMaterialsForServices(allServices);
  }, [rooms]);

  const roomMaterials = useMemo(() => {
    const map: Record<
      string,
      ReturnType<typeof computeMaterialsForServices>
    > = {};
    rooms.forEach((r) => {
      map[r.id] = computeMaterialsForServices(r.services);
    });
    return map;
  }, [rooms]);

  // Cria um array de rooms com os materiais já calculados
  const blueprintRooms = useMemo(() => {
    return rooms.map((room) => ({
      ...room,
      materials: roomMaterials[room.id] || [],
    }));
  }, [rooms, roomMaterials]);

  // --- Compartilhamento de documento ---
  const buildShareText = () => {
    let text = `*ELÉTRICA & ART*\n*Estimativa de Materiais — Drywall*\n\n`;
    rooms.forEach((room) => {
      text += `*${room.name.toUpperCase()}*\n`;
      (roomMaterials[room.id] || []).forEach((m) => {
        text += `• ${m.item}: ${m.qtd} ${m.unit}\n`;
      });
      text += `\n`;
    });
    text += `*TOTAL GERAL*\n`;
    consolidatedMaterials.forEach((m) => {
      text += `• ${m.item}: ${m.qtd} ${m.unit}\n`;
    });
    return text;
  };

  const handleShareDocument = async () => {
    if (rooms.length === 0) {
      toast.warning('Adicione ao menos um ambiente antes de compartilhar.');
      return;
    }
    const text = buildShareText();
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ text });
        return;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- Compartilhar blueprint como PNG ---
  const handleShareBlueprint = async (
    serviceId: string,
    serviceName: string,
  ) => {
    const ref = blueprintRefs.current[serviceId];
    if (!ref) {
      toast.error('Blueprint não encontrado.');
      return;
    }

    try {
      const dataUrl = await toPng(ref, {
        quality: 0.95,
        backgroundColor: '#0f172a', // fundo escuro
      });
      // Baixar ou compartilhar
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], `blueprint-${serviceName}.png`, {
          type: 'image/png',
        });
        await (navigator as any).share({
          files: [file],
          title: `Blueprint - ${serviceName}`,
        });
      } else {
        // Fallback: download
        saveAs(dataUrl, `blueprint-${serviceName}.png`);
        toast.success('Blueprint baixado!');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error('Erro ao compartilhar blueprint.');
    }
  };

  // --- FAB ---
  const fabConfig = [
    {
      icon: <Plus size={28} weight="duotone" />,
      label: 'Novo Ambiente',
      action: () => {
        setEditingRoomId(null);
        setCurrentRoomName('');
        setTempServices([]);
        setIsDrawerOpen(true);
      },
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Ferramentas para Drywall"
        backAction={() => router.push('ferramentas.drywall')}
      />

      <div className="bg-white border-b border-slate-200 px-3 py-2.5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/90 rounded-2xl scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveMode('completa')}
            className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'completa'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SquareHalf size={15} weight="duotone" />
            <span>Versão Original</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('rapida')}
            className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'rapida'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lightning size={15} weight="duotone" className="text-amber-500" />
            <span>Rápida</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('modelo1')}
            className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'modelo1'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100'
            }`}
          >
            <span>📐 Teste 1: Blueprint 2D</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('modelo2')}
            className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'modelo2'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-900 bg-amber-50/70 hover:bg-amber-100'
            }`}
          >
            <span>📱 Teste 2: Canteiro Ágil</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('modelo3')}
            className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'modelo3'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100'
            }`}
          >
            <span>💼 Teste 3: Orçamento & Embalagens</span>
          </button>
        </div>
      </div>

      {activeMode === 'modelo1' ? (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-32 max-w-7xl mx-auto w-full">
          <ModeloVisualStudio />
        </div>
      ) : activeMode === 'modelo2' ? (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-32 max-w-5xl mx-auto w-full">
          <ModeloMobilePro />
        </div>
      ) : activeMode === 'modelo3' ? (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-32 max-w-7xl mx-auto w-full">
          <ModeloComercialBIM />
        </div>
      ) : activeMode === 'rapida' ? (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-32 max-w-5xl mx-auto w-full">
          <DrywallCalculadora />
        </div>
      ) : (
        <View
          tag="page"
          className={`p-4 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-40 ${isDrawerOpen ? 'hidden' : 'block'}`}
        >
          <header className="mb-6 text-center relative">
            <SquareHalf
              size={48}
              weight="duotone"
              className="mx-auto text-indigo-600 mb-2"
            />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Estimativa de Materiais
            </h2>
            <p className="text-slate-500 text-sm italic">
              Cálculos baseados em padrões técnicos ABNT
            </p>

            {rooms.length > 0 && (
              <Button
                onClick={() => {
                  // Codificar dados para a URL
                  const data = {
                    rooms: blueprintRooms,
                    consolidated: consolidatedMaterials,
                  };
                  const encoded = encodeURIComponent(JSON.stringify(data));
                  window.open(
                    `/visualizar-materiais?data=${encoded}`,
                    '_blank',
                  );
                }}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6"
              >
                <ShareNetwork size={18} weight="bold" className="mr-2" />
                Compartilhar Documento
              </Button>
            )}
          </header>

          {/* Container da lista de materiais para captura */}
          <div ref={listContainerRef}>
            {/* Lista de ambientes com cards de blueprint */}
            <div className="space-y-8">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-tighter">
                      {room.name}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                        onClick={() => startEditRoom(room)}
                      >
                        <PencilSimple size={18} weight="bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                        onClick={() => removeRoom(room.id)}
                      >
                        <Trash size={18} weight="bold" />
                      </Button>
                    </div>
                  </div>

                  {/* Lista de serviços do ambiente com blueprints */}
                  <div className="space-y-4">
                    {room.services.map((service) => {
                      const isSelected = selectedRoomId === room.id;
                      return (
                        <div
                          key={service.id}
                          className="border border-slate-100 rounded-xl p-3 bg-slate-50/50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-xs font-bold text-indigo-600 uppercase">
                                {service.tag}
                              </span>
                              <span className="ml-2 text-[10px] text-slate-500">
                                {service.type} | {service.totalArea.toFixed(2)}{' '}
                                m²
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-indigo-600"
                              onClick={() => {
                                setSelectedRoomId(isSelected ? null : room.id);
                                setViewMode('estrutura');
                              }}
                            >
                              {isSelected
                                ? 'Ocultar Blueprint'
                                : 'Ver Blueprint'}
                            </Button>
                          </div>

                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500 uppercase">
                                    Blueprint
                                  </span>
                                  <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5">
                                    {(
                                      ['estrutura', 'chapas', 'ambos'] as const
                                    ).map((mode) => (
                                      <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                                          viewMode === mode
                                            ? 'bg-white shadow-sm text-indigo-600'
                                            : 'text-slate-500'
                                        }`}
                                      >
                                        {mode === 'estrutura'
                                          ? 'Estrutura'
                                          : mode === 'chapas'
                                            ? 'Chapas'
                                            : 'Ambos'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-emerald-600"
                                  onClick={() =>
                                    handleShareBlueprint(
                                      service.id,
                                      service.tag,
                                    )
                                  }
                                >
                                  <DownloadSimple size={14} className="mr-1" />
                                  Exportar PNG
                                </Button>
                              </div>

                              <div
                                ref={(el) => {
                                  blueprintRefs.current[service.id] = el;
                                }}
                                className="bg-slate-900 rounded-xl p-4 border border-slate-800 min-h-[200px] flex items-center justify-center relative overflow-hidden"
                              >
                                {/* Grade de fundo */}
                                <div
                                  className="absolute inset-0 opacity-10 pointer-events-none"
                                  style={{
                                    backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px',
                                  }}
                                />
                                {service.type === 'wall' && (
                                  <WallBlueprint
                                    service={service}
                                    viewMode={viewMode}
                                  />
                                )}
                                {service.type === 'ceiling' && (
                                  <CeilingBlueprint
                                    service={service}
                                    viewMode={viewMode}
                                  />
                                )}
                                {service.type === 'sanca' && (
                                  <SancaBlueprint service={service} />
                                )}
                              </div>

                              {/* Informações adicionais do blueprint */}
                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500">
                                {service.type === 'wall' && (
                                  <>
                                    <span>
                                      Comprimento: {service.measures[0]?.w || 0}
                                      m
                                    </span>
                                    <span>
                                      Altura: {service.measures[0]?.h || 0}m
                                    </span>
                                    <span>
                                      Perfil: {service.profileSize || 48}mm
                                    </span>
                                    <span>
                                      Espaçamento:{' '}
                                      {(service.studSpacing || 0.6) * 100}cm
                                    </span>
                                  </>
                                )}
                                {service.type === 'ceiling' && (
                                  <>
                                    <span>
                                      Largura: {service.measures[0]?.w || 0}m
                                    </span>
                                    <span>
                                      Comprimento: {service.measures[0]?.h || 0}
                                      m
                                    </span>
                                    <span>
                                      Offset Tirantes:{' '}
                                      {service.tiranteOffset || 0.6}m
                                    </span>
                                  </>
                                )}
                                {service.type === 'sanca' && (
                                  <>
                                    <span>
                                      Perímetro: {service.perimeter || 0}m
                                    </span>
                                    <span>Altura: {service.height || 0}m</span>
                                  </>
                                )}
                                <span>Placa: {service.boardType}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Lista total de materiais (estilizada como no ModeloVisualStudio) */}
            {consolidatedMaterials.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-2 mb-4">
                  <Sparkle size={16} weight="fill" />
                  Total Consolidado da Obra
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {consolidatedMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2 rounded-xl border border-slate-100"
                    >
                      <span className="text-[11px] text-slate-700 font-medium line-clamp-1">
                        {mat.item}
                      </span>
                      <span className="text-sm font-black text-indigo-700">
                        {mat.qtd}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          {mat.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </View>
      )}

      {/* Drawer de criação/edição de ambiente */}
      {isDrawerOpen && (
        <View className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="flex items-center justify-between p-4 border-b bg-white">
            <button
              onClick={closeDrawer}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={24} weight="bold" className="text-slate-600" />
            </button>
            <h2 className="font-black text-indigo-900 uppercase">
              {editingRoomId ? 'Editar Ambiente' : 'Novo Ambiente'}
            </h2>
            <div className="w-10 h-10" />
          </header>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50"
            style={{ paddingBottom: '100px' }}
          >
            <div className="mx-auto w-full max-w-md space-y-6">
              <div className="flex justify-center">
                <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[12px] font-bold">
                  {tempServices.length} serviços na lista
                </div>
              </div>

              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase ml-1">
                  Nome do Cômodo
                </span>
                <Input
                  placeholder="Ex: Sala de Estar"
                  value={currentRoomName}
                  onChange={(e) => setCurrentRoomName(e.target.value)}
                  className="bg-white"
                />
              </label>

              <ServiceList
                services={tempServices}
                onEdit={handleEditTempService}
                onRemove={handleRemoveTempService}
              />

              <ServiceForm
                editingServiceId={editingServiceId}
                initialService={
                  editingServiceId
                    ? tempServices.find((s) => s.id === editingServiceId) ||
                      null
                    : null
                }
                onSave={handleAddService}
                onCancelEdit={() => {
                  setEditingServiceId(null);
                }}
                roomName={currentRoomName}
              />
            </div>
          </div>

          <div className="p-4 bg-white border-t sticky bottom-0 flex gap-3">
            <Button
              variant="outline"
              onClick={closeDrawer}
              className="flex-1 h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleFinalSave}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Check weight="bold" size={18} /> Salvar Ambiente
            </Button>
          </div>
        </View>
      )}

      {/* Menu de compartilhamento */}
      <ShareDrywallMenu
        listRef={listContainerRef}
        rooms={blueprintRooms}
        consolidated={consolidatedMaterials}
        open={isShareMenuOpen}
        onOpenChange={setIsShareMenuOpen}
        title="Lista de Materiais - Drywall"
      />

      {activeMode === 'completa' && !isDrawerOpen && (
        <FAB actions={fabConfig} hasBottomNav={true} />
      )}
    </>
  );
}
