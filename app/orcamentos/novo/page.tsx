"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { Budget, BudgetService } from "@/lib/types/budget";
import {
  CaretLeft,
  UserPlus,
  Check,
  IdentificationCard,
  FileText,
  PlusCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Componentes que vamos usar para organizar o formulário
import { ClienteSelector } from "@/components/orcamentos/cliente-selector";

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const { saveData } = useData("orcamentos");
  const { items: clientes } = useData<any>("clientes");

  const [loading, setLoading] = useState(false);

  // Estado principal do Orçamento seguindo o nosso Type
  const [formData, setFormData] = useState<Partial<Budget>>({
    docTitle: {
      subtitle: "ORÇAMENTO DE SERVIÇOS",
      emissao: new Date().toLocaleDateString("pt-BR"),
      validade: "15 dias",
      text: "PROPOSTA TÉCNICA",
    },
    servicos: [],
  });

  const handleSelectCliente = (cliente: any) => {
    setFormData((prev) => ({
      ...prev,
      cliente: {
        name: cliente.name,
        cep: cliente.cep || "",
        rua: cliente.rua || "",
        num: cliente.num || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
      },
    }));
    toast.info(`Cliente ${cliente.name} selecionado`);
  };

  return (
    <main className="min-h-svh bg-slate-50 p-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600 bg-white rounded-full shadow-sm"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Novo Orçamento</h1>
      </div>

      <div className="space-y-8">
        {/* PASSO 1: SELEÇÃO DE CLIENTE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-1 text-indigo-950">
            <IdentificationCard size={20} weight="duotone" />
            <h2 className="font-bold uppercase text-xs tracking-widest">
              Dados do Cliente
            </h2>
          </div>

          <ClienteSelector
            clientes={clientes}
            onSelect={handleSelectCliente}
            selectedName={formData.cliente?.name}
          />

          {formData.cliente && (
            <Card className="border-none shadow-sm bg-white/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <CardContent className="p-4 text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Endereço:</strong> {formData.cliente.rua},{" "}
                  {formData.cliente.num}
                </p>
                <p>
                  {formData.cliente.bairro} - {formData.cliente.cidade} /{" "}
                  {formData.cliente.cep}
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* PASSO 2: DETALHES DO DOCUMENTO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-1 text-indigo-950">
            <FileText size={20} weight="duotone" />
            <h2 className="font-bold uppercase text-xs tracking-widest">
              Configuração do PDF
            </h2>
          </div>
          {/* Aqui entrarão os inputs de Subtítulo, Validade, etc */}
          <Card className="p-4 rounded-2xl border-dashed border-2 border-slate-200 text-center text-slate-400 text-sm">
            Área de Detalhes do Documento (Próximo passo)
          </Card>
        </section>

        {/* PASSO 3: SERVIÇOS/CLÁUSULAS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-1 text-indigo-950">
            <PlusCircle size={20} weight="duotone" />
            <h2 className="font-bold uppercase text-xs tracking-widest">
              Serviços e Cláusulas
            </h2>
          </div>
          <Card className="p-8 rounded-2xl border-dashed border-2 border-slate-200 text-center text-slate-400 text-sm">
            O gerenciador de cláusulas será montado aqui.
          </Card>
        </section>
      </div>
    </main>
  );
}
