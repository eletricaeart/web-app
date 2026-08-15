/**
 * Cálculo de materiais para paredes de drywall.
 * Recebe TODAS as seções (medidas) de um mesmo serviço de uma vez,
 * soma os metros lineares necessários primeiro, e só então arredonda
 * para barras/chapas fechadas — evitando comprar material a mais
 * (arredondamento repetido por seção) ou a menos (inconsistência entre
 * a contagem de montantes usada para parafusos e a usada para barras).
 */
/**
 * Cálculo de materiais para paredes de drywall.
 */
export interface WallOpening {
  width: number;
  height: number;
}

export interface WallSection {
  wallLength: number;
  wallHeight: number;
  openings?: WallOpening[];
}

export interface WallOptions {
  sections: WallSection[];
  studSpacing?: 0.4 | 0.6; // em metros
  boardType?: 'ST' | 'RU' | 'RF';
  profileSize?: 48 | 70 | 90;
}

export function calculateWallMaterials({
  sections,
  studSpacing = 0.6,
  boardType = 'ST',
  profileSize = 48,
}: WallOptions) {
  const safetyMargin = 1.05;
  const sheetArea = 2.16;
  const barLength = 3.0;

  let totalNetAreaOneSide = 0;
  let totalRunnersLinearMeters = 0;
  let totalStudsCount = 0;
  let totalStudsLinearMeters = 0;
  let maxHeight = 0;

  sections.forEach(({ wallLength, wallHeight, openings = [] }) => {
    const totalOpeningArea = openings.reduce(
      (acc, o) => acc + o.width * o.height,
      0,
    );
    const netAreaOneSide = wallLength * wallHeight - totalOpeningArea;
    totalNetAreaOneSide += netAreaOneSide;

    totalRunnersLinearMeters += wallLength * 2;

    const mainStudsCount = Math.ceil(wallLength / studSpacing) + 1;
    const extraStudsForOpenings = openings.length * 2;
    const sectionStudsCount = mainStudsCount + extraStudsForOpenings;

    totalStudsCount += sectionStudsCount;
    totalStudsLinearMeters += sectionStudsCount * wallHeight;

    if (wallHeight > maxHeight) maxHeight = wallHeight;
  });

  // Margem dinâmica para altura
  let heightLossFactor = 1.05;
  if (maxHeight > 3.0) {
    const extra = Math.ceil((maxHeight - 3.0) / 0.5) * 0.05;
    heightLossFactor = 1.05 + extra;
  }

  const totalBoardArea = totalNetAreaOneSide * 2;

  const runnersCount = Math.ceil(
    (totalRunnersLinearMeters / barLength) * safetyMargin,
  );
  const studsBarsCount = Math.ceil(
    (totalStudsLinearMeters / barLength) * heightLossFactor, // usa fator dinâmico
  );

  // Mapeamento de tipo de chapa
  const boardLabel = {
    ST: 'Placa Drywall ST (1.20x1.80)',
    RU: 'Placa Drywall RU (Umidade) (1.20x1.80)',
    RF: 'Placa Drywall RF (Fogo) (1.20x1.80)',
  }[boardType];

  const profileLabel = `Guia ${profileSize}mm (3m)`;
  const studLabel = `Montante ${profileSize}mm (3m)`;

  // Fita banda acústica
  const acousticTape = totalRunnersLinearMeters;

  return [
    {
      item: boardLabel,
      qtd: Math.ceil((totalBoardArea / sheetArea) * safetyMargin),
      unit: 'un',
    },
    { item: profileLabel, qtd: runnersCount, unit: 'br' },
    { item: studLabel, qtd: studsBarsCount, unit: 'br' },
    {
      item: 'Parafuso GN25 (Gesso)',
      qtd: Math.ceil((totalBoardArea / sheetArea) * 30 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso LB 9,5 (ponta broca)',
      qtd: Math.ceil(totalStudsCount * 4 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso / Bucha n°6',
      qtd: Math.ceil((totalRunnersLinearMeters / 0.6) * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Fita Drywall',
      qtd: Math.ceil(totalBoardArea * 1.5 * safetyMargin),
      unit: 'm',
    },
    {
      item: 'Fita Banda Acústica',
      qtd: Math.ceil(acousticTape * safetyMargin),
      unit: 'm',
    },
    {
      item: 'Massa p/ Drywall',
      qtd: Number((totalBoardArea * 0.5 * safetyMargin).toFixed(2)),
      unit: 'kg',
    },
    {
      item: 'Área Total (Líquida)',
      qtd: Number(totalNetAreaOneSide.toFixed(2)),
      unit: 'm²',
    },
  ];
}
