/**
 * Lógica baseada no arquivo original calculateCeiling.js
 */
export interface CeilingOptions {
  width: number;
  length: number;
}

export function calculateCeilingMaterials({ width, length }: CeilingOptions) {
  const area = width * length;
  const perimeter = (width + length) * 2;
  const safetyMargin = 1.05; // 5%
  const menorLado = Math.min(width, length);
  const maiorLado = Math.max(width, length);

  const f530Profiles = (() => {
    const espacamento = 0.6;
    const numLinhas = Math.ceil(maiorLado / espacamento) + 1;
    const metrosLineares = numLinhas * menorLado;
    return Math.ceil((metrosLineares / 3) * safetyMargin);
  })();

  return [
    {
      item: "Placa Drywall ST (1.20x1.80)",
      qtd: Math.ceil((area / 2.16) * safetyMargin),
      unit: "un",
    },
    {
      item: "Tabica Metálica (3m)",
      qtd: Math.ceil((perimeter / 3) * safetyMargin),
      unit: "br",
    },
    { item: "Perfil Canaleta F530 (3m)", qtd: f530Profiles, unit: "br" },
    { item: "Regulador / Tirante", qtd: Math.ceil(area * 2), unit: "un" },
    {
      item: "Parafuso GN25",
      qtd: Math.ceil(area * 25 * safetyMargin),
      unit: "un",
    },
    {
      item: "Parafuso Lentilha",
      qtd: Math.ceil(area * 8 * safetyMargin),
      unit: "un",
    },
    {
      item: "Parafuso / Bucha p/ Tabica",
      qtd: Math.ceil((perimeter / 0.6) * safetyMargin),
      unit: "un",
    },
    {
      item: "Fita Telada",
      qtd: Math.ceil(area * 1.5 * safetyMargin),
      unit: "m",
    },
    {
      item: "Massa p/ Drywall",
      qtd: Number((area * 0.5 * safetyMargin).toFixed(2)),
      unit: "kg",
    },
    { item: "Área Total", qtd: Number(area.toFixed(2)), unit: "m²" },
  ];
}
