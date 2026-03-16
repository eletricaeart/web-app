// app/orcamentos/novo/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppBar from "@/components/layout/AppBar";
import ClientForm from "@/components/forms/ClientForm";
import ClauseManager from "@/components/forms/ClauseManager";
import View from "@/components/layout/View";
import { CircleNotch, CurrencyDollar, Calculator } from "@phosphor-icons/react";
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

/**
 * Interfaces de Tipagem - Agora seguindo o padrão camelCase em Inglês
 */
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
  documentTitle: string; // "Título Doc" -> documentTitle
  issueDate: string; // "Emissão" -> issueDate
  expiration: string; // "Validade" -> expiration
  subtitle?: string; // "Subtítulo" -> subtitle
  client: {
    name: string; // "Nome Cliente" -> name
    zip: string; // "CEP" -> zip
    street: string; // "Rua" -> street
    number: string; // "Número" -> number
    neighborhood: string; // "Bairro" -> neighborhood
    city: string; // "Cidade/UF" -> city
    complement?: string; // "complemento" -> complement
    obs?: string; // "obs" -> obs
  };
  services: Clause[]; // "Serviços JSON" -> services
  financial: {
    labor: number;
    materials: number;
    discount: number;
    total: number;
  };
}

{
  /* interface DetalheSheet {
  tipo: "brk" | "tagc" | "t6" | "ul" | "p";
  conteudo: string | string[];
} */
}

/**
 * FUNÇÃO CÉREBRO: Extrai valores de strings como "[R$ 150,50]" ou "<strong>[R$ 100]</strong>"
 */
const extractPricesFromText = (html: string): number => {
  if (!html) return 0;
  // RegEx para encontrar o padrão [R$ valor]
  const regex = /\[R\$\s?([\d,.]+)\]/g;
  let total = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // Converte "1.500,00" ou "150.00" para número real
    const valueStr = match[1].replace(/\./g, "").replace(",", ".");
    const value = parseFloat(valueStr);
    if (!isNaN(value)) total += value;
  }
  return total;
};

export default function NewBudgetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const editId = searchParams.get("id");
  const isEditing = searchParams.get("natabiruta");

  const [loading, setLoading] = useState<boolean>(false);
  const [clientsCache, setClientsCache] = useState<any[]>([]);

  // Estado inicial ajustado para as novas chaves
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
    financial: {
      labor: 0,
      materials: 0,
      discount: 0,
      total: 0,
    },
  });

  /**
   * CÁLCULO AUTOMÁTICO DO TOTAL
   * Soma todos os campos 'price' das cláusulas + labor + materials - discount
   */
  const calculatedTotal = useMemo(() => {
    let totalFromInputs = 0;
    let totalFromText = 0;

    budget.services.forEach((clause) => {
      clause.items.forEach((item) => {
        // Soma do campo de input "Valor (R$)"
        totalFromInputs += Number(item.price) || 0;
        // Soma do que foi digitado no TipTap Editor usando a tag [R$ ...]
        totalFromText += extractPricesFromText(item.content);
      });
    });

    const final =
      totalFromInputs +
      totalFromText +
      (Number(budget.financial.labor) || 0) +
      (Number(budget.financial.materials) || 0) -
      (Number(budget.financial.discount) || 0);

    return final;
  }, [
    budget.services,
    budget.financial.labor,
    budget.financial.materials,
    budget.financial.discount,
  ]);

  // Sincroniza o total calculado com o estado quando necessário
  useEffect(() => {
    setBudget((prev) => ({
      ...prev,
      financial: { ...prev.financial, total: calculatedTotal },
    }));
  }, [calculatedTotal]);

  {
    const getSelectedDate = () => {
      const date = parseISO(budget.issueDate);
      return isValid(date) ? date : new Date();
    };

    // ... (Efeitos de Inicialização init, mapIncomingData e formatMarkdown permanecem os mesmos)
    useEffect(() => {
      const init = async () => {
        if (editId) setLoading(true);
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
            {
              /* if (!budgetToEdit) {
            const res = await fetch(`/api/data/orcamentos?id=${editId}`, {
              cache: "no-store",
            });
            budgetToEdit = await res.json();
          } */
            }
            if (budgetToEdit) mapIncomingData(budgetToEdit);
          }
          {
            /* else {
          const draftStr = localStorage.getItem("ea_draft_budget");
          if (draftStr) {
            const draft = JSON.parse(draftStr);
            setBudget((prev) => ({ ...prev, ...draft }));
          }
        } */
          }
        } catch (err) {
          console.error("Erro na inicialização:", err);
        } finally {
          setLoading(false);
        }
      };
      init();
    }, [editId]);

    // Mapeamento de entrada corrigido (Aceita o antigo ou novo formato)
    const mapIncomingData = (data: any) => {
      const rawServices =
        data.services || data.servicos || data["Serviços JSON"] || [];

      const mappedClauses: Clause[] = rawServices.map((s: any) => ({
        id: Math.random(),
        titulo: s.titulo || s.title,
        items: (s.itens || s.items || []).map((it: any) => ({
          id: Math.random(),
          subtitulo: it.subtitulo || it.subtitle,
          price: it.price || 0, // Recupera o preço
          content: it.detalhes
            ?.map((d: any) => {
              if (d.tipo === "brk") return "---";
              if (d.tipo === "tagc") return `> ${d.conteudo}`;
              if (d.tipo === "t6") return `# ${d.conteudo}`;
              if (d.tipo === "ul")
                return d.conteudo.map((li: string) => `- ${li}`).join("\n");
              return d.conteudo;
            })
            .join("\n"),
        })),
      }));

      /* setBudget({
      id: data.id,
      documentTitle:
        data.documentTitle || data.docTitle?.text || data["Título Doc"] || "",
      issueDate: formatDateForInput(
        data.issueDate || data.docTitle?.emissao || data["Emissão"],
      ),
      expiration:
        data.expiration ||
        data.docTitle?.validade ||
        data["Validade"] ||
        "15 dias",
      subtitle:
        data.subtitle ||
        data.docTitle?.subtitle ||
        data["Subtítulo"] ||
        "PROPOSTA DE ORÇAMENTO",
      client: {
        name:
          data.clientName ||
          data.client?.name ||
          data.cliente?.name ||
          data["Nome Cliente"] ||
          "",
        zip:
          data.zip ||
          data.client?.zip ||
          data.cliente?.cep ||
          data["CEP"] ||
          "",
        street:
          data.street ||
          data.client?.street ||
          data.cliente?.rua ||
          data["Rua"] ||
          "",
        number:
          data.number ||
          data.client?.number ||
          data.cliente?.num ||
          data["Número"] ||
          "",
        neighborhood:
          data.neighborhood ||
          data.client?.neighborhood ||
          data.cliente?.bairro ||
          data["Bairro"] ||
          "",
        city:
          data.city ||
          data.client?.city ||
          data.cliente?.cidade ||
          data["Cidade/UF"] ||
          "",
        complement:
          data.complement ||
          data.client?.complement ||
          data.cliente?.complemento ||
          "",
        obs: data.obs || data.client?.obs || data.cliente?.obs || "",
      },
      services: mappedClauses,
    }); */
      setBudget({
        ...budget,
        id: data.id,
        documentTitle: data.documentTitle || "",
        issueDate: formatDateForInput(data.issueDate || data["Emissão"]),
        expiration: data.expiration || "15 dias",
        subtitle: data.subtitle || "PROPOSTA DE ORÇAMENTO",
        client: {
          name: data.clientName || "",
          zip: data.zip || "",
          street: data.street || "",
          number: data.number || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          complement: data.complement || "",
          obs: data.obs || "",
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
      text.split("\n").forEach((line) => {
        const tl = line.trim();
        if (!tl) return;
        if (tl === "---") detalhes.push({ tipo: "brk", conteudo: "" });
        else if (tl.startsWith(">"))
          detalhes.push({ tipo: "tagc", conteudo: tl.replace(">", "").trim() });
        else if (tl.startsWith("#"))
          detalhes.push({ tipo: "t6", conteudo: tl.replace("#", "").trim() });
        else if (tl.startsWith("*") || tl.startsWith("-")) {
          const last = detalhes[detalhes.length - 1];
          const content = tl.replace(/^[*|-]\s*/, "").trim();
          if (last && last.tipo === "ul" && Array.isArray(last.conteudo)) {
            last.conteudo.push(content);
          } else {
            detalhes.push({ tipo: "ul", conteudo: [content] });
          }
        } else {
          detalhes.push({ tipo: "p", conteudo: tl });
        }
      });
      return detalhes;
    };

    /* const handleSave = async () => {
    setLoading(true);
    const [y, m, d] = budget.issueDate.split("-");
    const formattedDate = `${d}/${m}/${y}`;

    const payload = {
      ...budget,
      id: editId || budget.id || `EA-${Date.now()}`,
      clientName: budget.client.name,
      zip: budget.client.zip,
      street: budget.client.street,
      number: budget.client.number,
      neighborhood: budget.client.neighborhood,
      city: budget.client.city,
      complement: budget.client.complement,
      obs: budget.client.obs,
      subtitle: budget.subtitle || "PROPOSTA DE ORÇAMENTO",
      expiration: budget.expiration,
      documentTitle: budget.documentTitle,
      issueDate: formattedDate,
      services: budget.services.map((c) => ({
        titulo: c.titulo,
        itens: c.items.map((it) => ({
          subtitulo: it.subtitulo,
          price: it.price, // Salva o preço individual
          detalhes: formatMarkdownForSheets(it.content),
        })),
      })),
    };

    const action = budget.id ? "update" : "create";
    const result = (await eaSyncClient.save("orcamentos", payload, action)) as {
      success: boolean;
    };

    if (result.success) {
      localStorage.removeItem("ea_draft_budget");
      localStorage.removeItem("ea_selected_client");
      router.push("/orcamentos");
    } else {
      alert("Erro ao salvar orçamento.");
    }
    setLoading(false);
  }; */

    const handleSave = async () => {
      setLoading(true);
      const result = await eaSyncClient.save(
        "orcamentos",
        {
          ...budget,
          id: editId || budget.id || `EA-${Date.now()}`,
          services: budget.services.map((c) => ({
            titulo: c.titulo,
            itens: c.items.map((it) => ({
              subtitulo: it.subtitulo,
              price: it.price,
              detalhes: [], // Função de conversão markdown aqui
            })),
          })),
        },
        budget.id ? "update" : "create",
      );
      if (result) router.push("/orcamentos");
      setLoading(false);
    };

    const goToCreateClient = () => {
      localStorage.setItem("ea_draft_budget", JSON.stringify(budget));
      router.push("/clientes/novo");
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
              <label className="label" style={{ margin: 0, padding: "5px 0" }}>
                <View tag="t">Título</View>
                <input
                  type="text"
                  className="input"
                  placeholder="SERVIÇOS DE ELÉTRICA (RESIDENCIAL)"
                  value={budget.documentTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBudget({
                      ...budget,
                      documentTitle: e.target.value,
                    })
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
                        className={`w-full h-[45px] justify-start text-left font-normal border-[#ccc] ${
                          !budget.issueDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {budget.issueDate ? (
                          format(getSelectedDate(), "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getSelectedDate()}
                        onSelect={(date) => {
                          if (date) {
                            setBudget({
                              ...budget,
                              issueDate: format(date, "yyyy-MM-dd"),
                            });
                          }
                        }}
                        captionLayout="dropdown"
                        fromYear={getYear(new Date()) - 100}
                        toYear={getYear(new Date()) + 100}
                        locale={ptBR}
                        initialFocus
                        classNames={{
                          caption_dropdowns: "flex justify-center gap-1",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </label>

                <label className="flex-5 flex flex-col gap-1">
                  <View tag="t">Validade</View>
                  <Select
                    value={budget.expiration}
                    onValueChange={(value: string) =>
                      setBudget({
                        ...budget,
                        expiration: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-[45px] bg-white border-[#ccc] focus:ring-1 focus:ring-[#ffab00]">
                      <SelectValue placeholder="Selecione a validade" />
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
              clientData={budget.client} // Passe o objeto direto
              clientsCache={clientsCache}
              onClientChange={(updatedClientData: any) =>
                setBudget({
                  ...budget,
                  client: updatedClientData, // Atualize o objeto client inteiro
                })
              }
              onNewClientClick={goToCreateClient}
              isOnNewBudget={true}
            />
          </View>

          <Default_Divider.default spacing="2rem" color="transparent" />

          <View tag="clauses-holder">
            <header className="subtitle-header">
              <h3 className="page-subtitle">Cláusulas e Itens</h3>
            </header>
            <ClauseManager
              clauses={budget.services}
              onClausesChange={(newClauses: any) =>
                setBudget({ ...budget, services: newClauses })
              }
            />
          </View>

          {/* PAINEL FINANCEIRO */}
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
                  placeholder="0,00"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Materiais / Outros
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
                  placeholder="0,00"
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
                  placeholder="0,00"
                  className="text-red-500 font-bold"
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

          <footer className="footer flex flex-col">
            <Pressable
              onClick={handleSave}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <>
                  <CircleNotch
                    size={20}
                    weight="bold"
                    className="animate-spin"
                  />
                  <span>PROCESSANDO...</span>
                </>
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

  // function formatDateForInput(dateStr: string) {
  //   if (!dateStr) return new Date().toISOString().split("T")[0];
  //   if (dateStr.includes("-")) return dateStr.split("T")[0];
  //   if (dateStr.includes("/")) {
  //     const parts = dateStr.split("/");
  //     if (parts.length === 3) {
  //       const [d, m, y] = parts;
  //       return `${y}-${m}-${d}`;
  //     }
  //   }
  //   return new Date().toISOString().split("T")[0];
}
