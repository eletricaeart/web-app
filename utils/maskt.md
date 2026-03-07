
type MaskPattern = "##.###.###-#" | "###.###.###-##" | string;

export default function MaskString(value: string | number, pattern: MaskPattern): string {
  if (!value || !pattern) return "---";
  
  let i = 0;
  const v = value.toString();
  
  return pattern.replace(/#/g, () => v[i++] ?? "").replace(/undefined/g, "");
}

export const Mask = {
  rg: (rg: string | number): string => MaskString(rg, "##.###.###-#"),
  cpf: (cpf: string | number): string => MaskString(cpf, "###.###.###-##"),
};

const cpf = Mask.cpf("34637225850");
const rg = Mask.rg("414457924");

console.log("cpf: ", cpf, "\nrg: ", rg);

