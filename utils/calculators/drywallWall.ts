/**
 * Lógica baseada no arquivo original calculateWall.js
 */
export interface WallOptions {
  wallLength: number;
  wallHeight: number;
  openings?: { width: number; height: number }[];
  studSpacing?: number;
}

export function calculateWallMaterials({
  wallLength,
  wallHeight,
  openings = [],
  studSpacing = 0.6,
}: WallOptions) {
  const safetyMargin = 1.05; // 5% de margem
  const sheetArea = 2.16; // Placa 1.20m x 1.80m
  const barLength = 3.0; // Perfil padrão 3m

  // 1. Cálculos de Área
  let totalOpeningArea = 0;
  openings.forEach((op) => {
    totalOpeningArea += op.width * op.height;
  });

  const netAreaOneSide = wallLength * wallHeight - totalOpeningArea;
  const totalBoardArea = netAreaOneSide * 2; // Duas faces da parede

  // 2. Cálculos de Estrutura Metálica
  const runnersCount =
    (wallLength * 2) % 3 === 0
      ? (wallLength * 2) / 3
      : Math.ceil(((wallLength * 2) / 3) * safetyMargin);

  const mainStudsCount = Math.ceil(wallLength / studSpacing) + 1;
  const extraStudsForOpenings = openings.length * 2;
  const totalStudsCount = Math.ceil(
    (mainStudsCount + extraStudsForOpenings) * safetyMargin,
  );

  return [
    {
      item: "Placa Drywall ST (1.20x1.80)",
      qtd: Math.ceil((totalBoardArea / sheetArea) * safetyMargin),
      unit: "un",
    },
    { item: "Guia 48mm (3m)", qtd: runnersCount, unit: "br" },
    {
      item: "Montante 48mm (3m)",
      qtd: Math.ceil(
        (((Math.ceil(wallLength / 0.6) + 1) * wallHeight) / 3) * safetyMargin,
      ),
      unit: "br",
    },
    {
      item: "Parafuso GN25 (Gesso)",
      qtd: Math.ceil((totalBoardArea / sheetArea) * 30 * safetyMargin),
      unit: "un",
    },
    {
      item: "Parafuso Lentilha (Metal)",
      qtd: Math.ceil(totalStudsCount * 4 * safetyMargin),
      unit: "un",
    },
    {
      item: "Parafuso / Bucha n°6",
      qtd: Math.ceil(((wallLength * 2) / 0.6) * safetyMargin),
      unit: "un",
    },
    {
      item: "Fita Drywall",
      qtd: Math.ceil(totalBoardArea * 1.5 * safetyMargin),
      unit: "m",
    },
    {
      item: "Massa p/ Drywall",
      qtd: Number((totalBoardArea * 0.5 * safetyMargin).toFixed(2)),
      unit: "kg",
    },
    {
      item: "Área Total (Liquida)",
      qtd: Number(netAreaOneSide.toFixed(2)),
      unit: "m²",
    },
  ];
}
