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
} from '@phosphor-icons/react';
import { calculateWallMaterials } from '@/utils/calculators/drywallWall';
import { calculateCeilingMaterials } from '@/utils/calculators/drywallCeiling';
import { calculateSancaMaterials } from '@/utils/calculators/drywallSanca';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';
import DrywallCalculadora from './calculadoras/DrywallCalculadora';
import { useRoomEditor, ServiceInstance } from '@/hooks/useRoomEditor';
import { ServiceForm } from './ServiceForm';
import { RoomList } from './RoomList';
import { MaterialSummary } from './MaterialSummary';
import { ServiceList } from './ServiceList';
import ModeloVisualStudio from './modelos/ModeloVisualStudio';
import ModeloMobilePro from './modelos/ModeloMobilePro';
import ModeloComercialBIM from './modelos/ModeloComercialBIM';
import './Drywall.css';

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

  const handleEditTempService = (service: ServiceInstance) => {
    setEditingServiceId(service.id);
    // O ServiceForm agora carrega o serviço internamente via hook, mas precisamos passar os dados
    // Para simplificar, vamos recarregar o formulário com o serviço selecionado
    // Como o ServiceForm usa o hook useServiceForm, precisamos de uma forma de injetar os dados.
    // Vamos usar uma prop "initialService" ou forçar uma atualização.
    // Alternativa: passar o serviço para o ServiceForm via prop.
    // Como o ServiceForm agora é controlado pelo hook, podemos expor uma função "load" via ref?
    // Para este exemplo, vou usar uma prop "editingService" que o ServiceForm irá consumir.
    // Mas para manter simples, vou passar o serviço via estado e o ServiceForm irá observar.
  };

  // Vamos modificar o ServiceForm para aceitar um "editingService" opcional.
  // Para não complicar, farei uma pequena alteração no ServiceForm: ele receberá uma prop "initialService" e usará useEffect para carregar.

  // Atualizarei o ServiceForm para aceitar "initialService" e chamar loadService quando mudar.

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

  // Cálculo de materiais (mesmo de antes)
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
        backAction={() => router.push('ferramentas')}
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

      {activeMode === 'completa' && !isDrawerOpen && (
        <FAB actions={fabConfig} hasBottomNav={true} />
      )}
    </>
  );
}
