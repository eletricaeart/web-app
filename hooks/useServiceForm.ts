// hooks/useServiceForm.ts
import { useState, useCallback } from 'react';
import { ServiceInstance, Opening } from './useRoomEditor';

type ServiceType = 'wall' | 'ceiling' | 'sanca';

export function useServiceForm() {
  const [activeType, setActiveType] = useState<ServiceType>('wall');
  const [activeTag, setActiveTag] = useState('');
  const [activeInsulation, setActiveInsulation] = useState(false);
  const [activeMeasures, setActiveMeasures] = useState<
    { w: number; h: number; openings: Opening[] }[]
  >([{ w: 0, h: 0, openings: [] }]);
  const [activeBoardType, setActiveBoardType] = useState<'ST' | 'RU' | 'RF'>(
    'ST',
  );
  const [activeProfileSize, setActiveProfileSize] = useState<48 | 70 | 90>(48);
  const [activeStudSpacing, setActiveStudSpacing] = useState<0.4 | 0.6>(0.6);

  // Para forro: offset dos tirantes (distância da borda)
  const [tiranteOffset, setTiranteOffset] = useState<number>(0.6); // padrão 60cm

  // Para aberturas: posição inicial padrão (o usuário poderá alterar individualmente)
  const [defaultOpeningPosX, setDefaultOpeningPosX] = useState<number>(0.5);

  const addMeasureField = useCallback(() => {
    setActiveMeasures((prev) => [...prev, { w: 0, h: 0, openings: [] }]);
  }, []);

  const addOpening = useCallback(
    (measureIndex: number, type: 'door' | 'window') => {
      setActiveMeasures((prev) => {
        const newMeasures = [...prev];
        if (newMeasures[measureIndex]) {
          newMeasures[measureIndex].openings.push({
            id: Math.random().toString(),
            type,
            w: 0,
            h: 0,
            posX: defaultOpeningPosX, // usa o valor padrão atual
          });
        }
        return newMeasures;
      });
    },
    [defaultOpeningPosX],
  );

  const updateOpening = useCallback(
    (
      mIdx: number,
      oIdx: number,
      field: 'w' | 'h' | 'posX' | 'posY',
      val: number,
    ) => {
      setActiveMeasures((prev) => {
        const newMeasures = [...prev];
        if (newMeasures[mIdx] && newMeasures[mIdx].openings[oIdx]) {
          newMeasures[mIdx].openings[oIdx][field] = val;
        }
        return newMeasures;
      });
    },
    [],
  );

  const removeOpening = useCallback(
    (measureIndex: number, openingIndex: number) => {
      setActiveMeasures((prev) => {
        const newMeasures = [...prev];
        if (newMeasures[measureIndex]) {
          newMeasures[measureIndex].openings.splice(openingIndex, 1);
        }
        return newMeasures;
      });
    },
    [],
  );

  const resetForm = useCallback(() => {
    setActiveTag('');
    setActiveInsulation(false);
    setActiveMeasures([{ w: 0, h: 0, openings: [] }]);
    setActiveBoardType('ST');
    setActiveProfileSize(48);
    setActiveStudSpacing(0.6);
    setTiranteOffset(0.6);
    setDefaultOpeningPosX(0.5);
  }, []);

  const loadService = useCallback((service: ServiceInstance) => {
    setActiveType(service.type);
    setActiveTag(service.tag);
    setActiveInsulation(service.useInsulation || false);
    setActiveMeasures(service.measures);
    setActiveBoardType(service.boardType || 'ST');
    if (service.type === 'wall') {
      setActiveProfileSize(service.profileSize || 48);
      setActiveStudSpacing(service.studSpacing || 0.6);
    }
    if (service.type === 'ceiling') {
      setTiranteOffset(service.tiranteOffset || 0.6);
    }
  }, []);

  return {
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
  };
}
