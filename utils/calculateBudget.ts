// utils/calculaBudget.ts
import { ServiceBudget } from "@/types/budget";

export function calculateBudgetTotal(
  services: ServiceBudget[] = [],
  financial = { labor: 0, materials: 0, discount: 0 },
) {
  let servicesTotal = 0;

  services.forEach((clause) => {
    clause.itens.forEach((item) => {
      const subtotal =
        item.services?.reduce((acc, s) => acc + s.totalValue, 0) ?? 0;

      servicesTotal += subtotal;
    });
  });

  const total =
    servicesTotal +
    Number(financial.labor || 0) +
    Number(financial.materials || 0) -
    Number(financial.discount || 0);

  return {
    servicesTotal,
    total,
  };
}
