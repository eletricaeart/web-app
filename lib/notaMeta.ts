// lib/notaMeta.ts

export const NOTA_STATUSES = [
  { value: 'pending', label: 'Pendente', color: 'amber' },
  { value: 'resolved', label: 'Resolvida', color: 'emerald' },
  { value: 'follow_up', label: 'Precisa Retorno', color: 'red' },
] as const;

export function getNotaStatus(value?: string) {
  return NOTA_STATUSES.find((s) => s.value === value) || NOTA_STATUSES[0];
}

export const NOTA_STATUS_STYLES: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};
