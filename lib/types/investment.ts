// lib/types/investment.ts

import { valorPorExtenso } from '@/lib/numberToWords';

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

export interface DetailedServiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitValue: number;
  laborValue: number;
  totalValue: number;
  tipo?: 'servico' | 'insumo';
  unidade?: string;
}

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
  items?: DetailedServiceItem[]; // Lista de itens de serviços individuais
  subClauses?: SubClauseItem[]; // Sub-cláusulas ou itens detalhados
}

export interface BudgetOption {
  id: string; // 'opcao_a' | 'opcao_b'
  title: string; // ex: "Opção 1 - Convencional" | "Opção 2 - Completa com Material"
  categories: CategoryBreakdown[];
  totalLabor: number;
  totalMaterials: number;
  grandTotal: number;
  description?: string;
}

export interface BudgetFinancialsV2 {
  schemaVersion: 2;
  hasOptions?: boolean;
  activeOptionId?: string; // ID da aba que está sendo editada no momento ('opcao_a' | 'opcao_b')
  selectedOptionId?: string; // ID da opção escolhida pelo cliente (se houver)
  options?: BudgetOption[];
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

    // Se tiver opções configuradas e uma selecionada (ou padrão)
    if (v2.hasOptions && v2.options && v2.options.length > 0) {
      const chosenOpt =
        v2.options.find((o) => o.id === v2.selectedOptionId) ||
        v2.options.find((o) => o.id === v2.activeOptionId) ||
        v2.options[0];

      return {
        isV2: true,
        totalLabor: chosenOpt.totalLabor,
        totalMaterials: chosenOpt.totalMaterials,
        grandTotal: chosenOpt.grandTotal,
        categoriesCount: (chosenOpt.categories || []).length,
        categoriesList: (chosenOpt.categories || []).map(
          (c) => c.categoryLabel || c.category,
        ),
      };
    }

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
    // Caso de Dupla Opção de Orçamento Ativada
    if (v2Data.hasOptions && v2Data.options && v2Data.options.length > 0) {
      const items = v2Data.options.map((opt, optIndex) => {
        const isSelected = v2Data.selectedOptionId === opt.id;
        const badgeSelected = isSelected
          ? `<span style="display: inline-block; font-size: 0.72rem; color: #15803d; background: #dcfce7; border: 1px solid #86efac; padding: 2px 8px; border-radius: 9999px; font-weight: 800; margin-left: 8px;">★ OPÇÃO APROVADA PELO CLIENTE</span>`
          : '';

        let optHtml = `<div style="margin-bottom: 8px;">`;
        if (opt.description) {
          optHtml += `<p style="font-size: 0.85rem; color: #475569; margin-bottom: 8px;">${opt.description}</p>`;
        }

        (opt.categories || []).forEach((cat) => {
          const catTotal =
            cat.totalValue ||
            Number(cat.laborValue || 0) + Number(cat.materialsValue || 0);
          optHtml += `<div style="margin-bottom: 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">`;
          optHtml += `<div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e293b; font-size: 0.9rem;">
            <span>${cat.categoryLabel || cat.category}</span>
            <span style="color: #4f46e5;">${formatCurrency(catTotal)}</span>
          </div>`;

          if (cat.items && cat.items.length > 0) {
            optHtml += `<ul style="list-style-type: none; padding: 0; margin-top: 6px; font-size: 0.82rem;">`;
            cat.items.forEach((item) => {
              const qtyUnit = item.unidade ? ` ${item.unidade}` : '';
              const isSingle = !item.quantity || Number(item.quantity) === 1;
              const isStandardUnit =
                !item.unidade ||
                ['un', 'un.', 'unidade', 'und'].includes(
                  item.unidade.trim().toLowerCase(),
                );
              let titleAndQty = item.name;
              if (!isSingle || !isStandardUnit) {
                titleAndQty += ` (${item.quantity}${qtyUnit} x ${formatCurrency(item.unitValue)})`;
              }
              const itemExtenso = valorPorExtenso(item.totalValue);
              const badgeTipo =
                item.tipo === 'insumo'
                  ? `<span style="display: inline-block; font-size: 0.65rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 4px; border-radius: 4px; font-weight: 700; margin-right: 4px;">MATERIAL</span>`
                  : '';
              optHtml += `<li style="display: flex; justify-content: space-between; padding: 2px 0; color: #334155; gap: 8px; flex-wrap: wrap;">
                <span>${badgeTipo}${titleAndQty}:</span>
                <span style="font-weight: 600;">${formatCurrency(item.totalValue)} (${itemExtenso})</span>
              </li>`;
            });
            optHtml += `</ul>`;
          }
          optHtml += `</div>`;
        });

        const extensoTotal = valorPorExtenso(opt.grandTotal);
        optHtml += `<div style="padding: 8px 12px; background: ${isSelected ? '#f0fdf4' : '#eef2ff'}; border: 1px solid ${isSelected ? '#bbf7d0' : '#c7d2fe'}; border-radius: 8px; font-weight: 700; color: #1e1b4b; display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <span>Investimento Total (${opt.title}):</span>
          <span style="font-size: 1.05rem; color: ${isSelected ? '#15803d' : '#4338ca'}; font-weight: 800;">${formatCurrency(opt.grandTotal)} (${extensoTotal})</span>
        </div>`;
        optHtml += `</div>`;

        return {
          id: Date.now() + optIndex + Math.random(),
          subtitulo: `${opt.title}${badgeSelected}`,
          content: optHtml,
          price: opt.grandTotal,
          numbered: true,
        };
      });

      return {
        id: Date.now(),
        titulo: 'Opções de Investimento',
        items,
        sourceType: 'investment' as const,
      };
    }

    const items = (v2Data.categories || []).map((cat) => {
      const total =
        cat.totalValue ||
        Number(cat.laborValue || 0) + Number(cat.materialsValue || 0);
      const extensoTotal = valorPorExtenso(total);

      let descHtml = '';
      if (cat.description) {
        descHtml += `<p style="margin-bottom: 6px; color: #334155;"><strong>Escopo:</strong> ${cat.description}</p>`;
      }

      if (cat.items && cat.items.length > 0) {
        descHtml += `<ul style="list-style-type: none; padding: 0; margin-top: 6px; margin-bottom: 6px; font-size: 0.85rem;">`;
        cat.items.forEach((item) => {
          const qtyUnit = item.unidade ? ` ${item.unidade}` : '';
          const isSingle = !item.quantity || Number(item.quantity) === 1;
          const isStandardUnit =
            !item.unidade ||
            ['un', 'un.', 'unidade', 'und'].includes(
              item.unidade.trim().toLowerCase(),
            );
          let titleAndQty = item.name;
          if (!isSingle || !isStandardUnit) {
            titleAndQty += ` (${item.quantity}${qtyUnit} x ${formatCurrency(item.unitValue)})`;
          }
          const itemExtenso = valorPorExtenso(item.totalValue);
          const badgeTipo =
            item.tipo === 'insumo'
              ? `<span style="display: inline-block; font-size: 0.68rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-right: 6px;">MATERIAL</span>`
              : '';
          descHtml += `<li style="margin-bottom: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>${badgeTipo}<strong>${titleAndQty}:</strong></span>
              <span style="font-weight: 600; color: #1e1b4b;">${formatCurrency(item.totalValue)} (${itemExtenso})</span>
            </div>
            ${item.description ? `<div style="color: #64748b; font-size: 0.8rem; margin-top: 2px;">${item.description}</div>` : ''}
          </li>`;
        });
        descHtml += `</ul>`;
      }

      let materialsText = '';
      if (cat.materialsValue > 0) {
        const extensoMaterials = valorPorExtenso(cat.materialsValue);
        materialsText = `, sendo <strong>${formatCurrency(cat.materialsValue)}</strong> (${extensoMaterials}) referente a materiais`;
      }

      descHtml += `<p style="font-size: 0.9rem; color: #1e1b4b; font-weight: 600; margin-top: 6px;">
      Valor do Serviço: <strong>${formatCurrency(total)}</strong> (${extensoTotal})${materialsText}.
    </p>`;

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
        content: descHtml,
        price: total,
        numbered: true,
      };
    });

    return {
      id: Date.now(),
      titulo: 'Investimento',
      items,
      sourceType: 'investment' as const,
    };
  }

  // Fallback V1
  const items = (categories || []).map((c: any) => {
    const val = getCategoryNetValue(c) || c.fixedValue || 0;
    const extensoVal = valorPorExtenso(val);
    let content = c.description || '<p>Descrição dos serviços inclusos.</p>';
    if (val > 0) {
      content += `<p style="margin-top: 4px; font-weight: 600;">Valor: <strong>${formatCurrency(val)}</strong> (${extensoVal})</p>`;
    }
    return {
      id: Date.now() + Math.random(),
      subtitulo: c.title || c.name || 'Investimento',
      content,
      price: val,
      numbered: true,
    };
  });

  return {
    id: Date.now(),
    titulo: 'Investimento',
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

    // Resumo de Dupla Opção
    if (v2.hasOptions && v2.options && v2.options.length > 0) {
      let summaryHtml = `<div style="font-size: 0.9rem; line-height: 1.6;">`;
      summaryHtml += `<p style="font-size: 0.85rem; color: #475569; margin-bottom: 8px;">Esta proposta apresenta <strong>${v2.options.length} opções de investimento</strong> para sua escolha:</p>`;

      v2.options.forEach((opt, idx) => {
        const isSelected = v2.selectedOptionId === opt.id;
        summaryHtml += `<div style="margin-bottom: 8px; padding: 10px 14px; background: ${isSelected ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isSelected ? '#86efac' : '#e2e8f0'}; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-weight: 700; color: #1e293b;">${opt.title} ${isSelected ? '<span style="font-size: 0.7rem; color: #15803d; background: #dcfce7; padding: 1px 6px; border-radius: 4px; font-weight: 800;">APROVADA</span>' : ''}</span>
            <span style="font-size: 1rem; font-weight: 800; color: ${isSelected ? '#15803d' : '#4338ca'};">${formatCurrency(opt.grandTotal)} (${valorPorExtenso(opt.grandTotal)})</span>
          </div>
        </div>`;
      });

      if (v2.selectedOptionId) {
        const chosen = v2.options.find((o) => o.id === v2.selectedOptionId);
        if (chosen) {
          summaryHtml += `<p style="font-size: 0.95rem; color: #15803d; font-weight: bold; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            VALOR TOTAL APROVADO: ${formatCurrency(chosen.grandTotal)} (${valorPorExtenso(chosen.grandTotal)})
          </p>`;
        }
      }

      if (v2.generalNotes) {
        summaryHtml += `<p style="margin-top: 8px; font-size: 0.8rem; color: #64748b; font-style: italic;">${v2.generalNotes}</p>`;
      }

      summaryHtml += `</div>`;

      return {
        id: Date.now(),
        titulo: 'Resumo Financeiro',
        items: [
          {
            id: Date.now() + 1,
            subtitulo: '',
            content: summaryHtml,
            numbered: true,
          },
        ],
        sourceType: 'summary' as const,
      };
    }

    const grandTotal = v2.grandTotal || 0;
    const extensoGrandTotal = valorPorExtenso(grandTotal);

    let summaryHtml = `<div style="font-size: 0.9rem; line-height: 1.6;">`;

    (v2.categories || []).forEach((cat) => {
      const catTotal =
        cat.totalValue ||
        Number(cat.laborValue || 0) + Number(cat.materialsValue || 0) ||
        0;
      if (catTotal > 0) {
        const materialSuffix =
          cat.materialsValue && cat.materialsValue > 0
            ? ' (com material incluso)'
            : '';
        summaryHtml += `<p><strong>${cat.categoryLabel}:</strong> ${formatCurrency(catTotal)} (${valorPorExtenso(catTotal)})${materialSuffix}</p>`;
      }
    });

    summaryHtml += `<p style="font-size: 1.05rem; color: #3730a3; font-weight: bold; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
        <strong>VALOR TOTAL DO INVESTIMENTO:</strong> ${formatCurrency(grandTotal)} (${extensoGrandTotal})
      </p>
    </div>`;

    if (v2.generalNotes) {
      summaryHtml += `<p style="margin-top: 8px; font-size: 0.8rem; color: #64748b; font-style: italic;">${v2.generalNotes}</p>`;
    }

    return {
      id: Date.now(),
      titulo: 'Resumo Financeiro',
      items: [
        {
          id: Date.now() + 1,
          subtitulo: '',
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
  const extensoGrandTotal = valorPorExtenso(grandTotal);

  let content = `<p><strong>Mão de Obra:</strong> ${formatCurrency(labor)}${labor > 0 ? ` (${valorPorExtenso(labor)})` : ''}</p>
<p><strong>Materiais:</strong> ${formatCurrency(materials)}${materials > 0 ? ` (${valorPorExtenso(materials)})` : ''}</p>`;
  if (discount > 0) {
    content += `<p><strong>Desconto:</strong> -${formatCurrency(discount)} (${valorPorExtenso(discount)})</p>`;
  }
  content += `<p style="font-size: 1rem; color: #3730a3; font-weight: bold; margin-top: 6px;"><strong>TOTAL GERAL:</strong> ${formatCurrency(grandTotal)} (${extensoGrandTotal})</p>`;

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
