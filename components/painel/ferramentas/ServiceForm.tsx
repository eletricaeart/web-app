// components/painel/ferramentas/SerrviceForm.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import View from '@/components/layout/View';
import { X, Check } from '@phosphor-icons/react';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { AdvancedOptions } from './AdvancedOptions';
import { MeasureInput } from './MeasureInput';
import { ServiceInstance } from '@/hooks/useRoomEditor';
import { useServiceForm } from '@/hooks/useServiceForm';

interface ServiceFormProps {
  editingServiceId: string | null;
  onSave: (serviceData: any) => void;
  onCancelEdit: () => void;
  roomName?: string; // para validação de ambiente molhado
}

export function ServiceForm({
  editingServiceId,
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
    activePerimeter,
    setActivePerimeter,
    activeHeight,
    setActiveHeight,
    addOpening,
    updateOpening,
    removeOpening,
    resetForm,
    loadService,
  } = useServiceForm();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático ao focar em input mobile
  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && window.innerWidth < 768) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  // Validação em tempo real
  const validateMeasures = () => {
    if (activeType === 'wall' || activeType === 'ceiling') {
      const hasInvalid = activeMeasures.some((m) => m.w <= 0 || m.h <= 0);
      if (hasInvalid) return 'Preencha todas as medidas.';
    }
    if (activeType === 'sanca') {
      if (activePerimeter <= 0 || activeHeight <= 0)
        return 'Preencha perímetro e altura.';
    }
    return null;
  };

  const getSuggestions = () => {
    const warnings: string[] = [];
    if (activeType === 'wall') {
      const maxHeight = Math.max(...activeMeasures.map((m) => m.h));
      if (maxHeight > 3.0 && activeStudSpacing === 0.6) {
        warnings.push(
          'Altura > 3m – recomendamos espaçamento 40cm para maior rigidez.',
        );
      }
      if (maxHeight > 3.5 && activeProfileSize === 48) {
        warnings.push(
          'Altura > 3,5m – recomendamos perfil 70mm para maior estabilidade.',
        );
      }
      if (
        activeBoardType === 'ST' &&
        (roomName.toLowerCase().includes('banheiro') ||
          roomName.toLowerCase().includes('cozinha') ||
          roomName.toLowerCase().includes('área'))
      ) {
        warnings.push(
          'Ambiente molhado – recomendamos placa RU (resistente à umidade).',
        );
      }
    }
    return warnings;
  };

  const handleSubmit = () => {
    const error = validateMeasures();
    if (error) {
      setValidationWarning(error);
      return;
    }
    setValidationWarning(null);

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
      totalArea = activePerimeter * activeHeight;
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
      boardType: activeBoardType,
      measures: activeMeasures,
      totalArea,
      useInsulation: activeType === 'wall' ? activeInsulation : false,
      profileSize: activeType === 'wall' ? activeProfileSize : undefined,
      studSpacing: activeType === 'wall' ? activeStudSpacing : undefined,
      perimeter: activeType === 'sanca' ? activePerimeter : undefined,
      height: activeType === 'sanca' ? activeHeight : undefined,
    };

    onSave(serviceData);
    resetForm();
  };

  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
      {editingServiceId && (
        <div className="flex justify-between items-center bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Editando Serviço
          </span>
          <X size={14} onClick={onCancelEdit} className="cursor-pointer" />
        </div>
      )}

      <ServiceTypeSelector value={activeType} onChange={setActiveType} />

      <Input
        ref={inputRef}
        placeholder="Identificação (Ex: Parede Leste, Forro Sala, Sanca Iluminação)"
        value={activeTag}
        onChange={(e) => setActiveTag(e.target.value)}
        className="bg-white"
      />

      {activeType === 'wall' && (
        <AdvancedOptions
          boardType={activeBoardType}
          setBoardType={setActiveBoardType}
          profileSize={activeProfileSize}
          setProfileSize={setActiveProfileSize}
          studSpacing={activeStudSpacing}
          setStudSpacing={setActiveStudSpacing}
          isOpen={showAdvanced}
          onOpenChange={setShowAdvanced}
        />
      )}

      {activeType === 'wall' && (
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
      )}

      <MeasureInput
        type={activeType}
        measures={activeMeasures}
        setMeasures={setActiveMeasures}
        perimeter={activePerimeter}
        setPerimeter={setActivePerimeter}
        height={activeHeight}
        setHeight={setActiveHeight}
        addOpening={addOpening}
        updateOpening={updateOpening}
        removeOpening={removeOpening}
      />

      {validationWarning && (
        <div className="text-red-500 text-[12px] font-bold bg-red-50 p-2 rounded-lg border border-red-200">
          {validationWarning}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="text-amber-600 text-[11px] font-medium bg-amber-50 p-2 rounded-lg border border-amber-200 space-y-1">
          {suggestions.map((s, i) => (
            <div key={i}>💡 {s}</div>
          ))}
        </div>
      )}

      {/* Visor de área ao vivo */}
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
          {activeType === 'sanca'
            ? (activePerimeter * activeHeight).toFixed(2)
            : activeMeasures
                .reduce((acc, m) => {
                  const gross = m.w * m.h;
                  const openings = m.openings.reduce(
                    (a, o) => a + o.w * o.h,
                    0,
                  );
                  return acc + (gross - openings);
                }, 0)
                .toFixed(2)}{' '}
          m²
        </div>
      </View>

      <Button
        variant="ghost"
        onClick={handleSubmit}
        className={`w-full font-bold text-[12px] uppercase h-12 border-2 border-dashed rounded-xl ${
          editingServiceId
            ? 'text-indigo-700 border-indigo-200 bg-indigo-50'
            : 'text-indigo-800 border-indigo-100'
        }`}
      >
        {editingServiceId ? 'Atualizar Serviço' : 'Adicionar Serviço'}
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
