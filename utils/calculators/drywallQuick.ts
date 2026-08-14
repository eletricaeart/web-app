// utils/calculators/drywallQuick.ts
/**
 * Motor de Cálculo Rápido e Preciso de Drywall (Paredes W111/W112 e Forros F530)
 * Baseado na ABNT NBR 15758 e manuais técnicos de fabricantes (Placo, Knauf, Gypsum).
 */

export interface DrywallWallInput {
  wallLength: number; // Comprimento em m
  wallHeight: number; // Altura / Pé direito em m
  structureType: 'W111_simples' | 'W112_dupla'; // W111 (1 chapa cada lado) | W112 (2 chapas cada lado)
  studSpacing: 400 | 600; // Espaçamento entre montantes em mm (400mm para áreas úmidas/revestimento cerâmico, 600mm padrão)
  studWidth: 48 | 70 | 90; // Perfil 48mm, 70mm ou 90mm
  boardType: 'ST' | 'RU' | 'RF'; // ST (Standard), RU (Resistente Umidade/Verde), RF (Resistente Fogo/Rosa)
  boardSize: '1.20x1.80' | '1.20x2.40';
  includeInsulation: boolean; // Lã de vidro ou rocha
  doorsCount?: number;
  wasteMarginPercent?: number; // Ex: 10%
}

export interface DrywallWallResult {
  areaM2: number;
  perimeterM: number;
  boardsCount: number; // Quantidade de chapas
  guidesCount: number; // Guias (3m cada) - piso e teto
  studsCount: number; // Montantes verticais (3m cada)
  screwsGN25: number; // Parafusos para fixar 1ª camada de chapa
  screwsGN35?: number; // Parafusos para fixar 2ª camada de chapa (se W112)
  screwsLB9_5: number; // Parafusos ponta broca metal-metal (guia/montante)
  jointTapeMeters: number; // Fita de papel microperfurada para juntas (m)
  jointCompoundKg: number; // Massa de acabamento para juntas (kg)
  acousticBandMeters: number; // Fita banda acústica para guias de piso/teto (m)
  insulationM2?: number; // Lã de vidro/rocha (m²)
  technicalSpecs: string[];
}

export interface DrywallCeilingInput {
  roomWidth: number; // Largura em m
  roomLength: number; // Comprimento em m
  boardType: 'ST' | 'RU' | 'RF';
  boardSize: '1.20x1.80' | '1.20x2.40';
  profileSpacing: 500 | 600; // Espaçamento canaleta F530 (500mm ou 600mm)
  wasteMarginPercent?: number;
}

export interface DrywallCeilingResult {
  areaM2: number;
  perimeterM: number;
  boardsCount: number;
  f530ProfilesCount: number; // Canaletas F530 (3m cada)
  perimeterProfilesCount: number; // Cantoneiras / Tabicas perimetrais (3m cada)
  hangersWithRodCount: number; // Tirantes galvanizados com reguladores de nível
  screwsGN25: number;
  screwsLB9_5: number;
  jointTapeMeters: number;
  jointCompoundKg: number;
  technicalSpecs: string[];
}

export function calculateDrywallWall(
  input: DrywallWallInput,
): DrywallWallResult {
  const {
    wallLength,
    wallHeight,
    structureType = 'W111_simples',
    studSpacing = 600,
    studWidth = 70,
    boardType = 'ST',
    boardSize = '1.20x1.80',
    includeInsulation = false,
    doorsCount = 0,
    wasteMarginPercent = 10,
  } = input;

  const areaM2 = wallLength * wallHeight;
  const perimeterM = 2 * (wallLength + wallHeight);
  const margin = 1 + wasteMarginPercent / 100;

  // Área por chapa: 1.20x1.80 = 2.16m² | 1.20x2.40 = 2.88m²
  const boardArea = boardSize === '1.20x2.40' ? 2.88 : 2.16;

  // Quantidade de faces de chapa (W111 = 2 faces; W112 = 4 faces)
  const facesMultiplier = structureType === 'W112_dupla' ? 4 : 2;
  const totalBoardAreaRequired = areaM2 * facesMultiplier * margin;
  const boardsCount = Math.ceil(totalBoardAreaRequired / boardArea);

  // Guias (instaladas no piso e teto): comprimento = 2 * wallLength
  // Cada perfil de guia tem 3 metros
  const guidesLinearMeters = wallLength * 2 * margin;
  const guidesCount = Math.ceil(guidesLinearMeters / 3.0);

  // Montantes verticais:
  // Quantidade = (Comprimento / espaçamento) + 1 montante inicial + reforços de porta
  const spacingMeters = studSpacing / 1000;
  const baseStuds = Math.ceil(wallLength / spacingMeters) + 1;
  const doorReinforcementStuds = doorsCount * 2;
  const totalStudsNeeded = Math.ceil(
    (baseStuds + doorReinforcementStuds) * margin,
  );

  // Se a parede for mais alta que 3m, precisa de extensão de montante
  const heightMultiplier = Math.ceil(wallHeight / 3.0);
  const studsCount = totalStudsNeeded * heightMultiplier;

  // Parafusos GN 25 (chapa em metal): média de 12 parafusos por m² por camada
  const screwsGN25 = Math.ceil(areaM2 * 2 * 12 * margin);
  let screwsGN35: number | undefined = undefined;
  if (structureType === 'W112_dupla') {
    screwsGN35 = Math.ceil(areaM2 * 2 * 12 * margin);
  }

  // Parafusos LB 9,5 (metal-metal para fixar montante na guia): 4 por montante
  const screwsLB9_5 = Math.ceil(studsCount * 4 * margin);

  // Fita de papel microperfurada para juntas: média de 1.6m de fita por m² de parede
  const jointTapeMeters = Math.ceil(areaM2 * 2 * 1.6 * margin);

  // Massa de rejunte/acabamento: ~0.45 kg por m² por face de chapa
  const jointCompoundKg = Math.ceil(areaM2 * 2 * 0.45 * margin);

  // Fita banda acústica emborrachada para amortecimento acústico das guias
  const acousticBandMeters = Math.ceil(wallLength * 2);

  // Isolamento em Lã mineral
  const insulationM2 = includeInsulation
    ? Math.ceil(areaM2 * margin)
    : undefined;

  const technicalSpecs = [
    `Sistema estrutural: Parede ${structureType === 'W112_dupla' ? 'W112 (Chapa dupla)' : 'W111 (Chapa simples)'} com perfis de ${studWidth}mm.`,
    `Espaçamento dos montantes: A cada ${studSpacing}mm ${studSpacing === 400 ? '(Ideal para cerâmica/áreas molhadas)' : '(Padrão residencial)'}.`,
    `Chapas recomendadas: Placas ${boardType} (${boardType === 'RU' ? 'Verde / Resistente à Umidade' : boardType === 'RF' ? 'Rosa / Resistente ao Fogo' : 'Standard / Áreas Secas'}) de ${boardSize}m.`,
    `Tratamento de juntas: Aplicação de fita microperfurada com no mínimo 2 a 3 demãos de massa para nivelamento perfeito Q3/Q4.`,
  ];

  return {
    areaM2,
    perimeterM,
    boardsCount,
    guidesCount,
    studsCount,
    screwsGN25,
    screwsGN35,
    screwsLB9_5,
    jointTapeMeters,
    jointCompoundKg,
    acousticBandMeters,
    insulationM2,
    technicalSpecs,
  };
}

export function calculateDrywallCeiling(
  input: DrywallCeilingInput,
): DrywallCeilingResult {
  const {
    roomWidth,
    roomLength,
    boardType = 'ST',
    boardSize = '1.20x1.80',
    profileSpacing = 500,
    wasteMarginPercent = 10,
  } = input;

  const areaM2 = roomWidth * roomLength;
  const perimeterM = 2 * (roomWidth + roomLength);
  const margin = 1 + wasteMarginPercent / 100;

  // Área por chapa
  const boardArea = boardSize === '1.20x2.40' ? 2.88 : 2.16;
  const boardsCount = Math.ceil((areaM2 * margin) / boardArea);

  // Perfis F530 (Canaletas a cada 50cm ou 60cm):
  // Comprimento linear total de perfil = (Largura / espaçamento) * Comprimento
  const spacingMeters = profileSpacing / 1000;
  const linesCount = Math.ceil(roomWidth / spacingMeters);
  const totalLinearF530 = linesCount * roomLength * margin;
  const f530ProfilesCount = Math.ceil(totalLinearF530 / 3.0);

  // Cantoneiras ou Tabicas perimetrais (Perímetro / 3m)
  const perimeterProfilesCount = Math.ceil((perimeterM * margin) / 3.0);

  // Tirantes galvanizados com regulador de nível (1 ponto a cada 1,20m ao longo de cada perfil F530)
  const pointsPerLine = Math.ceil(roomLength / 1.2) + 1;
  const hangersWithRodCount = Math.ceil(linesCount * pointsPerLine * margin);

  // Parafusos GN 25 para fixação no teto: ~15 por m²
  const screwsGN25 = Math.ceil(areaM2 * 15 * margin);

  // Parafusos LB 9,5: fixação nos perfis e emendas
  const screwsLB9_5 = Math.ceil(f530ProfilesCount * 4 * margin);

  // Fita e Massa
  const jointTapeMeters = Math.ceil(areaM2 * 1.5 * margin);
  const jointCompoundKg = Math.ceil(areaM2 * 0.4 * margin);

  const technicalSpecs = [
    `Forro estruturado F530 com suspensão por tirante e regulador a cada 1,20m.`,
    `Canaletas F530 instaladas no sentido transversal à fixação das placas com espaçamento de ${profileSpacing}mm.`,
    `Utilizar junta de dilatação ou tabica metálica perimetral para absorver movimentações da laje/telhado e evitar trincas.`,
  ];

  return {
    areaM2,
    perimeterM,
    boardsCount,
    f530ProfilesCount,
    perimeterProfilesCount,
    hangersWithRodCount,
    screwsGN25,
    screwsLB9_5,
    jointTapeMeters,
    jointCompoundKg,
    technicalSpecs,
  };
}
