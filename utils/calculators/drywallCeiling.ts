/**
 * Cálculo de materiais para forros de drywall.
 * Mesma lógica de consolidação: soma todas as seções do serviço
 * primeiro, arredonda uma vez só no final.
 */
export interface CeilingSection {
  width: number;
  length: number;
}

export interface CeilingOptions {
  sections: CeilingSection[];
  boardType?: 'ST' | 'RU' | 'RF';
}

export function calculateCeilingMaterials({
  sections,
  boardType = 'ST',
}: CeilingOptions) {
  const safetyMargin = 1.05;
  let totalArea = 0;
  let totalPerimeter = 0;
  let totalF530LinearMeters = 0;

  sections.forEach(({ width, length }) => {
    const area = width * length;
    const perimeter = (width + length) * 2;
    totalArea += area;
    totalPerimeter += perimeter;

    const menorLado = Math.min(width, length);
    const maiorLado = Math.max(width, length);
    const espacamento = 0.6;
    const numLinhas = Math.ceil(maiorLado / espacamento) + 1;
    totalF530LinearMeters += numLinhas * menorLado;
  });

  const boardLabel = {
    ST: 'Placa Drywall ST (1.20x1.80)',
    RU: 'Placa Drywall RU (Umidade) (1.20x1.80)',
    RF: 'Placa Drywall RF (Fogo) (1.20x1.80)',
  }[boardType];

  const totalF530Bars = Math.ceil((totalF530LinearMeters / 3) * safetyMargin);
  const emendasF530 = Math.ceil(totalF530Bars * 0.2);

  return [
    {
      item: boardLabel,
      qtd: Math.ceil((totalArea / 2.16) * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Tabica Metálica (3m)',
      qtd: Math.ceil((totalPerimeter / 3) * safetyMargin),
      unit: 'br',
    },
    {
      item: 'Perfil Canaleta F530 (3m)',
      qtd: Math.ceil((totalF530LinearMeters / 3) * safetyMargin),
      unit: 'br',
    },
    {
      item: 'Emenda para Perfil F530',
      qtd: emendasF530,
      unit: 'un',
    },
    {
      item: 'Regulador / Tirante',
      qtd: Math.ceil(totalArea * 1.2 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso GN25', // Nome padronizado
      qtd: Math.ceil(totalArea * 25 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso LB 9,5 (ponta broca)',
      qtd: Math.ceil(totalArea * 8 * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Parafuso / Bucha p/ Tabica',
      qtd: Math.ceil((totalPerimeter / 0.6) * safetyMargin),
      unit: 'un',
    },
    {
      item: 'Fita Telada',
      qtd: Math.ceil(totalArea * 1.5 * safetyMargin),
      unit: 'm',
    },
    {
      item: 'Massa p/ Drywall',
      qtd: Number((totalArea * 0.5 * safetyMargin).toFixed(2)),
      unit: 'kg',
    },
    { item: 'Área Total', qtd: Number(totalArea.toFixed(2)), unit: 'm²' },
  ];
}
