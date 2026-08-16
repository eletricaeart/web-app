// components/painel/ferramentas/ServiceForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Wall,
  HardHat,
  Square,
  Door,
  Browser,
  Trash,
  X,
  Plus,
  CaretDown,
} from '@phosphor-icons/react';
import View from '@/components/layout/View';
import { ServiceInstance, Opening } from '@/hooks/useRoomEditor';
import { useServiceForm } from '@/hooks/useServiceForm';
import { toast } from 'sonner';

interface ServiceFormProps {
  editingServiceId: string | null;
  initialService: ServiceInstance | null;
  onSave: (serviceData: Partial<ServiceInstance>) => void;
  onCancelEdit: () => void;
  roomName?: string;
}

// Função auxiliar para gerar nome automático de vãos
const generateOpeningName = (
  type: 'door' | 'window' | 'opening',
  existingOpenings: Opening[],
): string => {
  const baseName =
    type === 'door' ? 'Porta' : type === 'window' ? 'Janela' : 'Vão';
  const sameTypeCount = existingOpenings.filter((o) => o.type === type).length;
  return `${baseName} ${sameTypeCount + 1}`;
};

export function ServiceForm({
  editingServiceId,
  initialService,
  onSave,
  onCancelEdit,
  roomName = '',
}: ServiceFormProps) {
  const {
    activeType,
    setActiveType,
    activeTag,
    setActiveTag,
    activeInsulation,
    setActiveInsulation,
    activeMeasures,
    setActiveMeasures,
    activeBoardType,
    setActiveBoardType,
    activeProfileSize,
    setActiveProfileSize,
    activeStudSpacing,
    setActiveStudSpacing,
    tiranteOffset,
    setTiranteOffset,
    defaultOpeningPosX,
    setDefaultOpeningPosX,
    addMeasureField,
    addOpening,
    updateOpening,
    removeOpening,
    resetForm,
    loadService,
  } = useServiceForm();

  // Estado para controlar abertura do menu de adição de vãos
  const [isAddOpeningOpen, setIsAddOpeningOpen] = useState(false);

  // Carregar serviço inicial quando editar
  useEffect(() => {
    if (initialService && editingServiceId) {
      loadService(initialService);
    }
  }, [initialService, editingServiceId, loadService]);

  // Calcular área ao vivo
  const currentLiveArea = React.useMemo(() => {
    if (activeType === 'sanca') return 0;
    return activeMeasures.reduce((acc, m) => {
      const grossArea = m.w * m.h;
      const openingsArea = m.openings.reduce((oAcc, o) => oAcc + o.w * o.h, 0);
      return acc + (grossArea - openingsArea);
    }, 0);
  }, [activeMeasures, activeType]);

  // Manipular adição de vão com nome automático e posX default
  const handleAddOpening = (type: 'door' | 'window' | 'opening') => {
    const measureIndex = 0; // Por simplicidade, adiciona na primeira medida
    const currentOpenings = activeMeasures[0]?.openings || [];
    const name = generateOpeningName(type, currentOpenings);
    const posX = defaultOpeningPosX;

    // Para janelas e vãos, definir posY padrão como a altura da parede - altura do vão (será preenchido depois)
    const posY = 0; // será atualizado pelo usuário

    const newOpening: Opening = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      w: 0,
      h: 0,
      posX,
      posY: type === 'door' ? 0 : posY, // Portas começam no chão
      name,
    };

    const newMeasures = [...activeMeasures];
    if (!newMeasures[0]) {
      newMeasures[0] = { w: 0, h: 0, openings: [] };
    }
    newMeasures[0].openings.push(newOpening);
    setActiveMeasures(newMeasures);
    setIsAddOpeningOpen(false);
    toast.success(`${name} adicionada!`);
  };

  const handleSubmit = () => {
    // Validações básicas
    if (activeType === 'wall' || activeType === 'ceiling') {
      if (!activeMeasures.every((m) => m.w > 0 && m.h > 0)) {
        toast.warning('Preencha as medidas principais (largura e altura).');
        return;
      }
    }
    if (activeType === 'sanca') {
      const perimeter = activeMeasures[0]?.w || 0;
      const height = activeMeasures[0]?.h || 0;
      if (perimeter <= 0 || height <= 0) {
        toast.warning('Preencha perímetro e altura da sanca.');
        return;
      }
    }

    let totalArea = 0;
    if (activeType === 'wall' || activeType === 'ceiling') {
      totalArea = activeMeasures.reduce((acc, m) => {
        const grossArea = m.w * m.h;
        const openingsArea = m.openings.reduce(
          (oAcc, o) => oAcc + o.w * o.h,
          0,
        );
        return acc + (grossArea - openingsArea);
      }, 0);
    } else if (activeType === 'sanca') {
      totalArea = (activeMeasures[0]?.w || 0) * (activeMeasures[0]?.h || 0);
    }

    const serviceData: Partial<ServiceInstance> = {
      type: activeType,
      tag:
        activeTag ||
        (activeType === 'wall'
          ? 'Parede'
          : activeType === 'ceiling'
            ? 'Forro'
            : 'Sanca'),
      useInsulation: activeType === 'wall' ? activeInsulation : false,
      measures: activeMeasures.map((m) => ({
        ...m,
        openings: m.openings.map((o) => ({
          ...o,
          posX: o.posX ?? defaultOpeningPosX,
          posY: o.posY ?? 0,
        })),
      })),
      totalArea,
      boardType: activeBoardType,
      profileSize: activeType === 'wall' ? activeProfileSize : undefined,
      studSpacing: activeType === 'wall' ? activeStudSpacing : undefined,
      tiranteOffset: activeType === 'ceiling' ? tiranteOffset : undefined,
      perimeter: activeType === 'sanca' ? activeMeasures[0]?.w : undefined,
      height: activeType === 'sanca' ? activeMeasures[0]?.h : undefined,
    };

    onSave(serviceData);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 rounded-2xl border border-slate-200">
      {editingServiceId && (
        <div className="flex justify-between items-center bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Editando Serviço
          </span>
          <X size={14} onClick={onCancelEdit} className="cursor-pointer" />
        </div>
      )}

      {/* Tipo de serviço */}
      <View tag="tab-grid" className="flex bg-white rounded-xl p-1 border">
        {(['wall', 'ceiling', 'sanca'] as const).map((type) => (
          <Button
            key={type}
            variant={activeType === type ? 'default' : 'outline'}
            onClick={() => setActiveType(type)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0.9rem] text-[12px] font-bold uppercase transition-all ${
              activeType === type ? 'bg-[#00559c] text-white' : 'text-slate-400'
            }`}
          >
            {type === 'wall' && <Wall size={18} />}
            {type === 'ceiling' && <HardHat size={18} />}
            {type === 'sanca' && <span className="text-lg">⎔</span>}
            {type === 'wall'
              ? 'Parede'
              : type === 'ceiling'
                ? 'Forro'
                : 'Sanca'}
          </Button>
        ))}
      </View>

      {/* Opções de placa */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
          Tipo de Placa
        </span>
        <div className="flex bg-white rounded-xl p-1 border gap-1">
          {(['ST', 'RU', 'RF'] as const).map((type) => (
            <Button
              key={type}
              variant={activeBoardType === type ? 'default' : 'outline'}
              onClick={() => setActiveBoardType(type)}
              className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                activeBoardType === type
                  ? 'bg-[#00559c] text-white'
                  : 'text-slate-400'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Opções específicas para parede */}
      {activeType === 'wall' && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Perfil (mm)
            </span>
            <div className="flex bg-white rounded-xl p-1 border gap-1">
              {([48, 70, 90] as const).map((size) => (
                <Button
                  key={size}
                  variant={activeProfileSize === size ? 'default' : 'outline'}
                  onClick={() => setActiveProfileSize(size)}
                  className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                    activeProfileSize === size
                      ? 'bg-[#00559c] text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Espaçamento Montantes
            </span>
            <div className="flex bg-white rounded-xl p-1 border gap-1">
              {([0.4, 0.6] as const).map((spacing) => (
                <Button
                  key={spacing}
                  variant={
                    activeStudSpacing === spacing ? 'default' : 'outline'
                  }
                  onClick={() => setActiveStudSpacing(spacing)}
                  className={`flex-1 text-[10px] font-bold uppercase h-8 ${
                    activeStudSpacing === spacing
                      ? 'bg-[#00559c] text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {spacing === 0.4 ? '40cm' : '60cm'}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
            <Label
              htmlFor="incluir-la-mode"
              className="flex items-center justify-between w-full text-[12px] font-bold text-slate-700 capitalize cursor-pointer"
            >
              Incluir Lã de Vidro/Pet
              <Switch
                id="incluir-la-mode"
                checked={activeInsulation}
                onCheckedChange={setActiveInsulation}
                className="data-[state=checked]:bg-[#00559C]"
              />
            </Label>
          </div>
        </>
      )}

      {/* Para forro: offset dos tirantes */}
      {activeType === 'ceiling' && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">
            Distância dos tirantes à borda (m)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={tiranteOffset || ''}
            onChange={(e) =>
              setTiranteOffset(parseFloat(e.target.value) || 0.6)
            }
            className="bg-white"
          />
          <span className="text-[9px] text-slate-400 italic">
            Padrão NBR: 0,60m
          </span>
        </div>
      )}

      {/* Para aberturas: posição inicial padrão */}
      {activeType === 'wall' && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">
            Posição inicial padrão dos vãos (m)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={defaultOpeningPosX || ''}
            onChange={(e) =>
              setDefaultOpeningPosX(parseFloat(e.target.value) || 0)
            }
            className="bg-white"
          />
          <span className="text-[9px] text-slate-400 italic">
            Distância a partir da extremidade esquerda
          </span>
        </div>
      )}

      {/* Identificação */}
      <Input
        placeholder="Identificação (Ex: Parede Leste, Forro Sala, Sanca Iluminação)"
        value={activeTag}
        onChange={(e) => setActiveTag(e.target.value)}
        className="bg-white"
      />

      {/* Campos específicos para Sanca (usando medidas[0] como perímetro/altura) */}
      {activeType === 'sanca' && (
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[10px] font-bold text-slate-400">
              Perímetro (m)
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={activeMeasures[0]?.w || ''}
              onChange={(e) => {
                const newMeasures = [...activeMeasures];
                if (!newMeasures[0])
                  newMeasures[0] = { w: 0, h: 0, openings: [] };
                newMeasures[0].w = parseFloat(e.target.value) || 0;
                setActiveMeasures(newMeasures);
              }}
            />
          </label>
          <label>
            <span className="text-[10px] font-bold text-slate-400">
              Altura (m)
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={activeMeasures[0]?.h || ''}
              onChange={(e) => {
                const newMeasures = [...activeMeasures];
                if (!newMeasures[0])
                  newMeasures[0] = { w: 0, h: 0, openings: [] };
                newMeasures[0].h = parseFloat(e.target.value) || 0;
                setActiveMeasures(newMeasures);
              }}
            />
          </label>
        </div>
      )}

      {/* Medidas para parede/forro */}
      {(activeType === 'wall' || activeType === 'ceiling') && (
        <View tag="medidas-dinamicas" className="space-y-4">
          <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
            Medidas (Soma Automática)
          </span>
          <View
            tag="measures"
            className="flex flex-col space-y-2 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
          >
            {activeMeasures.map((m, mIdx) => (
              <View tag="measure-card" key={mIdx} className="space-y-3">
                <View
                  tag="main-measure-inputs"
                  className="grid grid-cols-2 gap-2"
                >
                  <label>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      Largura (m)
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={m.w || ''}
                      onChange={(e) => {
                        const nm = [...activeMeasures];
                        nm[mIdx].w = parseFloat(e.target.value) || 0;
                        setActiveMeasures(nm);
                      }}
                    />
                  </label>
                  <label>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      {activeType === 'wall' ? 'Altura (m)' : 'Comprimento (m)'}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={m.h || ''}
                      onChange={(e) => {
                        const nm = [...activeMeasures];
                        nm[mIdx].h = parseFloat(e.target.value) || 0;
                        setActiveMeasures(nm);
                      }}
                    />
                  </label>
                </View>

                {activeType === 'wall' && (
                  <View
                    tag="add-portas-e-janelas"
                    className="space-y-2 mt-2 px-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-500 capitalize">
                        Vãos
                      </span>
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-bold gap-1"
                          onClick={() => setIsAddOpeningOpen(!isAddOpeningOpen)}
                        >
                          <Plus size={14} weight="bold" />
                          Adicionar
                          <CaretDown
                            size={12}
                            className={`transition-transform ${isAddOpeningOpen ? 'rotate-180' : ''}`}
                          />
                        </Button>
                        {isAddOpeningOpen && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-10 min-w-[130px]">
                            <button
                              type="button"
                              onClick={() => handleAddOpening('door')}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-orange-50 rounded-lg flex items-center gap-2"
                            >
                              <Door size={16} className="text-orange-500" />
                              Porta
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddOpening('window')}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                            >
                              <Browser size={16} className="text-blue-500" />
                              Janela
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddOpening('opening')}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                            >
                              <Square size={16} className="text-slate-500" />
                              Vão
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {m.openings?.map((o, oIdx) => (
                        <div
                          key={o.id}
                          className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-right-2"
                        >
                          <span className="text-[10px] uppercase font-bold text-slate-400 w-6">
                            {o.type === 'door'
                              ? 'P'
                              : o.type === 'window'
                                ? 'J'
                                : 'V'}
                          </span>
                          <Input
                            className="h-8 text-[12px] w-14"
                            type="number"
                            step="0.05"
                            placeholder="L"
                            value={o.w || ''}
                            onChange={(e) =>
                              updateOpening(
                                mIdx,
                                oIdx,
                                'w',
                                parseFloat(e.target.value),
                              )
                            }
                          />
                          <Input
                            className="h-8 text-[12px] w-14"
                            type="number"
                            step="0.05"
                            placeholder="A"
                            value={o.h || ''}
                            onChange={(e) =>
                              updateOpening(
                                mIdx,
                                oIdx,
                                'h',
                                parseFloat(e.target.value),
                              )
                            }
                          />
                          <Input
                            className="h-8 text-[12px] w-16"
                            type="number"
                            step="0.1"
                            placeholder="PosX"
                            value={o.posX ?? defaultOpeningPosX}
                            onChange={(e) =>
                              updateOpening(
                                mIdx,
                                oIdx,
                                'posX',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                          {(o.type === 'window' || o.type === 'opening') && (
                            <Input
                              className="h-8 text-[12px] w-16"
                              type="number"
                              step="0.1"
                              placeholder="PosY"
                              value={o.posY ?? 0}
                              onChange={(e) =>
                                updateOpening(
                                  mIdx,
                                  oIdx,
                                  'posY',
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          )}
                          <Input
                            className="h-8 text-[12px] flex-1 min-w-[60px]"
                            placeholder="Nome"
                            value={o.name || ''}
                            onChange={(e) => {
                              const newMeasures = [...activeMeasures];
                              newMeasures[mIdx].openings[oIdx].name =
                                e.target.value;
                              setActiveMeasures(newMeasures);
                            }}
                          />
                          <View
                            className="grid items-center justify-center bg-red-100 rounded-full p-1 cursor-pointer"
                            onClick={() => removeOpening(mIdx, oIdx)}
                          >
                            <Trash
                              size={14}
                              weight="duotone"
                              className="text-red-600"
                            />
                          </View>
                        </div>
                      ))}
                    </div>
                  </View>
                )}

                {mIdx < activeMeasures.length - 1 && (
                  <div className="border-b border-slate-50 my-2" />
                )}
              </View>
            ))}
            <Button
              variant="ghost"
              onClick={addMeasureField}
              className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl mt-2"
            >
              Adicionar Medida (Irregular)
            </Button>
          </View>
        </View>
      )}

      {/* Visor de Área */}
      {(activeType === 'wall' || activeType === 'ceiling') && (
        <View
          tag="visor-area"
          className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase opacity-80">
              Área Calculada
            </span>
            <span className="text-xs italic opacity-70">(Bruta - Vãos)</span>
          </div>
          <div className="text-xl font-black">
            {currentLiveArea.toFixed(2)} m²
          </div>
        </View>
      )}

      {/* Botão Salvar */}
      <Button
        variant="ghost"
        onClick={handleSubmit}
        className={`w-full font-bold text-[12px] uppercase h-12 border-2 border-dashed rounded-xl ${
          editingServiceId
            ? 'text-indigo-700 border-indigo-200 bg-indigo-50'
            : 'text-indigo-800 border-indigo-100'
        }`}
      >
        {editingServiceId
          ? 'Atualizar Serviço no Rascunho'
          : 'Salvar o serviço na lista'}
      </Button>

      {editingServiceId && (
        <Button
          variant="ghost"
          onClick={onCancelEdit}
          className="w-full text-slate-400 font-bold text-[10px] uppercase h-8"
        >
          Cancelar Edição
        </Button>
      )}
    </div>
  );
}
