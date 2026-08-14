// utils/calculators/eletrica.ts
/**
 * Motor de cálculos elétricos em estrita conformidade com a ABNT NBR 5410
 * (Instalações Elétricas de Baixa Tensão).
 */

export interface CableDimensionInput {
  voltage: number; // Tensão em Volts (ex: 127, 220, 380)
  power: number; // Potência em Watts
  powerFactor?: number; // Fator de potência cos phi (ex: 0.95 para resistivo/geral, 0.8 para motores)
  distance: number; // Comprimento do circuito em metros
  maxVoltageDropPercent: number; // Queda máxima permitida (ex: 2% terminal, 4% total)
  phaseType: 'monofasico' | 'trifasico';
  conductorMaterial?: 'cobre' | 'aluminio';
  installationMethod?: 'B1' | 'A1' | 'C'; // B1 = condutores isolados em eletroduto embutido em alvenaria
  temperature?: number; // Temperatura ambiente (padrão 30°C)
}

export interface CableDimensionResult {
  nominalCurrent: number; // Corrente de projeto Ib (A)
  voltageDropVolts: number; // Queda de tensão real em Volts
  voltageDropPercent: number; // Queda de tensão percentual (%)
  calculatedSectionDrop: number; // Seção teórica pela queda (mm²)
  calculatedSectionAmpacity: number; // Seção teórica pela capacidade (mm²)
  recommendedSection: number; // Seção comercial normalizada (mm²)
  recommendedBreaker: number; // Disjuntor termomagnético comercial recomendado (A)
  cableMaxCurrent: number; // Capacidade Iz do cabo escolhido (A)
  jouleLossWatts: number; // Perda por efeito Joule no condutor (W)
  isSafe: boolean;
  warnings: string[];
  complianceNotes: string[];
}

// Seções comerciais normalizadas de condutores de cobre (mm²)
export const STANDARD_CABLE_SECTIONS = [
  1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0, 150.0,
  185.0, 240.0,
];

// Disjuntores comerciais padrão DIN (A)
export const STANDARD_BREAKERS = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200, 225, 250,
];

// Tabela 36 NBR 5410 - Capacidade de condução de corrente (A)
// Condutores de Cobre, Isolação PVC 70°C, Temp 30°C, Método B1 (Eletroduto embutido)
const AMPACITY_COPPER_PVC_B1_2COND: Record<number, number> = {
  1.5: 17.5,
  2.5: 24.0,
  4.0: 32.0,
  6.0: 41.0,
  10.0: 57.0,
  16.0: 76.0,
  25.0: 101.0,
  35.0: 125.0,
  50.0: 151.0,
  70.0: 192.0,
  95.0: 232.0,
  120.0: 269.0,
  150.0: 300.0,
  185.0: 341.0,
  240.0: 400.0,
};

const AMPACITY_COPPER_PVC_B1_3COND: Record<number, number> = {
  1.5: 15.5,
  2.5: 21.0,
  4.0: 28.0,
  6.0: 36.0,
  10.0: 50.0,
  16.0: 68.0,
  25.0: 89.0,
  35.0: 110.0,
  50.0: 134.0,
  70.0: 171.0,
  95.0: 207.0,
  120.0: 239.0,
  150.0: 272.0,
  185.0: 310.0,
  240.0: 364.0,
};

/**
 * Calcula o dimensionamento seguro de condutores e disjuntor (NBR 5410)
 */
export function calculateCableDimension(
  input: CableDimensionInput,
): CableDimensionResult {
  const {
    voltage,
    power,
    powerFactor = 0.95,
    distance,
    maxVoltageDropPercent,
    phaseType,
    conductorMaterial = 'cobre',
  } = input;

  const warnings: string[] = [];
  const complianceNotes: string[] = [];

  // Resistividade elétrica (rho a 20°C): Cobre = 0.0172 ohm.mm²/m | Alumínio = 0.0282 ohm.mm²/m
  const rho = conductorMaterial === 'cobre' ? 0.0172 : 0.0282;

  // 1. Cálculo da Corrente de Projeto (Ib)
  let ib = 0;
  if (phaseType === 'monofasico') {
    ib = power / (voltage * powerFactor);
  } else {
    // Trifásico
    ib = power / (Math.sqrt(3) * voltage * powerFactor);
  }

  // 2. Queda de tensão máxima permitida em Volts
  const deltaVMax = (maxVoltageDropPercent / 100) * voltage;

  // 3. Seção teórica requerida por Queda de Tensão (S = k * rho * L * I / deltaV)
  // k = 2 para monofásico (ida e volta) | k = sqrt(3) para trifásico
  const k = phaseType === 'monofasico' ? 2 : Math.sqrt(3);
  const calculatedSectionDrop = (k * rho * distance * ib) / deltaVMax;

  // 4. Seção mínima pela Capacidade de Condução de Corrente (Critério Térmico Iz >= Ib)
  const ampacityTable =
    phaseType === 'monofasico'
      ? AMPACITY_COPPER_PVC_B1_2COND
      : AMPACITY_COPPER_PVC_B1_3COND;

  let sectionByAmpacity = STANDARD_CABLE_SECTIONS[0];
  for (const sec of STANDARD_CABLE_SECTIONS) {
    if ((ampacityTable[sec] || 0) >= ib) {
      sectionByAmpacity = sec;
      break;
    }
  }

  // Seção mínima normativa NBR 5410:
  // Circuitos de iluminação: mín 1.5mm² | Circuitos de tomadas/força: mín 2.5mm²
  const minNormative = power > 1200 ? 2.5 : 1.5;

  // Seleciona a maior seção entre todos os critérios
  let chosenSection = Math.max(
    calculatedSectionDrop,
    sectionByAmpacity,
    minNormative,
  );

  // Encontra a seção comercial correspondente ou imediatamente superior
  const recommendedSection =
    STANDARD_CABLE_SECTIONS.find((s) => s >= chosenSection) ||
    STANDARD_CABLE_SECTIONS[STANDARD_CABLE_SECTIONS.length - 1];

  const cableMaxCurrent = ampacityTable[recommendedSection] || 0;

  // 5. Cálculo da Queda de Tensão Real com a seção escolhida
  const realDeltaV = (k * rho * distance * ib) / recommendedSection;
  const realDeltaVPercent = (realDeltaV / voltage) * 100;

  // 6. Perda por Efeito Joule (Watts)
  // R = rho * L / S
  const resistance = (rho * distance) / recommendedSection;
  const jouleLossWatts =
    (phaseType === 'monofasico' ? 2 : 3) * resistance * Math.pow(ib, 2);

  // 7. Seleção do Disjuntor Adequado (Condição Normativa: Ib <= In <= Iz)
  // Escolhe o disjuntor padrão mais próximo que seja >= Ib e <= Iz
  let recommendedBreaker = STANDARD_BREAKERS.find(
    (b) => b >= ib && b <= cableMaxCurrent,
  );

  if (!recommendedBreaker) {
    // Se não encontrou disjuntor menor que Iz, procura o menor >= Ib
    recommendedBreaker = STANDARD_BREAKERS.find((b) => b >= ib) || 10;
    if (recommendedBreaker > cableMaxCurrent) {
      warnings.push(
        `Atenção: A corrente nominal do disjuntor (${recommendedBreaker}A) excede a capacidade do cabo (${cableMaxCurrent}A). É recomendável subir a bitola do cabo.`,
      );
    }
  }

  // Notas e validações de conformidade NBR 5410
  if (recommendedSection < calculatedSectionDrop) {
    warnings.push(
      `Queda de tensão de ${realDeltaVPercent.toFixed(1)}% ultrapassa o limite configurado de ${maxVoltageDropPercent}%.`,
    );
  }

  if (distance > 40) {
    complianceNotes.push(
      `Circuito longo (${distance}m): A queda de tensão foi o fator determinante para o dimensionamento seguro.`,
    );
  }

  complianceNotes.push(
    `Critério da Capacidade de Corrente: Condutor suporta até ${cableMaxCurrent}A em regime contínuo.`,
  );
  complianceNotes.push(
    `Disjuntor termomagnético recomendado: Curva C (padrão geral) ou B (cargas puramente resistivas) de ${recommendedBreaker}A.`,
  );

  return {
    nominalCurrent: ib,
    voltageDropVolts: realDeltaV,
    voltageDropPercent: realDeltaVPercent,
    calculatedSectionDrop,
    calculatedSectionAmpacity: sectionByAmpacity,
    recommendedSection,
    recommendedBreaker: recommendedBreaker || 10,
    cableMaxCurrent,
    jouleLossWatts,
    isSafe: warnings.length === 0,
    warnings,
    complianceNotes,
  };
}

// ----------------------------------------------------
// 2. DIMENSIONAMENTO DE ELETRODUTOS (Ocupação NBR 5410)
// ----------------------------------------------------

export interface ConduitItem {
  section: number; // Bitola do condutor em mm²
  quantity: number; // Quantidade de cabos dessa bitola
}

export interface ConduitDimensionResult {
  totalCableAreaMm2: number;
  maxOccupationPercent: number; // 53% (1 cabo), 31% (2 cabos) ou 40% (3+ cabos)
  recommendedConduitNominal: string; // Ex: "DN 25 (3/4\")"
  conduitInnerDiameterMm: number;
  conduitInnerAreaMm2: number;
  actualOccupationPercent: number;
  isCompliant: boolean;
  notes: string;
}

// Diâmetro externo total comercial aproximado do condutor isolado PVC 750V (NBR NM 247-3)
const CABLE_EXTERNAL_AREA: Record<number, number> = {
  1.5: 7.1, // ~3.0mm diâmetro
  2.5: 10.2, // ~3.6mm diâmetro
  4.0: 13.9, // ~4.2mm diâmetro
  6.0: 18.1, // ~4.8mm diâmetro
  10.0: 31.2, // ~6.3mm diâmetro
  16.0: 45.4, // ~7.6mm diâmetro
  25.0: 72.4, // ~9.6mm diâmetro
  35.0: 95.0, // ~11.0mm diâmetro
  50.0: 132.7, // ~13.0mm diâmetro
};

// Eletrodutos comerciais de PVC corrugado / rígido
const CONDUIT_SIZES = [
  { name: 'DN 20 (1/2")', innerDiameter: 15.0, innerArea: 176.7 },
  { name: 'DN 25 (3/4")', innerDiameter: 20.0, innerArea: 314.1 },
  { name: 'DN 32 (1")', innerDiameter: 26.0, innerArea: 530.9 },
  { name: 'DN 40 (1.1/4")', innerDiameter: 35.0, innerArea: 962.1 },
  { name: 'DN 50 (1.1/2")', innerDiameter: 44.0, innerArea: 1520.5 },
  { name: 'DN 60 (2")', innerDiameter: 53.0, innerArea: 2206.1 },
];

export function calculateConduitDimension(
  cables: ConduitItem[],
): ConduitDimensionResult {
  let totalCablesCount = 0;
  let totalCableArea = 0;

  for (const item of cables) {
    const unitArea = CABLE_EXTERNAL_AREA[item.section] || 10.2;
    totalCableArea += unitArea * item.quantity;
    totalCablesCount += item.quantity;
  }

  // Taxa de ocupação NBR 5410:
  // 1 condutor = 53% | 2 condutores = 31% | 3 ou mais condutores = 40%
  let maxOccupation = 40;
  if (totalCablesCount === 1) maxOccupation = 53;
  else if (totalCablesCount === 2) maxOccupation = 31;

  // Encontra o menor eletroduto cuja área útil (maxOccupation%) suporte os cabos
  let chosenConduit = CONDUIT_SIZES[CONDUIT_SIZES.length - 1];
  for (const c of CONDUIT_SIZES) {
    const usableArea = (maxOccupation / 100) * c.innerArea;
    if (usableArea >= totalCableArea) {
      chosenConduit = c;
      break;
    }
  }

  const actualPercent = (totalCableArea / chosenConduit.innerArea) * 100;

  return {
    totalCableAreaMm2: totalCableArea,
    maxOccupationPercent: maxOccupation,
    recommendedConduitNominal: chosenConduit.name,
    conduitInnerDiameterMm: chosenConduit.innerDiameter,
    conduitInnerAreaMm2: chosenConduit.innerArea,
    actualOccupationPercent: actualPercent,
    isCompliant: actualPercent <= maxOccupation,
    notes: `NBR 5410: Taxa máxima permitida para ${totalCablesCount} condutores é de ${maxOccupation}%. Ocupação calculada: ${actualPercent.toFixed(1)}%.`,
  };
}

// ----------------------------------------------------
// 3. PREVISÃO DE CARGAS & TUGs / ILUMINAÇÃO (NBR 5410)
// ----------------------------------------------------

export interface RoomLoadInput {
  roomType: 'quarto_sala' | 'cozinha_servico' | 'banheiro' | 'varanda_garagem';
  area: number; // m²
  perimeter: number; // m
}

export interface RoomLoadResult {
  minLightingVA: number;
  minTugsCount: number;
  minTugsTotalVA: number;
  tugsDetails: string;
  lightingDetails: string;
  recommendedTues: string[];
}

export function calculateRoomLoads(input: RoomLoadInput): RoomLoadResult {
  const { roomType, area, perimeter } = input;

  // 1. Iluminação (NBR 5410 item 9.5.2.1)
  // <= 6m²: 100VA
  // > 6m²: 100VA nos primeiros 6m² + 60VA para cada 4m² inteiros acumulados
  let minLightingVA = 100;
  if (area > 6) {
    const extraBlocks = Math.floor((area - 6) / 4);
    minLightingVA = 100 + extraBlocks * 60;
  }

  // 2. Tomadas de Uso Geral - TUGs (NBR 5410 item 9.5.2.2)
  let minTugsCount = 1;
  let minTugsTotalVA = 100;
  let tugsDetails = '';
  let lightingDetails = `Área de ${area.toFixed(1)}m²: Carga mínima de iluminação = ${minLightingVA} VA.`;
  const recommendedTues: string[] = [];

  if (roomType === 'cozinha_servico') {
    // 1 tomada a cada 3,5m de perímetro ou fração
    minTugsCount = Math.max(2, Math.ceil(perimeter / 3.5));
    // Primeiras 3 tomadas = 600VA cada; excedentes = 100VA cada
    if (minTugsCount <= 3) {
      minTugsTotalVA = minTugsCount * 600;
    } else {
      minTugsTotalVA = 3 * 600 + (minTugsCount - 3) * 100;
    }
    tugsDetails = `${minTugsCount} TUGs (espaçamento máx 3,5m). Potência total: ${minTugsTotalVA} VA (área molhada).`;
    recommendedTues.push(
      'Micro-ondas (20A / ~1500W)',
      'Lava-louças (20A / ~2000W)',
      'Forno elétrico / Cooktop',
    );
  } else if (roomType === 'banheiro') {
    minTugsCount = 1;
    minTugsTotalVA = 600; // Pelo menos 1 tomada junto ao lavatório de 600VA
    tugsDetails = `Mínimo 1 TUG de 600 VA junto ao lavatório (fora do volume do boxe).`;
    recommendedTues.push(
      'Chuveiro elétrico dedicado (32A a 50A / 5500W a 7500W)',
    );
  } else if (roomType === 'varanda_garagem') {
    minTugsCount = Math.max(1, Math.ceil(perimeter / 5));
    minTugsTotalVA = minTugsCount * 100;
    tugsDetails = `${minTugsCount} TUGs de 100 VA.`;
    recommendedTues.push('Portão eletrônico', 'Lavadora de alta pressão');
  } else {
    // Quarto / Sala / Escritório
    // Se área <= 6m²: 1 tomada. Se > 6m²: 1 a cada 5m de perímetro ou fração
    if (area <= 6) {
      minTugsCount = 1;
    } else {
      minTugsCount = Math.ceil(perimeter / 5);
    }
    minTugsTotalVA = minTugsCount * 100;
    tugsDetails = `${minTugsCount} TUGs de 100 VA distribuídas a cada 5m de perímetro.`;
    recommendedTues.push('Ar-condicionado Split (10A a 16A dedicado)');
  }

  return {
    minLightingVA,
    minTugsCount,
    minTugsTotalVA,
    tugsDetails,
    lightingDetails,
    recommendedTues,
  };
}
