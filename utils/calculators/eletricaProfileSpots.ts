// utils/calculators/eletricaProfileSpots.ts

export interface ProfileSegment {
  id: string;
  length: number; // comprimento em metros
  ledType: 'SMD2835' | 'SMD5050' | 'COB';
  ledDensity: 60 | 120 | 240; // LEDs por metro
  colorTemp: '3000K' | '4000K' | '6500K';
  beamAngle?: 120 | 160;
}

export interface SpotPoint {
  id: string;
  x: number; // posição X no blueprint (em metros)
  y: number; // posição Y no blueprint (em metros)
  type: 'embutido' | 'sobrepor' | 'pendente';
  diameter: number; // cm (ex: 7.5, 10, 12, 15)
  color: 'branco' | 'preto' | 'cromo' | 'ouro';
  beamAngle: 15 | 24 | 36 | 60;
}

export interface AmbienteEletrico {
  id: string;
  name: string;
  width: number;
  height: number; // ou comprimento
  profiles: ProfileSegment[];
  spots: SpotPoint[];
  // Resultados calculados
  totalProfileLength?: number;
  totalSpotPower?: number; // Watts
  totalCurrent?: number; // Amperes
}

export function calculateElectricalLoad(ambientes: AmbienteEletrico[]) {
  let totalWatts = 0;
  let totalAmperes = 0;

  ambientes.forEach((ambiente) => {
    const profileWatts = ambiente.profiles.reduce((acc, p) => {
      const wattsPerMeter =
        {
          SMD2835: 8,
          SMD5050: 14.4,
          COB: 20,
        }[p.ledType] || 8;

      const densityMultiplier =
        {
          60: 1,
          120: 1.8,
          240: 3.2,
        }[p.ledDensity] || 1;

      return acc + p.length * wattsPerMeter * densityMultiplier;
    }, 0);

    const spotWatts = ambiente.spots.reduce((acc, s) => {
      const wattsByDiameter: Record<number, number> = {
        7.5: 8,
        10: 12,
        12: 18,
        15: 25,
      };
      // Se não encontrar, usa regra: ~1.5W por cm de diâmetro
      const watts = wattsByDiameter[s.diameter] || s.diameter * 1.5;
      return acc + watts;
    }, 0);

    const ambienteWatts = profileWatts + spotWatts;
    totalWatts += ambienteWatts;

    // Considerando tensão 220V (monofásico)
    totalAmperes += ambienteWatts / 220;
  });

  return {
    totalWatts: Number(totalWatts.toFixed(2)),
    totalAmperes: Number(totalAmperes.toFixed(2)),
    totalPotencia: `${totalWatts.toFixed(2)}W`,
    correnteTotal: `${totalAmperes.toFixed(2)}A`,
  };
}

export function calculateProfileMaterials(profiles: ProfileSegment[]) {
  const totalLength = profiles.reduce((acc, p) => acc + p.length, 0);

  // Cada perfil de LED tem 5m de comprimento padrão
  const profileBars = Math.ceil(totalLength / 5);

  // Conectores: um a cada 5m (ou menos)
  const connectors = Math.max(profileBars - 1, 0);

  // Drivers (fontes): 1 driver para até 100W, considerando 60W ou 100W
  const totalWatts = profiles.reduce((acc, p) => {
    const wattsPerMeter =
      {
        SMD2835: 8,
        SMD5050: 14.4,
        COB: 20,
      }[p.ledType] || 8;
    const densityMultiplier =
      {
        60: 1,
        120: 1.8,
        240: 3.2,
      }[p.ledDensity] || 1;
    return acc + p.length * wattsPerMeter * densityMultiplier;
  }, 0);

  const driversNeeded = Math.ceil(totalWatts / 100);

  return [
    { item: 'Perfil de LED (5m)', qtd: profileBars, unit: 'br' },
    { item: 'Conector para perfil', qtd: connectors, unit: 'un' },
    { item: 'Fonte / Driver 100W', qtd: driversNeeded, unit: 'un' },
    {
      item: 'Fita LED (metro)',
      qtd: Number(totalLength.toFixed(2)),
      unit: 'm',
    },
    {
      item: 'Cabo PP 2x0.75mm² (metro)',
      qtd: Number((totalLength * 1.2).toFixed(2)),
      unit: 'm',
    },
  ];
}

export function calculateSpotMaterials(spots: SpotPoint[]) {
  const totalSpots = spots.length;

  // Fiação estimada: 1.5m por spot
  const wireLength = spots.length * 1.5;

  // Caixas de passagem (1 a cada 3 spots)
  const junctionBoxes = Math.ceil(spots.length / 3);

  // Parafusos/buchas para sobrepor
  const screwCount = spots.filter((s) => s.type === 'sobrepor').length * 2;

  // Para embutidos, adicional de suporte/aro
  const supportCount = spots.filter((s) => s.type === 'embutido').length;

  return [
    { item: 'Spot / Luminária', qtd: totalSpots, unit: 'un' },
    {
      item: 'Cabo PP 2x1.0mm² (metro)',
      qtd: Number(wireLength.toFixed(2)),
      unit: 'm',
    },
    { item: 'Caixa de Passagem 4x2"', qtd: junctionBoxes, unit: 'un' },
    { item: 'Parafuso / Bucha', qtd: screwCount, unit: 'un' },
    { item: 'Suporte / Aro para Embutido', qtd: supportCount, unit: 'un' },
  ];
}
