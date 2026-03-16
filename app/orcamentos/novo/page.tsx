// app/orcamentos/novo/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppBar from "@/components/layout/AppBar";
import ClientForm from "@/components/forms/ClientForm";
import ClauseManager from "@/components/forms/ClauseManager";
import View from "@/components/layout/View";
import { CircleNotch, Calculator } from "@phosphor-icons/react";
import { eaSyncClient } from "@/lib/EASyncClient";
import * as Default_Divider from "@/components/Divider";

// Importações Shadcn/UI
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getYear, format, parseISO, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import "./style.css";
import Pressable from "@/components/Pressable";

interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
  price?: number;
}

interface Clause {
  id: number;
  titulo: string;
  items: ClauseItem[];
}

interface BudgetData {
  id: string | null;
  documentTitle: string;
  issueDate: string;
  expiration: string;
  subtitle?: string;
  client: {
    name: string;
    zip?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    complement?: string;
    obs?: string;
  };
  services: Clause[];
  financial: {
    labor: number;
    materials: number;
    discount: number;
    total: number;
  };
}

interface DetalheSheet {
  tipo: "brk" | "tagc" | "t6" | "ul" | "p";
  conteudo: string | string[];
}

const extractPricesFromText = (html: string): number => {
  if (!html) return 0;
  const regex = /\[R\$\s?([\d,.]+)\]/g;
  let total = 0;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const valueStr = match[1].replace(/\./g, "").replace(",", ".");
    const value = parseFloat(valueStr);
    if (!isNaN(value)) total += value;
  }
  return total;
};

// FUNÇÃO AUXILIAR DE DATA (Movida para fora para ser acessível)
function formatDateForInput(dateStr: string) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  if (dateStr.includes("-")) return dateStr.split("T")[0];
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m}-${d}`;
    }
  }
  return new Date().toISOString().split("T")[0];
}

export default function NewBudgetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const isEditing = searchParams.get("natabiruta");

  const [loading, setLoading] = useState<boolean>(false);
  const [clientsCache, setClientsCache] = useState<any[]>([]);

  const [budget, setBudget] = useState<BudgetData>({
    id: null,
    documentTitle: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiration: "15 dias",
    client: {
      name: "",
      zip: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
    },
    services: [
      {
        id: Date.now(),
        titulo: "",
        items: [{ id: Date.now() + 1, subtitulo: "", content: "", price: 0 }],
      },
    ],
    financial: { labor: 0, materials: 0, discount: 0, total: 0 },
  });

  const calculatedTotal = useMemo(() => {
    let totalFromInputs = 0;
    let totalFromText = 0;
    budget.services.forEach((clause) => {
      clause.items.forEach((item) => {
        totalFromInputs += Number(item.price) || 0;
        totalFromText += extractPricesFromText(item.content);
      });
    });
    return (
      totalFromInputs +
      totalFromText +
      (Number(budget.financial.labor) || 0) +
      (Number(budget.financial.materials) || 0) -
      (Number(budget.financial.discount) || 0)
    );
  }, [
    budget.services,
    budget.financial.labor,
    budget.financial.materials,
    budget.financial.discount,
  ]);

  useEffect(() => {
    setBudget((prev) => ({
      ...prev,
      financial: { ...prev.financial, total: calculatedTotal },
    }));
  }, [calculatedTotal]);

  const getSelectedDate = () => {
    const date = parseISO(budget.issueDate);
    return isValid(date) ? date : new Date();
  };

  // EFEITO DE INICIALIZAÇÃO CORRIGIDO
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [clients, allBudgets] = await Promise.all([
          eaSyncClient.pull("clientes"),
          eaSyncClient.pull("orcamentos"),
        ]);
        setClientsCache(Array.isArray(clients) ? clients : []);

        if (editId) {
          const budgetToEdit = allBudgets.find(
            (o: any) => String(o.id) === String(editId),
          );
          if (budgetToEdit) mapIncomingData(budgetToEdit);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editId]);

  const mapIncomingData = (data: any) => {
    const rawServices =
      data.services || data.servicos || data["Serviços JSON"] || [];
    const servicesArray =
      typeof rawServices === "string" ? JSON.parse(rawServices) : rawServices;

    const mappedClauses: Clause[] = servicesArray.map((s: any) => ({
      id: s.id || Math.random(),
      titulo: s.titulo || s.title || "",
      items: (s.itens || s.items || []).map((it: any) => ({
        id: it.id || Math.random(),
        subtitulo: it.subtitulo || it.subtitle || "",
        price: it.price || 0,
        content: Array.isArray(it.detalhes)
          ? it.detalhes
              .map((d: any) => {
                if (d.tipo === "brk") return "<hr>";
                if (d.tipo === "tagc")
                  return `<blockquote>${d.conteudo}</blockquote>`;
                if (d.tipo === "t6") return `<h3>${d.conteudo}</h3>`;
                if (d.tipo === "ul" && Array.isArray(d.conteudo))
                  return `<ul>${d.conteudo.map((li: string) => `<li>${li}</li>`).join("")}</ul>`;
                return d.conteudo;
              })
              .join("")
          : it.content || "",
      })),
    }));

    setBudget({
      id: data.id,
      documentTitle: data.documentTitle || data["Título Doc"] || "",
      issueDate: formatDateForInput(data.issueDate || data["Emissão"]),
      expiration: data.expiration || data["Validade"] || "15 dias",
      subtitle: data.subtitle || data["Subtítulo"] || "PROPOSTA DE ORÇAMENTO",
      client: {
        name:
          data.clientName || data.client?.name || data["Nome Cliente"] || "",
        zip: data.zip || data.client?.zip || data["CEP"] || "",
        street: data.street || data.client?.street || data["Rua"] || "",
        number: data.number || data.client?.number || data["Número"] || "",
        neighborhood:
          data.neighborhood ||
          data.client?.neighborhood ||
          data["Bairro"] ||
          "",
        city: data.city || data.client?.city || data["Cidade/UF"] || "",
        complement: data.complement || data.client?.complement || "",
        obs: data.obs || data.client?.obs || "",
      },
      services: mappedClauses,
      financial: data.financial || {
        labor: 0,
        materials: 0,
        discount: 0,
        total: 0,
      },
    });
  };

  const formatMarkdownForSheets = (text: string): DetalheSheet[] => {
    const detalhes: DetalheSheet[] = [];
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    // Lógica simplificada: Se o TipTap enviou HTML, salvamos como parágrafo ou processamos tags
    // Para manter compatibilidade com sua função antiga:
    text
      .split(/<p>|<\/p>|<h3>|<\/h3>|<li>|<\/li>/)
      .filter(Boolean)
      .forEach((line) => {
        const tl = line.trim();
        if (!tl) return;
        detalhes.push({ tipo: "p", conteudo: tl });
      });
    return detalhes;
  };

  const handleSave = async () => {
    setLoading(true);
    const [y, m, d] = budget.issueDate.split("-");
    const formattedDate = `${d}/${m}/${y}`;

    const payload = {
      ...budget,
      id: editId || budget.id || `EA-${Date.now()}`,
      clientName: budget.client.name,
      issueDate: formattedDate,
      services: budget.services.map((c) => ({
        titulo: c.titulo,
        itens: c.items.map((it) => ({
          subtitulo: it.subtitulo,
          price: it.price,
          detalhes: [{ tipo: "p", conteudo: it.content }], // Salvando o HTML bruto para re-leitura fácil
        })),
      })),
    };

    const action = budget.id ? "update" : "create";
    const result = await eaSyncClient.save("orcamentos", payload, action);

    if (result) {
      router.push("/orcamentos");
    } else {
      alert("Erro ao salvar orçamento.");
    }
    setLoading(false);
  };

  return (
    <>
      <AppBar
        title={isEditing ? `Edição` : `Novo Orçamento`}
        backAction={() => {
          localStorage.removeItem("ea_draft_budget");
          localStorage.removeItem("ea_selected_client");
          router.back();
        }}
      />

      <View tag="page">
        <View tag="page-content">
          <h3 className="page-subtitle">Dados do orçamento</h3>

          <View className="formGroup">
            <label className="label">
              <View tag="t">Título</View>
              <input
                type="text"
                className="input"
                placeholder="Título do Documento"
                value={budget.documentTitle}
                onChange={(e) =>
                  setBudget({ ...budget, documentTitle: e.target.value })
                }
              />
            </label>
          </View>

          <View tag="budget-infos" className="pd">
            <View tag="grid-duo">
              <label className="date-picker flex-5 flex flex-col gap-1">
                <View tag="t">Data de Emissão</View>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-[45px] justify-start border-[#ccc]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(getSelectedDate(), "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={getSelectedDate()}
                      onSelect={(date) =>
                        date &&
                        setBudget({
                          ...budget,
                          issueDate: format(date, "yyyy-MM-dd"),
                        })
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </label>

              <label className="flex-5 flex flex-col gap-1">
                <View tag="t">Validade</View>
                <Select
                  value={budget.expiration}
                  onValueChange={(v) => setBudget({ ...budget, expiration: v })}
                >
                  <SelectTrigger className="w-full h-[45px] border-[#ccc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["7 dias", "15 dias", "30 dias", "60 dias"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </View>
          </View>

          <Default_Divider.default spacing="2rem" color="transparent" />
          <h3 className="page-subtitle">Dados do cliente</h3>
          <ClientForm
            clientData={budget.client}
            clientsCache={clientsCache}
            onClientChange={(updated) =>
              setBudget({ ...budget, client: updated })
            }
            onNewClientClick={() => router.push("/clientes/novo")}
            isOnNewBudget={true}
          />

          <Default_Divider.default spacing="2rem" color="transparent" />
          <h3 className="page-subtitle">Cláusulas e Itens</h3>
          <ClauseManager
            clauses={budget.services}
            onClausesChange={(newClauses) =>
              setBudget({ ...budget, services: newClauses })
            }
          />

          <Default_Divider.default spacing="2rem" color="transparent" />
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <header className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <Calculator size={20} /> Resumo Financeiro
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Adicional Mão de Obra
                </span>
                <Input
                  type="number"
                  value={budget.financial.labor || ""}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        labor: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Materiais
                </span>
                <Input
                  type="number"
                  value={budget.financial.materials || ""}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        materials: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">
                  Desconto
                </span>
                <Input
                  type="number"
                  value={budget.financial.discount || ""}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        discount: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-slate-500 font-medium">VALOR TOTAL:</span>
              <span className="text-3xl font-black text-indigo-700">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(calculatedTotal)}
              </span>
            </div>
          </View>
        </View>

        <footer className="footer flex flex-col p-6">
          <Pressable
            onClick={handleSave}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? (
              <CircleNotch size={20} className="animate-spin" />
            ) : (
              <span>
                {budget.id ? "ATUALIZAR ORÇAMENTO" : "SALVAR ORÇAMENTO"}
              </span>
            )}
          </Pressable>
        </footer>
      </View>
    </>
  );
}
