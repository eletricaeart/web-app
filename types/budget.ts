// types/budget.ts

export type BudgetSchemaVersion = 'v1' | 'v2' | 'v3';

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface DetailContent {
  tipo: 'brk' | 'tagc' | 't6' | 'ul' | 'html' | string;
  conteudo: any;
}

export interface ItemBudget {
  subtitulo: string;
  detalhes: DetailContent[];
  services?: ServiceItem[];
  price?: number;
}

export interface ServiceBudget {
  titulo: string;
  itens: ItemBudget[];
}

export interface FinancialSummary {
  labor: number;
  materials: number;
  discount: number;
  total: number;
}

export interface BusinessServiceItem {
  name: string;
  value: number;
  type?: 'mao_de_obra' | 'material' | 'misto' | string;
  description?: string;
  area_m2?: number;
  deadline_days?: number;
}

export interface BusinessFinancialSummary {
  total: number;
  servicesBreakdown?: BusinessServiceItem[];
  categories?: { name: string; value: number }[];
  paymentConditions?: string;
  deadline?: string;
  warranty?: string;
  paymentSchedule?: {
    stage: string;
    percentage: number;
    value: number;
  }[];
}

export interface BudgetData {
  id: string | number;
  schema_version?: BudgetSchemaVersion;

  clientName?: string;
  documentTitle?: string;
  issueDate?: string;
  expiration?: string;
  subtitle?: string;

  services?: ServiceBudget[];

  financial?: FinancialSummary;
  financial_v3?: BusinessFinancialSummary;
  financial_json?: any;

  clientAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Normaliza qualquer versão de orçamento (V1, V2 ou V3)
 * para uma estrutura financeira consistente e padronizada.
 */
export function getNormalizedBudgetFinancial(
  data: Partial<BudgetData> | null | undefined,
): BusinessFinancialSummary {
  if (!data) {
    return { total: 0, categories: [], servicesBreakdown: [] };
  }

  // 1. Caso V3 com business_financial / financial_v3
  if (data.financial_v3) {
    return {
      total: Number(data.financial_v3.total || 0),
      servicesBreakdown: data.financial_v3.servicesBreakdown || [],
      categories:
        data.financial_v3.categories ||
        data.financial_v3.servicesBreakdown?.map((s) => ({
          name: s.name,
          value: s.value,
        })) ||
        [],
      paymentConditions: data.financial_v3.paymentConditions || '',
      deadline: data.financial_v3.deadline || '',
      warranty: data.financial_v3.warranty || '',
      paymentSchedule: data.financial_v3.paymentSchedule || [],
    };
  }

  // 2. Caso V2 com financial_json
  if (data.financial_json) {
    const fj =
      typeof data.financial_json === 'string'
        ? JSON.parse(data.financial_json)
        : data.financial_json;
    return {
      total: Number(fj.total || fj.totalGeral || data.financial?.total || 0),
      categories: fj.categories || [],
      servicesBreakdown: (fj.categories || []).map((c: any) => ({
        name: c.name,
        value: c.value,
      })),
      paymentConditions: fj.paymentConditions || '',
      deadline: fj.deadline || '',
      warranty: fj.warranty || '',
      paymentSchedule: fj.paymentSchedule || [],
    };
  }

  // 3. Caso V1 Legado com financial { labor, materials, total }
  if (data.financial) {
    const cats: { name: string; value: number }[] = [];
    if (data.financial.labor > 0)
      cats.push({ name: 'Mão de Obra', value: data.financial.labor });
    if (data.financial.materials > 0)
      cats.push({ name: 'Materiais', value: data.financial.materials });

    return {
      total: Number(
        data.financial.total ||
          data.financial.labor +
            data.financial.materials -
            (data.financial.discount || 0),
      ),
      categories: cats,
      servicesBreakdown: cats.map((c) => ({ name: c.name, value: c.value })),
      paymentConditions: '',
      deadline: '',
      warranty: '',
    };
  }

  return { total: 0, categories: [], servicesBreakdown: [] };
}
