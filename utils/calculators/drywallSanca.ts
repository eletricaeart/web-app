// utils/calculators/drywallSanca.ts
export interface SancaOptions {
  perimeter: number;
  height: number;
  boardType?: 'ST' | 'RU' | 'RF';
}

export function calculateSancaMaterials({
  perimeter,
  height,
  boardType = 'ST',
}: SancaOptions) {
  const safetyMargin = 1.05;
  const sheetArea = 2.16;
  const barLength = 3.0;

  const area = perimeter * height;

  const runnersLinear = perimeter * 2;
  const studsCount = Math.ceil(perimeter / 0.6) + 1;
  const studsLinear = studsCount * height;

  const boardLabel = {
    ST: 'Placa Drywall ST (1.20x1.80)',
    RU: 'Placa Drywall RU (Umidade) (1.20x1.80)',
    RF: 'Placa Drywall RF (Fogo) (1.20x1.80)',
  }[boardType];

  return [
    {
      item: boardLabel,
      qtd: Math.ceil((area / sheetArea) * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Guia 48mm (3m)',
      qtd: Math.ceil((runnersLinear / barLength) * safetyMargin),
      unit: 'br',
    },
    {
      item: 'Montante 48mm (3m)',
      qtd: Math.ceil((studsLinear / barLength) * safetyMargin),
      unit: 'br',
    },
    {
      item: 'Parafuso GN25', // Nome padronizado
      qtd: Math.ceil((area / sheetArea) * 30 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso LB 9,5 (ponta broca)',
      qtd: Math.ceil(studsCount * 4 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso / Bucha n°6',
      qtd: Math.ceil((runnersLinear / 0.6) * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Fita Drywall',
      qtd: Math.ceil(area * 1.5 * safetyMargin),
      unit: 'm',
    },
    {
      item: 'Massa p/ Drywall',
      qtd: Number((area * 0.5 * safetyMargin).toFixed(2)),
      unit: 'kg',
    },
    { item: 'Área Total', qtd: Number(area.toFixed(2)), unit: 'm²' },
  ];
}
