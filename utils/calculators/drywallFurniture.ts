// utils/calculators/drywallFurniture.ts

export interface FurnitureDimensions {
  width: number; // largura (metros)
  height: number; // altura (metros)
  depth: number; // profundidade (metros)
  shelves?: number; // número de prateleiras internas (0 = sem)
  dividers?: number; // número de divisórias verticais internas (0 = sem)
  hasBase?: boolean; // se tem base (geralmente 0.10m de altura)
  hasDoors?: boolean; // se tem portas (simplifica: portas de abrir)
  doorsQuantity?: number; // quantidade de portas (se tiver, padrão = 2)
  useWoodReinforcement?: boolean;
  boardType?: 'ST' | 'RU' | 'RF';
  profileSize?: 48 | 70 | 90;
}

export interface FurnitureOptions extends FurnitureDimensions {
  boardType?: 'ST' | 'RU' | 'RF';
  profileSize?: 48 | 70 | 90; // para estrutura de reforço (recomendado 70mm)
  useWoodReinforcement?: boolean; // se usa madeira (taco) para prateleiras longas
}

export function calculateFurnitureMaterials({
  width,
  height,
  depth,
  shelves = 0,
  dividers = 0,
  hasBase = true,
  hasDoors = false,
  doorsQuantity = 2,
  boardType = 'ST',
  profileSize = 70,
  useWoodReinforcement = false,
}: FurnitureOptions) {
  const safetyMargin = 1.05;
  const sheetArea = 2.16; // 1.20 x 1.80
  const barLength = 3.0; // perfil de 3m

  // Área total de chapas (m²)
  // Laterais: 2 * (altura * profundidade)
  const sideArea = 2 * (height * depth);

  // Tampo superior e base (se houver base)
  const topArea = width * depth;
  const baseArea = hasBase ? width * depth : 0;

  // Prateleiras: largura x profundidade * (número de prateleiras)
  // A largura da prateleira depende do número de divisórias: cada divisória divide o espaço
  const shelfWidth = width / (dividers + 1);
  const shelvesArea = shelves * (shelfWidth * depth);

  // Divisórias verticais: cada divisória tem área = altura * profundidade
  const dividersArea = dividers * (height * depth);

  // Portas (se houver): cada porta = (largura total / quantidade) * altura
  let doorsArea = 0;
  if (hasDoors && doorsQuantity > 0) {
    const doorWidth = width / doorsQuantity;
    doorsArea = doorsQuantity * (doorWidth * height);
  }

  // Soma total (incluindo portas)
  const totalBoardArea =
    (sideArea + topArea + baseArea + shelvesArea + dividersArea + doorsArea) *
    safetyMargin;

  // Cálculo de perfis de reforço (montantes 70mm)
  // Estrutura: perfil na base, topo, e nas laterais + reforços para prateleiras
  // Usaremos um cálculo simplificado: 4 perfis de altura (laterais + divisórias) + 2 perfis de largura (base/topo)
  // Se tiver prateleiras, adicionamos perfis horizontais no mesmo número.
  let profileLinear = 0;
  // Perfis verticais: laterais (2) + divisórias (dividers)
  const verticalProfiles = 2 + dividers;
  profileLinear += verticalProfiles * height;
  // Perfis horizontais: base, topo, e para cada prateleira (se for usar reforço)
  const horizontalProfiles = 2 + (useWoodReinforcement ? shelves : 0); // se usar madeira, não precisa de perfil
  if (!useWoodReinforcement) {
    profileLinear += horizontalProfiles * width;
  }
  // Se tiver base e topo, já estão incluídos
  // Para prateleiras com madeira, não contamos perfil, mas calculamos madeira separado

  // Perfis (montantes)
  const profilesCount = Math.ceil((profileLinear / barLength) * safetyMargin);

  // Madeira para reforço (taco) - se ativado
  let woodLinear = 0;
  if (useWoodReinforcement) {
    // Cada prateleira ganha um reforço de madeira na frente e no fundo (2x comprimento)
    woodLinear = shelves * width * 2;
    // Também pode-se reforçar a base/topo, mas simplificamos.
  }

  // Ferragens (se tiver portas)
  let hinges = 0;
  let handles = 0;
  if (hasDoors && doorsQuantity > 0) {
    // cada porta usa 2 dobradiças (pode ser 3 para portas altas, mas simplificamos)
    hinges = doorsQuantity * 2;
    handles = doorsQuantity;
  }

  // Parafusos para montagem (estimativa)
  const screwsForAssembly = Math.ceil(
    (totalBoardArea / sheetArea) * 20 * safetyMargin,
  );

  // Parafusos para fixação na parede (se for móvel suspenso, mas não estamos diferenciando)
  const wallScrews = Math.ceil((width / 0.6) * 2 * safetyMargin); // a cada 60cm, 2 pontos

  // Nome da placa
  const boardLabel = {
    ST: 'Placa Drywall ST (1.20x1.80)',
    RU: 'Placa Drywall RU (Umidade) (1.20x1.80)',
    RF: 'Placa Drywall RF (Fogo) (1.20x1.80)',
  }[boardType];

  // Lista de materiais
  const materials = [
    {
      item: boardLabel,
      qtd: Math.ceil(totalBoardArea / sheetArea),
      unit: 'un',
    },
    {
      item: `Perfil Montante ${profileSize}mm (3m)`,
      qtd: profilesCount,
      unit: 'br',
    },
    {
      item: 'Parafuso para Drywall (montagem)',
      qtd: screwsForAssembly,
      unit: 'un',
    },
    {
      item: 'Parafuso / Bucha para parede',
      qtd: wallScrews,
      unit: 'un',
    },
    {
      item: 'Fita Drywall (emendas)',
      qtd: Math.ceil(totalBoardArea * 1.2 * safetyMargin),
      unit: 'm',
    },
    {
      item: 'Massa para Drywall',
      qtd: Number((totalBoardArea * 0.4 * safetyMargin).toFixed(2)),
      unit: 'kg',
    },
  ];

  // Adicionar madeira se usada
  if (useWoodReinforcement && woodLinear > 0) {
    materials.push({
      item: 'Taco de Madeira (para reforço)',
      qtd: Math.ceil(woodLinear * safetyMargin),
      unit: 'm',
    });
  }

  // Ferragens
  if (hasDoors && doorsQuantity > 0) {
    materials.push({
      item: 'Dobradiça para porta',
      qtd: hinges,
      unit: 'un',
    });
    materials.push({
      item: 'Puxador / Maçaneta',
      qtd: handles,
      unit: 'un',
    });
  }

  // Área total (para referência)
  materials.push({
    item: 'Área Total de Chapas',
    qtd: Number(totalBoardArea.toFixed(2)),
    unit: 'm²',
  });

  return materials;
}
