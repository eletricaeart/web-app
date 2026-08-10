// lib/types/investment.ts

export type ServiceCategoryType =
  'eletrica' | 'pintura' | 'drywall' | 'serralheria' | 'outros';

export const SERVICE_CATEGORIES: { id: ServiceCategoryType; label: string }[] =
  [
    { id: 'eletrica', label: 'Elétrica' },
    { id: 'pintura', label: 'Pintura' },
    { id: 'drywall', label: 'Drywall' },
    { id: 'serralheria', label: 'Serralheria' },
    { id: 'outros', label: 'Outros Serviços' },
  ];

export interface SubClauseItem {
  id: string;
  title: string;
  description?: string;
  value?: number;
}

export interface CategoryBreakdown {
  id: string;
  category: ServiceCategoryType;
  categoryLabel: string;
  description?: string; // Texto descritivo/escopo deste serviço específico
  laborValue: number; // Mão de Obra
  materialsValue: number; // Materiais
  totalValue: number; // laborValue + materialsValue
  executionTeam?: 'propria' | 'terceirizada';
  subClauses?: SubClauseItem[]; // Sub-cláusulas ou itens detalhados
}

export interface BudgetFinancialsV2 {
  schemaVersion: 2;
  categories: CategoryBreakdown[];
  totalLabor: number;
  totalMaterials: number;
  grandTotal: number;
  paymentConditions?: string;
  validityDays?: number;
  generalNotes?: string;
}

// Interfaces legadas (v1) para manter compatibilidade total
export interface InvestmentItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
}

export interface InvestmentCategory {
  id: string;
  name: string;
  title: string;
  description?: string;
  mode: 'fixed' | 'items';
  fixedValue: number;
  items: InvestmentItem[];
  discount?: number;
  paymentSplit?: {
    enabled: boolean;
    entryPercent: number;
  };
}

export function getCategoryGrossValue(c: InvestmentCategory): number {
  if (!c) return 0;
  if (c.mode === 'fixed') return c.fixedValue || 0;
  return (c.items || []).reduce(
    (acc, it) => acc + (it.quantity || 0) * (it.unitValue || 0),
    0,
  );
}

export function getCategoryNetValue(c: InvestmentCategory): number {
  const gross = getCategoryGrossValue(c);
  return Math.max(0, gross - (c.discount || 0));
}

export function getInvestmentTotal(categories: InvestmentCategory[]): number {
  if (!Array.isArray(categories)) return 0;
  return categories.reduce((acc, c) => acc + getCategoryNetValue(c), 0);
}

export interface NormalizedBudgetTotals {
  isV2: boolean;
  totalLabor: number;
  totalMaterials: number;
  grandTotal: number;
  categoriesCount: number;
  categoriesList: string[];
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

export function parseCurrencyToNumber(value: any): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value || typeof value !== 'string') return 0;

  const clean = value
    .replace(/[^\d,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Função inteligente para extrair totais numéricos de qualquer orçamento,
 * seja ele do formato novo (v2) ou legado (v1).
 */
export function normalizeBudgetFinancials(
  investmentData: any,
  fallbackTotalStr?: string | number,
): NormalizedBudgetTotals {
  if (!investmentData) {
    const fallbackNum = parseCurrencyToNumber(fallbackTotalStr);
    return {
      isV2: false,
      totalLabor: 0,
      totalMaterials: 0,
      grandTotal: fallbackNum,
      categoriesCount: 0,
      categoriesList: [],
    };
  }

  // Se for o Schema V2 Novo
  if (investmentData.schemaVersion === 2) {
    const v2 = investmentData as BudgetFinancialsV2;
    const categories = v2.categories || [];

    let calcLabor = 0;
    let calcMaterials = 0;
    let calcGrand = 0;
    const catLabels: string[] = [];

    categories.forEach((cat) => {
      const l = Number(cat.laborValue || 0);
      const m = Number(cat.materialsValue || 0);
      calcLabor += l;
      calcMaterials += m;
      calcGrand += Number(cat.totalValue || l + m);
      if (cat.categoryLabel && !catLabels.includes(cat.categoryLabel)) {
        catLabels.push(cat.categoryLabel);
      }
    });

    return {
      isV2: true,
      totalLabor: v2.totalLabor ?? calcLabor,
      totalMaterials: v2.totalMaterials ?? calcMaterials,
      grandTotal: v2.grandTotal ?? calcGrand,
      categoriesCount: categories.length,
      categoriesList: catLabels,
    };
  }

  // Se for Schema V1 Legado
  let extractedTotal = parseCurrencyToNumber(
    investmentData.total || fallbackTotalStr,
  );
  let extractedLabor = 0;
  let extractedMaterials = 0;

  if (Array.isArray(investmentData.clausulas)) {
    investmentData.clausulas.forEach((c: any) => {
      const val = parseCurrencyToNumber(c.valor || c.texto);
      const text = `${c.titulo || ''} ${c.texto || ''}`.toLowerCase();

      if (text.includes('mão de obra') || text.includes('mao de obra')) {
        extractedLabor += val;
      } else if (text.includes('material') || text.includes('materiais')) {
        extractedMaterials += val;
      }
    });
  }

  return {
    isV2: false,
    totalLabor: extractedLabor,
    totalMaterials: extractedMaterials,
    grandTotal: extractedTotal,
    categoriesCount: 0,
    categoriesList: [],
  };
}

export function buildInvestmentClause(
  categories: any[],
  v2Data?: BudgetFinancialsV2,
) {
  if (v2Data && v2Data.schemaVersion === 2) {
    const items = (v2Data.categories || []).map((cat) => {
      let descHtml = '';
      if (cat.description) {
        descHtml += `<p style="margin-bottom: 6px; color: #334155;"><strong>Escopo:</strong> ${cat.description}</p>`;
      }
      if (cat.laborValue || cat.materialsValue) {
        descHtml += `<p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">
          <span>Mão de Obra: <strong>${formatCurrency(cat.laborValue)}</strong></span> | 
          <span>Materiais: <strong>${formatCurrency(cat.materialsValue)}</strong></span>
        </p>`;
      }
      if (cat.subClauses && cat.subClauses.length > 0) {
        descHtml += `<ul style="list-style-type: disc; margin-left: 18px; margin-top: 6px; font-size: 0.85rem;">`;
        cat.subClauses.forEach((sub) => {
          descHtml += `<li><strong>${sub.title}:</strong> ${sub.description || ''}</li>`;
        });
        descHtml += `</ul>`;
      }

      return {
        id: Date.now() + Math.random(),
        subtitulo: cat.categoryLabel || `Serviços de ${cat.category}`,
        content:
          descHtml || `<p>Investimento referente a ${cat.categoryLabel}.</p>`,
        price:
          cat.totalValue ||
          Number(cat.laborValue || 0) + Number(cat.materialsValue || 0),
        numbered: true,
      };
    });

    return {
      id: Date.now(),
      titulo: 'Investimento por Categoria de Serviço',
      items,
      sourceType: 'investment' as const,
    };
  }

  // Fallback V1
  const items = (categories || []).map((c: any) => ({
    id: Date.now() + Math.random(),
    subtitulo: c.title || c.name || 'Investimento',
    content: c.description || '<p>Descrição dos serviços inclusos.</p>',
    price: getCategoryNetValue(c) || c.fixedValue || 0,
    numbered: true,
  }));

  return {
    id: Date.now(),
    titulo: 'Investimento e Condições Financeiras',
    items,
    sourceType: 'investment' as const,
  };
}

export function buildSummaryClause(
  categories: any[],
  financials: {
    legacyTotal?: number;
    labor?: number;
    materials?: number;
    discount?: number;
    grandTotal?: number;
    v2Data?: BudgetFinancialsV2;
  },
) {
  if (financials.v2Data && financials.v2Data.schemaVersion === 2) {
    const v2 = financials.v2Data;
    let summaryHtml = `<div style="font-size: 0.9rem; line-height: 1.6;">
      <p><strong>Mão de Obra Total:</strong> ${formatCurrency(v2.totalLabor)}</p>
      <p><strong>Materiais Total:</strong> ${formatCurrency(v2.totalMaterials)}</p>
      <p style="font-size: 1rem; color: #3730a3; font-weight: bold; margin-top: 6px;"><strong>Investimento Total:</strong> ${formatCurrency(v2.grandTotal)}</p>
    </div>`;

    if (v2.generalNotes) {
      summaryHtml += `<p style="margin-top: 8px; font-size: 0.8rem; color: #64748b; font-style: italic;">${v2.generalNotes}</p>`;
    }

    return {
      id: Date.now(),
      titulo: 'Resumo do Investimento',
      items: [
        {
          id: Date.now() + 1,
          subtitulo: 'Condições de Pagamento e Totais',
          content: summaryHtml,
          numbered: true,
        },
      ],
      sourceType: 'summary' as const,
    };
  }

  // Fallback V1
  const labor = financials.labor || 0;
  const materials = financials.materials || 0;
  const discount = financials.discount || 0;
  const grandTotal = financials.grandTotal || 0;

  let content = `<p><strong>Mão de Obra:</strong> ${formatCurrency(labor)}</p>
<p><strong>Materiais:</strong> ${formatCurrency(materials)}</p>`;
  if (discount > 0) {
    content += `<p><strong>Desconto:</strong> -${formatCurrency(discount)}</p>`;
  }
  content += `<p style="font-size: 1rem; color: #3730a3; font-weight: bold;"><strong>TOTAL GERAL:</strong> ${formatCurrency(grandTotal)}</p>`;

  return {
    id: Date.now(),
    titulo: 'Resumo Financeiro',
    items: [
      {
        id: Date.now() + 1,
        subtitulo: 'Valores Globais',
        content,
        numbered: true,
      },
    ],
    sourceType: 'summary' as const,
  };
}
