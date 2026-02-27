// lib/types/budget.ts

export interface BudgetServiceItem {
  subtitulo: string;
  detalhes: {
    tipo: "p" | "ul" | "t6" | "tagc" | "brk";
    conteudo: string | string[];
  }[];
}

export interface BudgetService {
  titulo: string;
  itens: BudgetServiceItem[];
}

export interface Budget {
  id: string;
  owner_id?: string;
  cliente: {
    name: string;
    cep: string;
    rua: string;
    num: string;
    bairro: string;
    cidade: string;
  };
  docTitle: {
    subtitle: string;
    emissao: string;
    validade: string;
    text: string;
  };
  servicos: BudgetService[];
}
