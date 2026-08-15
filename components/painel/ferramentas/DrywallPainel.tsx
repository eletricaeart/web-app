// components/painel/ferramentas/DrywallPainel.tsx
'use client';

import React, { useState, useMemo } from 'react';
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
  Wall,
  HardHat,
} from '@phosphor-icons/react';
import { calculateWallMaterials } from '@/utils/calculators/drywallWall';
import { calculateCeilingMaterials } from '@/utils/calculators/drywallCeiling';
import { calculateSancaMaterials } from '@/utils/calculators/drywallSanca';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';
import DrywallCalculadora from './calculadoras/DrywallCalculadora';
import { useRoomEditor, ServiceInstance } from '@/hooks/useRoomEditor';
import { useServiceForm } from '@/hooks/useServiceForm';
import { ServiceForm } from './ServiceForm';
import { RoomList } from './RoomList';
import { MaterialSummary } from './MaterialSummary';
import './Drywall.css';

export default function DrywallPainel() {
  const router = usePainelRouter();
  const [activeMode, setActiveMode] = useState<'completa' | 'rapida'>(
    'completa',
  );
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

  // Estados do formulário de ambiente
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [tempServices, setTempServices] = useState<ServiceInstance[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Hook do formulário de serviço
  const serviceForm = useServiceForm();

  const handleEditTempService = (service: ServiceInstance) => {
    setEditingServiceId(service.id);
    serviceForm.loadService(service);
  };

  const cancelEditing = () => {
    setEditingServiceId(null);
    serviceForm.resetForm();
  };

  const addServiceToTempList = () => {
    // Validação básica
    if (
      serviceForm.activeType === 'wall' ||
      serviceForm.activeType === 'ceiling'
    ) {
      if (!serviceForm.activeMeasures.every((m) => m.w > 0 && m.h > 0)) {
        toast.warning('Preencha as medidas principais do serviço.');
        return;
      }
    }
    if (serviceForm.activeType === 'sanca') {
      if (serviceForm.activePerimeter <= 0 || serviceForm.activeHeight <= 0) {
        toast.warning('Preencha perímetro e altura da sanca.');
        return;
      }
    }

    // Calcula área
    let totalArea = 0;
    if (
      serviceForm.activeType === 'wall' ||
      serviceForm.activeType === 'ceiling'
    ) {
      totalArea = serviceForm.activeMeasures.reduce((acc, m) => {
        const grossArea = m.w * m.h;
        const openingsArea = m.openings.reduce(
          (oAcc, o) => oAcc + o.w * o.h,
          0,
        );
        return acc + (grossArea - openingsArea);
      }, 0);
    } else if (serviceForm.activeType === 'sanca') {
      totalArea = serviceForm.activePerimeter * serviceForm.activeHeight;
    }

    const serviceData: ServiceInstance = {
      id: editingServiceId || Math.random().toString(36),
      type: serviceForm.activeType,
      tag:
        serviceForm.activeTag ||
        (serviceForm.activeType === 'wall'
          ? 'Parede'
          : serviceForm.activeType === 'ceiling'
            ? 'Forro'
            : 'Sanca'),
      useInsulation:
        serviceForm.activeType === 'wall'
          ? serviceForm.activeInsulation
          : false,
      measures: serviceForm.activeMeasures,
      totalArea,
      boardType: serviceForm.activeBoardType,
      profileSize:
        serviceForm.activeType === 'wall'
          ? serviceForm.activeProfileSize
          : undefined,
      studSpacing:
        serviceForm.activeType === 'wall'
          ? serviceForm.activeStudSpacing
          : undefined,
      perimeter:
        serviceForm.activeType === 'sanca'
          ? serviceForm.activePerimeter
          : undefined,
      height:
        serviceForm.activeType === 'sanca'
          ? serviceForm.activeHeight
          : undefined,
    };

    if (editingServiceId) {
      setTempServices(
        tempServices.map((s) => (s.id === editingServiceId ? serviceData : s)),
      );
      setEditingServiceId(null);
      toast.success('Serviço atualizado!');
    } else {
      setTempServices([...tempServices, serviceData]);
      toast.success('Serviço adicionado à lista!');
    }

    serviceForm.resetForm();
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

  // Cálculo de materiais
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

  // Compartilhamento
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

  const fabConfig = [
    {
      icon: <Plus size={28} weight="duotone" />,
      label: 'Novo Serviço',
      action: () => setIsDrawerOpen(true),
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Ferramentas para Drywall"
        backAction={() => router.push('ferramentas')}
      />

      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 shadow-xs">
        <div className="max-w-md mx-auto flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('completa')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'completa'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <SquareHalf size={16} weight="duotone" />
            <span>Por Ambientes (Completa)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('rapida')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'rapida'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Lightning size={16} weight="duotone" className="text-amber-500" />
            <span>Calculadora Rápida</span>
          </button>
        </div>
      </div>

      {activeMode === 'rapida' ? (
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
                onClick={handleShareDocument}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6"
              >
                <ShareNetwork size={18} weight="bold" className="mr-2" />
                Compartilhar Documento
              </Button>
            )}
          </header>

          <RoomList
            rooms={rooms}
            roomMaterials={roomMaterials}
            onEditRoom={startEditRoom}
            onRemoveRoom={removeRoom}
          />
          <MaterialSummary materials={consolidatedMaterials} />
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
              Configurar Ambiente
            </h2>
            <div className="w-10 h-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            <div className="mx-auto w-full max-w-md space-y-6 pb-32">
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

              {tempServices.length > 0 && (
                <View tag="temp-services" className="space-y-3">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
                    Serviços no rascunho
                  </span>
                  {tempServices.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm animate-in fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          {s.type === 'wall' && <Wall size={24} />}
                          {s.type === 'ceiling' && <HardHat size={24} />}
                          {s.type === 'sanca' && (
                            <span className="text-2xl">⎔</span>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-xs uppercase">
                            {s.tag}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">
                            {s.totalArea.toFixed(2)} m² | {s.boardType}
                            {s.type === 'wall' && ` | ${s.profileSize}mm`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-indigo-600 bg-indigo-50 rounded-xl"
                          onClick={() => handleEditTempService(s)}
                        >
                          <PencilSimple size={18} weight="bold" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 bg-red-50 rounded-xl"
                          onClick={() =>
                            setTempServices(
                              tempServices.filter((item) => item.id !== s.id),
                            )
                          }
                        >
                          <Trash size={18} weight="bold" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </View>
              )}

              <ServiceForm
                editingServiceId={editingServiceId}
                onSave={addServiceToTempList}
                onCancelEdit={cancelEditing}
              />
            </div>
          </div>

          <div className="p-4 bg-white border-t sticky bottom-0">
            <Pressable
              onClick={handleFinalSave}
              className="w-full h-14 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Check weight="bold" size={20} /> Salvar Todos os Serviços
            </Pressable>
          </div>
        </View>
      )}

      {activeMode === 'completa' && !isDrawerOpen && (
        <FAB actions={fabConfig} hasBottomNav={true} />
      )}
    </>
  );
}
