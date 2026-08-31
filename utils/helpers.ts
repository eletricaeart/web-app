/**
 * --- [ Retorna a data limpa no formato dia-mês-ano (DD-MM-YYYY, ex: 31-08-2026) ]
 */
export function getCleanDate(
  date: string | number | Date | null | undefined,
): string {
  if (!date) return '';

  if (date instanceof Date) {
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof date === 'number') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  let str = String(date).trim();
  if (!str) return '';

  // Se contiver ISO timestamp com 'T'
  if (str.includes('T')) {
    str = str.split('T')[0].trim();
  }

  // Se contiver horário com espaço "YYYY-MM-DD HH:mm:ss"
  if (str.includes(' ')) {
    str = str.split(' ')[0].trim();
  }

  // Padrão DD/MM/YYYY ou D/M/YYYY ou DD-MM-YYYY ou D-M-YYYY
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // Padrão YYYY-MM-DD ou YYYY/MM/DD ou YYYY-M-D
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // Fallback para conversão padrão do JS
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const year = parsed.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

/**
 * --- [ gerador de UUIDs ]
 *  */
export function generateUUID(): string {
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  // Fallback para navegadores que bloqueiam ou não suportam a função
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * --- [ CID ]
 *  */
export function CID(): string {
  return Math.floor(100000000000 + Math.random() * 900000000000)
    .toString()
    .replace(/(\d{4})(?=\d)/g, '$1+');
}

/**
 * --- formatador de valores em descrição por extensão
 *  */
export function valorPorExtenso(valor: number): string {
  // Uma versão simplificada para o exemplo, podemos usar uma lib como 'extenso' depois
  const formatador = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const valorFormatado = formatador.format(valor);

  // Aqui retornaríamos a string por extenso.
  // Exemplo manual simplificado:
  return `${valorFormatado}`;
}

/**
 * --- [ Gerador de Senha de Acesso Alfanumérica ]
 * Gera uma senha curta de 4 caracteres (ex: 8F2B) para acesso do cliente
 */
export function generateAccessPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Removido 0, O, 1, I, L para evitar confusão
  /* --- obsoleto ------------------- */
  /* let password = '';
  for (let i = 0; i < 4; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password; */
  /* --- end obsolteo --------------- */
  const segment = (len: number) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');

  // Retorna no formato XXXX-XXXX-XXXX
  return `${segment(4)}-${segment(4)}-${segment(4)}`;
}

export function comparePasswords(input: string, stored: string) {
  // Remove hifens e espaços para comparar
  const cleanInput = input.replace(/[-\s]/g, '').toUpperCase();
  const cleanStored = stored.replace(/[-\s]/g, '').toUpperCase();
  return cleanInput === cleanStored;
}
