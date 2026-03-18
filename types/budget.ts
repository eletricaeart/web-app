// types/budget.ts
export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface DetailContent {
  tipo: "brk" | "tagc" | "t6" | "ul" | "html" | string;
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

export interface BudgetData {
  id: string | number;

  clientName?: string;
  documentTitle?: string;
  issueDate?: string;
  expiration?: string;
  subtitle?: string;

  services?: ServiceBudget[];

  financial?: FinancialSummary;

  clientAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  };
}
