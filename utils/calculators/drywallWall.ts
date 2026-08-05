/**
 * Cálculo de materiais para paredes de drywall.
 * Recebe TODAS as seções (medidas) de um mesmo serviço de uma vez,
 * soma os metros lineares necessários primeiro, e só então arredonda
 * para barras/chapas fechadas — evitando comprar material a mais
 * (arredondamento repetido por seção) ou a menos (inconsistência entre
 * a contagem de montantes usada para parafusos e a usada para barras).
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
  studSpacing?: number;
}

export function calculateWallMaterials({
  sections,
  studSpacing = 0.6,
}: WallOptions) {
  const safetyMargin = 1.05; // 5% de margem
  const sheetArea = 2.16; // Placa 1.20m x 1.80m
  const barLength = 3.0; // Perfil padrão 3m

  let totalNetAreaOneSide = 0;
  let totalRunnersLinearMeters = 0; // guia superior + inferior de cada seção
  let totalStudsCount = 0; // usado para parafusos (não depende da altura)
  let totalStudsLinearMeters = 0; // usado para barras de montante (depende da altura de cada seção)

  sections.forEach(({ wallLength, wallHeight, openings = [] }) => {
    const totalOpeningArea = openings.reduce(
      (acc, o) => acc + o.width * o.height,
      0,
    );
    const netAreaOneSide = wallLength * wallHeight - totalOpeningArea;
    totalNetAreaOneSide += netAreaOneSide;

    // Guia: uma linha no piso + uma no teto, ao longo do comprimento da seção
    totalRunnersLinearMeters += wallLength * 2;

    // Montantes: um a cada "studSpacing" metros ao longo do comprimento,
    // + 2 montantes extras por abertura (emoldurar porta/janela)
    const mainStudsCount = Math.ceil(wallLength / studSpacing) + 1;
    const extraStudsForOpenings = openings.length * 2;
    const sectionStudsCount = mainStudsCount + extraStudsForOpenings;

    totalStudsCount += sectionStudsCount;
    totalStudsLinearMeters += sectionStudsCount * wallHeight;
  });

  const totalBoardArea = totalNetAreaOneSide * 2; // duas faces da parede

  const runnersCount = Math.ceil(
    (totalRunnersLinearMeters / barLength) * safetyMargin,
  );
  const studsBarsCount = Math.ceil(
    (totalStudsLinearMeters / barLength) * safetyMargin,
  );

  return [
    {
      item: 'Placa Drywall ST (1.20x1.80)',
      qtd: Math.ceil((totalBoardArea / sheetArea) * safetyMargin),
      unit: 'un',
    },
    { item: 'Guia 48mm (3m)', qtd: runnersCount, unit: 'br' },
    { item: 'Montante 48mm (3m)', qtd: studsBarsCount, unit: 'br' },
    {
      item: 'Parafuso GN25 (Gesso)',
      qtd: Math.ceil((totalBoardArea / sheetArea) * 30 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso Lentilha (Metal)',
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
      item: 'Massa p/ Drywall',
      qtd: Number((totalBoardArea * 0.5 * safetyMargin).toFixed(2)),
      unit: 'kg',
    },
    {
      item: 'Área Total (Liquida)',
      qtd: Number(totalNetAreaOneSide.toFixed(2)),
      unit: 'm²',
    },
  ];
}
