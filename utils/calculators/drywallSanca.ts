// utils/calculators/drywallSanca.ts
export interface SancaOptions {
  perimeter: number; // metros lineares
  height: number; // altura da sanca (metros)
  boardType?: 'ST' | 'RU' | 'RF';
}

export function calculateSancaMaterials({
  perimeter,
  height,
  boardType = 'ST',
}: SancaOptions) {
  const safetyMargin = 1.05;
  const sheetArea = 2.16; // 1.20 x 1.80
  const barLength = 3.0;

  // Área de placas (considerando apenas a face vertical da sanca)
  const area = perimeter * height;

  // Estimativa de perfis: usa-se perfil U (guia) e montante, similar a parede, mas em menor escala
  // Para sanca, normalmente usa-se perfil 48mm, mas pode ser adaptado.
  // Vamos simplificar: guias = 2 * perímetro (superior e inferior), montantes = a cada 0.6m
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
      item: 'Parafuso GN25 (Gesso)',
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
