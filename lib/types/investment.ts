// lib/types/investment.ts
import { valorPorExtenso } from './numberToWords';

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
  description: string;
  mode: 'fixed' | 'itemized';
  fixedValue: number;
  items: InvestmentItem[];
  discount: number;
  paymentSplit: {
    enabled: boolean;
    entryPercent: number;
  };
}

export function getCategoryGrossValue(category: InvestmentCategory): number {
  if (category.mode === 'fixed') return Number(category.fixedValue) || 0;
  return category.items.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.unitValue),
    0,
  );
}

export function getCategoryNetValue(category: InvestmentCategory): number {
  return Math.max(
    0,
    getCategoryGrossValue(category) - Number(category.discount || 0),
  );
}

export function getInvestmentTotal(categories: InvestmentCategory[]): number {
  return categories.reduce((acc, c) => acc + getCategoryNetValue(c), 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/* --- Geradores de cláusula --- */

export interface GeneratedClauseItem {
  id: number;
  subtitulo: string;
  content: string;
}

export interface GeneratedClause {
  id: number;
  titulo: string;
  items: GeneratedClauseItem[];
  sourceType: 'investment' | 'summary';
}

function descriptionToHtml(description: string): string {
  if (!description?.trim()) return '';
  return description
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p>${line}</p>`)
    .join('');
}

export function buildInvestmentClause(
  categories: InvestmentCategory[],
): GeneratedClause {
  return {
    id: Date.now(),
    titulo: 'INVESTIMENTO',
    sourceType: 'investment',
    items: categories.map((cat, i) => {
      const net = getCategoryNetValue(cat);
      const priceHtml = `<p><strong>${formatCurrency(net)}</strong> (${valorPorExtenso(net)})</p>`;
      const descHtml = descriptionToHtml(cat.description);
      return {
        id: Date.now() + i + 1,
        subtitulo: cat.title?.trim() || `${cat.name} (Mão de Obra)`,
        content: priceHtml + descHtml,
      };
    }),
  };
}

interface SummaryExtra {
  legacyTotal?: number;
  labor?: number;
  materials?: number;
  discount?: number;
  grandTotal: number;
}

export function buildSummaryClause(
  categories: InvestmentCategory[],
  extra: SummaryExtra,
): GeneratedClause {
  const lines: string[] = [];

  categories.forEach((cat) => {
    lines.push(
      `<p>${cat.title?.trim() || cat.name}: <strong>${formatCurrency(getCategoryNetValue(cat))}</strong></p>`,
    );
  });

  if (extra.legacyTotal && extra.legacyTotal > 0) {
    lines.push(
      `<p>Outros itens: <strong>${formatCurrency(extra.legacyTotal)}</strong></p>`,
    );
  }
  if (extra.labor && extra.labor > 0) {
    lines.push(
      `<p>Mão de obra adicional: <strong>${formatCurrency(extra.labor)}</strong></p>`,
    );
  }
  if (extra.materials && extra.materials > 0) {
    lines.push(
      `<p>Materiais: <strong>${formatCurrency(extra.materials)}</strong></p>`,
    );
  }
  if (extra.discount && extra.discount > 0) {
    lines.push(
      `<p>Desconto: <strong>-${formatCurrency(extra.discount)}</strong></p>`,
    );
  }

  lines.push(
    `<p><strong>VALOR TOTAL DO INVESTIMENTO</strong></p>`,
    `<p><strong>${formatCurrency(extra.grandTotal)}</strong> (${valorPorExtenso(extra.grandTotal)})</p>`,
  );

  return {
    id: Date.now(),
    titulo: 'RESUMO FINANCEIRO',
    sourceType: 'summary',
    items: [
      {
        id: Date.now() + 1,
        subtitulo: '',
        content: lines.join(''),
      },
    ],
  };
}
