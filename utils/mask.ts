export default function MaskString(value, pattern) {
  if (!value || !pattern) return "---";
  let i = 0;
  const v = value.toString();
  return pattern.replace(/#/g, (_) => v[i++]).replace(/undefined/g, "");
}

export const Mask = {
  rg: (rg) => MaskString(rg, "##.###.###-#"),
  cpf: (cpf) => MaskString(cpf, "###.###.###-##"),
};

const cpf = Mask.cpf("34637225850");
const rg = Mask.rg("414457924");

console.log("cpf: ", cpf, "\nrg: ", rg);
