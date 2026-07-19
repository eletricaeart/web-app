// lib/clientMeta.ts

export const CLIENT_CATEGORIES = [
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'condominio', label: 'Condomínio' },
  { value: 'outro', label: 'Outro' },
] as const;

export const CLIENT_LEAD_SOURCES = [
  { value: 'indicacao', label: 'Indicação' },
  { value: 'instagram', label: 'Instagram/Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'outro', label: 'Outro' },
] as const;

export function getCategoryLabel(value?: string) {
  return (
    CLIENT_CATEGORIES.find((c) => c.value === value)?.label || 'Não informado'
  );
}

export function getLeadSourceLabel(value?: string) {
  return (
    CLIENT_LEAD_SOURCES.find((c) => c.value === value)?.label || 'Não informado'
  );
}
