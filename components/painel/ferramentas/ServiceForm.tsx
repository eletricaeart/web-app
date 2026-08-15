// components/painel/ferramentas/ServiceForm.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wall, HardHat, Door, Browser, Trash, X } from '@phosphor-icons/react';
import View from '@/components/layout/View';
import { useServiceForm } from '@/hooks/useServiceForm';

interface ServiceFormProps {
  editingServiceId: string | null;
  onSave: (serviceData: any) => void;
  onCancelEdit: () => void;
}

export function ServiceForm({
  editingServiceId,
  onSave,
  onCancelEdit,
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
    activePerimeter,
    setActivePerimeter,
    activeHeight,
    setActiveHeight,
    addMeasureField,
    addOpening,
    updateOpening,
    removeOpening,
  } = useServiceForm();

  // Cálculo da área ao vivo (apenas para parede/forro)
  const currentLiveArea = React.useMemo(() => {
    if (activeType === 'sanca') return 0;
    return activeMeasures.reduce((acc, m) => {
      const grossArea = m.w * m.h;
      const openingsArea = m.openings.reduce((oAcc, o) => oAcc + o.w * o.h, 0);
      return acc + (grossArea - openingsArea);
    }, 0);
  }, [activeMeasures, activeType]);

  const handleSubmit = () => {
    // Monta o objeto de serviço
    let serviceData: any = {
      type: activeType,
      tag:
        activeTag ||
        (activeType === 'wall'
          ? 'Parede'
          : activeType === 'ceiling'
            ? 'Forro'
            : 'Sanca'),
      boardType: activeBoardType,
    };

    if (activeType === 'wall') {
      serviceData = {
        ...serviceData,
        useInsulation: activeInsulation,
        measures: activeMeasures,
        profileSize: activeProfileSize,
        studSpacing: activeStudSpacing,
        totalArea: currentLiveArea,
      };
    } else if (activeType === 'ceiling') {
      serviceData = {
        ...serviceData,
        measures: activeMeasures,
        totalArea: currentLiveArea,
      };
    } else if (activeType === 'sanca') {
      serviceData = {
        ...serviceData,
        perimeter: activePerimeter,
        height: activeHeight,
        totalArea: activePerimeter * activeHeight, // área aproximada
        measures: [], // sanca não usa medidas múltiplas
      };
    }

    onSave(serviceData);
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-bold uppercase transition-all ${
              activeType === type ? 'bg-[#00559c] text-white' : 'text-slate-400'
            } 
               ${type === 'wall' && 'rounded-[.9rem_.2rem_.2rem_.9rem]'}
               ${type === 'ceiling' && 'rounded-[.2rem]'}
               ${type === 'sanca' && 'rounded-[.2rem_.9rem_.9rem_.2rem]'}
            `}
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

      {/* Identificação */}
      <Input
        placeholder="Identificação (Ex: Parede Leste, Forro Sala, Sanca Iluminação)"
        value={activeTag}
        onChange={(e) => setActiveTag(e.target.value)}
        className="bg-white"
      />

      {/* Campos específicos para Sanca */}
      {activeType === 'sanca' && (
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[10px] font-bold text-slate-400">
              Perímetro (m)
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={activePerimeter || ''}
              onChange={(e) =>
                setActivePerimeter(parseFloat(e.target.value) || 0)
              }
            />
          </label>
          <label>
            <span className="text-[10px] font-bold text-slate-400">
              Altura (m)
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={activeHeight || ''}
              onChange={(e) => setActiveHeight(parseFloat(e.target.value) || 0)}
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
                        Descontar Vãos
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addOpening(mIdx, 'door')}
                          className="p-1 bg-orange-50 text-orange-600 rounded flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Door size={16} /> + Porta
                        </button>
                        <button
                          type="button"
                          onClick={() => addOpening(mIdx, 'window')}
                          className="p-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Browser size={16} /> + Janela
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {m.openings?.map((o, oIdx) => (
                        <div
                          key={o.id}
                          className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-right-2"
                        >
                          <span className="text-[10px] uppercase font-bold text-slate-400 w-4">
                            {o.type === 'door' ? 'P' : 'J'}
                          </span>
                          <Input
                            className="h-8 text-[12px]"
                            type="number"
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
                            className="h-8 text-[12px]"
                            type="number"
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

      {/* Visor de Área (apenas parede/forro) */}
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
        className={`w-full mb-4 font-bold text-[12px] uppercase h-12 border-2 border-dashed rounded-xl ${
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
