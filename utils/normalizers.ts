// utils/normalizers.ts

export function normalizeClient(raw: any) {
  return {
    id: raw.id,
    name: raw.name || raw['Nome Completo'] || 'Sem Nome',
    street: raw.street || raw.rua || raw.clientAddress?.street || '',
    number: raw.number || raw.num || raw.clientAddress?.number || '',
    // ... adicione todos os mapeamentos aqui
  };
}
