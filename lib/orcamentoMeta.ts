// lib/orcamentoMeta.ts

export const ORCAMENTO_STATUSES = [
  { value: 'draft', label: 'Rascunho', color: 'slate' },
  { value: 'sent', label: 'Enviado', color: 'sky' },
  { value: 'approved', label: 'Aprovado', color: 'emerald' },
  { value: 'rejected', label: 'Recusado', color: 'red' },
] as const;

export const ORCAMENTO_STATUS_STYLES: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-500 border-slate-200',
  sky: 'bg-sky-50 text-sky-600 border-sky-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
};

/**
 * Deriva o status "de exibição" combinando o status manual salvo com a
 * checagem automática de vencimento (baseada em issueDate + expiration,
 * ex: "15 dias"). Um orçamento aprovado/recusado nunca vira "vencido" —
 * só rascunho/enviado, que é quando a validade realmente importa.
 */
export function getDisplayStatus(orc: {
  status?: string;
  issueDate?: string;
  expiration?: string;
}): { value: string; label: string; color: string } {
  const saved = orc.status || 'draft';
  const base =
    ORCAMENTO_STATUSES.find((s) => s.value === saved) || ORCAMENTO_STATUSES[0];

  if (saved === 'approved' || saved === 'rejected') return base;

  const days = parseInt(orc.expiration || '', 10);
  if (orc.issueDate && !isNaN(days)) {
    const issued = new Date(orc.issueDate);
    const deadline = new Date(issued);
    deadline.setDate(deadline.getDate() + days);

    if (deadline.getTime() < Date.now()) {
      return { value: 'expired', label: 'Vencido', color: 'amber' };
    }
  }

  return base;
}
