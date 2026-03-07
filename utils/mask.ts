// Tipagem para as máscaras fixas e suporte a strings personalizadas
type MaskPattern =
  | "##.###.###/####-##" // CNPJ
  | "#####-###" // CEP
  | "(##) #####-####" // Celular
  | "(##) ####-####" // Fixo
  | "##/##/####" // Data
  | string;

export default function MaskString(
  value: string | number | undefined | null,
  pattern: MaskPattern,
): string {
  if (!value || !pattern) return "---";

  let i = 0;
  const v = value.toString();

  // O operador ?? "" garante que se a string acabar antes da máscara,
  // o caractere seja substituído por vazio em vez de "undefined"
  return pattern
    .replace(/#/g, () => v[i++] ?? "")
    .replace(/undefined/g, "")
    .trim();
}

export const Mask = {
  rg: (val: string | number) => MaskString(val, "##.###.###-#"),
  cpf: (val: string | number) => MaskString(val, "###.###.###-##"),
  cnpj: (val: string | number) => MaskString(val, "##.###.###/####-##"),
  cep: (val: string | number) => MaskString(val, "#####-###"),

  // Lógica para telefone: detecta se é fixo (10 dígitos) ou celular (11 dígitos)
  phone: (val: string | number) => {
    const clean = val.toString().replace(/\D/g, "");
    const pattern = clean.length <= 10 ? "(##) ####-####" : "(##) #####-####";
    return MaskString(clean, pattern);
  },

  date: (val: string | number) => MaskString(val, "##/##/####"),
};

// Exemplos de uso:
console.log("CNPJ:", Mask.cnpj("12345678000195")); // 12.345.678/0001-95
console.log("CEP:", Mask.cep("11700000")); // 11700-000
console.log("Celular:", Mask.phone("13991234567")); // (13) 99123-4567
console.log("Fixo:", Mask.phone("1334661234")); // (13) 3466-1234
console.log("Data:", Mask.date("07032025")); // 07/03/2025
