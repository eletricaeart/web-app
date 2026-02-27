// lib/schemas/cliente.ts
import { z } from "zod";

export const clienteSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
  whatsapp: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cep: z.string().optional(),
  rua: z.string().optional(),
  num: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
