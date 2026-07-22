// lib/numberToWords.ts

const UNITS = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
];
const TENS = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
];
const HUNDREDS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
];

function convertGroup(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const h = Math.floor(n / 100);
  const rest = n % 100;
  const t = Math.floor(rest / 10);
  const u = rest % 10;

  const parts: string[] = [];
  if (h > 0) parts.push(HUNDREDS[h]);

  if (rest < 20) {
    if (rest > 0) parts.push(UNITS[rest]);
  } else {
    let tensPart = TENS[t];
    if (u > 0) tensPart += ` e ${UNITS[u]}`;
    parts.push(tensPart);
  }

  return parts.join(' e ');
}

/** Converte um valor em reais (número) para sua forma por extenso em português. */
export function valorPorExtenso(valor: number): string {
  const isNegative = valor < 0;
  const absValue = Math.abs(valor);
  const inteiro = Math.floor(absValue);
  const centavos = Math.round((absValue - inteiro) * 100);

  if (inteiro === 0 && centavos === 0) return 'zero reais';

  const milhoes = Math.floor(inteiro / 1_000_000);
  const milhares = Math.floor((inteiro % 1_000_000) / 1000);
  const unidades = inteiro % 1000;

  const segments: string[] = [];

  if (milhoes > 0) {
    const word = convertGroup(milhoes);
    segments.push(`${word} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }

  if (milhares > 0) {
    if (milhares === 1) {
      segments.push('mil');
    } else {
      segments.push(`${convertGroup(milhares)} mil`);
    }
  }

  if (unidades > 0) {
    segments.push(convertGroup(unidades));
  }

  let reaisText = segments.join(segments.length > 1 ? ' e ' : '');
  // Ajuste: quando o último segmento é < 100 e há segmentos anteriores,
  // o "e" já cobre a leitura natural (ex: "mil e duzentos").
  if (segments.length > 2) {
    reaisText = `${segments.slice(0, -1).join(', ')} e ${segments[segments.length - 1]}`;
  }

  const reaisLabel = inteiro === 1 ? 'real' : 'reais';
  let result = inteiro > 0 ? `${reaisText} ${reaisLabel}` : '';

  if (centavos > 0) {
    const centavosText = convertGroup(centavos);
    const centavosLabel = centavos === 1 ? 'centavo' : 'centavos';
    result = result
      ? `${result} e ${centavosText} ${centavosLabel}`
      : `${centavosText} ${centavosLabel}`;
  }

  return isNegative ? `menos ${result}` : result;
}
