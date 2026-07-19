// lib/avatarColor.ts

/**
 * Gera um hash numérico simples e determinístico a partir de uma string.
 * Mesmo nome sempre produz o mesmo hash — sem aleatoriedade real.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // força inteiro de 32 bits
  }
  return Math.abs(hash);
}

/** Matiz (0-359) determinístico a partir do nome do cliente */
export function getNameHue(name: string): number {
  return hashString(name || 'cliente') % 360;
}

/** Cor de fundo suave para o avatar-fantasma */
export function getGhostBackground(name: string): string {
  const hue = getNameHue(name);
  return `hsl(${hue}, 60%, 92%)`;
}

/** Cor do ícone do fantasma */
export function getGhostIconColor(name: string): string {
  const hue = getNameHue(name);
  return `hsl(${hue}, 55%, 42%)`;
}

/** Gradiente para a capa do perfil, na mesma família de cor do avatar */
export function getNameGradient(name: string): string {
  const hue = getNameHue(name);
  const hue2 = (hue + 42) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 65%, 40%), hsl(${hue2}, 70%, 28%))`;
}
