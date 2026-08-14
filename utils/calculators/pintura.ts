// utils/calculators/pintura.ts
/**
 * Motor de cálculo de tintas, seladores, massa corrida e vernizes
 * Baseado nos rendimentos reais e normas de fabricantes de tintas (Suvinil, Coral, Sherwin-Williams).
 */

export interface PaintCalculationInput {
  wallWidth?: number; // Largura em m
  wallLength?: number; // Comprimento em m
  wallHeight?: number; // Altura / Pé direito em m
  directWallArea?: number; // Ou área direta em m²
  includeCeiling?: boolean;
  doorsCount?: number; // Portas padrão (0.80 x 2.10m = 1.68m² cada)
  windowsCount?: number; // Janelas padrão (1.20 x 1.20m = 1.44m² cada)
  customDiscountArea?: number; // Outros vãos em m²
  paintType:
    | 'acrilica_premium'
    | 'acrilica_standard'
    | 'latex_pva'
    | 'esmalte'
    | 'epoxi';
  surfaceType:
    'repintura_lisa' | 'alvenaria_nova' | 'gesso_drywall' | 'reboco_poroso';
  coats: number; // Número de demãos (1, 2 ou 3)
  wasteMarginPercent?: number; // Margem de perda (ex: 10%)
  includePrimer?: boolean; // Selador / Fundo Preparador
  includeSpaklingPaste?: boolean; // Massa corrida / Acrílica
}

export interface PaintCalculationResult {
  grossAreaM2: number; // Área bruta de paredes + teto
  openingsDiscountM2: number; // Total descontado em portas/janelas
  netAreaM2: number; // Área líquida a ser pintada (m²)
  totalAreaWithCoatsM2: number; // Área total acumulada pelas demãos
  paintYieldPerLiter: number; // Rendimento por litro da tinta escolhida (m²/L por demão)
  totalLitersNeeded: number; // Litros totais com margem de segurança
  cans18L: number; // Latas grandes de 18 Litros
  gallons3_6L: number; // Galões de 3,6 Litros
  quarts900mL: number; // Quartos de 900 mL (0,9L)
  primerLitersNeeded: number; // Litros de Fundo Preparador / Selador
  spaklingPasteKgNeeded: number; // Kg de Massa corrida necessários
  spaklingPasteCans25Kg: number; // Latas/Baldes de 25kg de massa
  recommendations: string[];
}

// Rendimento médio por litro (m²/L por demão)
const PAINT_YIELDS: Record<string, number> = {
  acrilica_premium: 12.0, // Ex: Suvinil Toque de Seda / Coral Decora
  acrilica_standard: 9.0, // Ex: Rende Muito / Fosco Completo
  latex_pva: 8.0, // Tinta PVA para interiores
  esmalte: 14.0, // Esmalte Sintético Base Água / Solvente
  epoxi: 10.0, // Tinta Epóxi base água/solvente
};

// Fator de absorção da superfície (reduz rendimento se for muito poroso)
const SURFACE_FACTOR: Record<string, number> = {
  repintura_lisa: 1.0,
  alvenaria_nova: 0.85,
  gesso_drywall: 0.9,
  reboco_poroso: 0.75,
};

export function calculatePaint(
  input: PaintCalculationInput,
): PaintCalculationResult {
  const {
    wallWidth = 0,
    wallLength = 0,
    wallHeight = 0,
    directWallArea = 0,
    includeCeiling = false,
    doorsCount = 0,
    windowsCount = 0,
    customDiscountArea = 0,
    paintType = 'acrilica_premium',
    surfaceType = 'repintura_lisa',
    coats = 2,
    wasteMarginPercent = 10,
    includePrimer = false,
    includeSpaklingPaste = false,
  } = input;

  // 1. Cálculo da Área Bruta
  let wallsArea = 0;
  let ceilingArea = 0;

  if (directWallArea > 0) {
    wallsArea = directWallArea;
  } else if (wallWidth > 0 && wallLength > 0 && wallHeight > 0) {
    // 2 * (L + C) * H
    wallsArea = 2 * (wallWidth + wallLength) * wallHeight;
    if (includeCeiling) {
      ceilingArea = wallWidth * wallLength;
    }
  }

  const grossAreaM2 = wallsArea + ceilingArea;

  // 2. Descontos de vãos (Portas = 1.68m², Janelas = 1.44m²)
  const openingsDiscountM2 =
    doorsCount * 1.68 + windowsCount * 1.44 + customDiscountArea;
  const netAreaM2 = Math.max(0, grossAreaM2 - openingsDiscountM2);

  // 3. Rendimento e Demãos
  const baseYield = PAINT_YIELDS[paintType] || 10.0;
  const surfaceMultiplier = SURFACE_FACTOR[surfaceType] || 1.0;
  const effectiveYieldPerLiter = baseYield * surfaceMultiplier;

  // Litros líquidos necessários = (Área líquida * Demãos) / Rendimento efetivo
  const totalAreaWithCoatsM2 = netAreaM2 * coats;
  const netLiters = totalAreaWithCoatsM2 / effectiveYieldPerLiter;

  // Adiciona margem de perda/desperdício
  const marginMultiplier = 1 + wasteMarginPercent / 100;
  const totalLitersNeeded = netLiters * marginMultiplier;

  // 4. Otimização das Embalagens Comerciais (18L, 3.6L, 0.9L)
  let remainingLiters = totalLitersNeeded;

  let cans18L = 0;
  let gallons3_6L = 0;
  let quarts900mL = 0;

  if (remainingLiters >= 14.4) {
    // Se passar de ~14.4L, já compensa comprar uma lata de 18L (custo-benefício)
    cans18L = Math.floor(remainingLiters / 18);
    const mod = remainingLiters % 18;
    if (mod > 12) {
      cans18L += 1;
      remainingLiters = 0;
    } else {
      remainingLiters = mod;
    }
  }

  if (remainingLiters > 0) {
    gallons3_6L = Math.floor(remainingLiters / 3.6);
    const modGal = remainingLiters % 3.6;
    if (modGal > 2.7) {
      gallons3_6L += 1;
      remainingLiters = 0;
    } else {
      remainingLiters = modGal;
    }
  }

  if (remainingLiters > 0) {
    quarts900mL = Math.ceil(remainingLiters / 0.9);
  }

  // 5. Selador / Fundo Preparador (Rendimento ~10 m²/L em 1 demão)
  let primerLitersNeeded = 0;
  if (includePrimer) {
    primerLitersNeeded = (netAreaM2 / 10.0) * marginMultiplier;
  }

  // 6. Massa Corrida / Acrílica (Consumo médio ~0.55 kg/m² para 2 demãos de acabamento liso)
  let spaklingPasteKgNeeded = 0;
  let spaklingPasteCans25Kg = 0;
  if (includeSpaklingPaste) {
    spaklingPasteKgNeeded = netAreaM2 * 0.55 * marginMultiplier;
    spaklingPasteCans25Kg = Math.ceil(spaklingPasteKgNeeded / 25);
  }

  // 7. Recomendações Profissionais
  const recommendations: string[] = [];
  if (surfaceType === 'gesso_drywall' || surfaceType === 'alvenaria_nova') {
    recommendations.push(
      'Superfície nova ou de gesso: Aplique 1 demão de Fundo Preparador para evitar descascamento e uniformizar a absorção.',
    );
  }
  if (coats < 2 && paintType !== 'esmalte') {
    recommendations.push(
      'Recomenda-se no mínimo 2 demãos cruzadas para obter cobertura uniforme e lavabilidade adequada.',
    );
  }
  recommendations.push(
    `Tempo de secagem recomendado: 2h ao toque, 4h a 6h entre demãos, e 12h para secagem final.`,
  );

  return {
    grossAreaM2,
    openingsDiscountM2,
    netAreaM2,
    totalAreaWithCoatsM2,
    paintYieldPerLiter: effectiveYieldPerLiter,
    totalLitersNeeded,
    cans18L,
    gallons3_6L,
    quarts900mL,
    primerLitersNeeded,
    spaklingPasteKgNeeded,
    spaklingPasteCans25Kg,
    recommendations,
  };
}
