// app/orcamentos/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppBar from "@/components/layout/AppBar";
import ClientForm from "@/components/forms/ClientForm";
import ClauseManager from "@/components/forms/ClauseManager";
import View from "@/components/layout/View";
import { CircleNotch } from "@phosphor-icons/react";
import { eaSyncClient } from "@/lib/EASyncClient";
import * as Default_Divider from "@/components/Divider";

// Importações Shadcn/UI
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getYear, format, parseISO, isValid } from "date-fns";
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

/**
 * Interfaces de Tipagem
 */
interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
}

interface Clause {
  id: number;
  titulo: string;
  items: ClauseItem[];
}

interface BudgetData {
  id: string | null;
  docTitle: {
    text: string;
    emissao: string;
    validade: string;
    subtitle?: string;
  };
  cliente: {
    name: string;
    cep: string;
    rua: string;
    num: string;
    bairro: string;
    cidade: string;
    complemento?: string;
    obs?: string;
  };
  clauses: Clause[];
}

interface DetalheSheet {
  tipo: "brk" | "tagc" | "t6" | "ul" | "p";
  conteudo: string | string[];
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
    docTitle: {
      text: "",
      emissao: new Date().toISOString().split("T")[0],
      validade: "15 dias",
    },
    cliente: { name: "", cep: "", rua: "", num: "", bairro: "", cidade: "" },
    clauses: [
      {
        id: Date.now(),
        titulo: "",
        items: [{ id: Date.now() + 1, subtitulo: "", content: "" }],
      },
    ],
  });

  const getSelectedDate = () => {
    const date = parseISO(budget.docTitle.emissao);
    return isValid(date) ? date : new Date();
  };

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
          let budgetToEdit = allBudgets.find(
            (o: any) => String(o.id) === String(editId),
          );
          if (!budgetToEdit) {
            const res = await fetch(`/api/data/orcamentos?id=${editId}`, {
              cache: "no-store",
            });
            budgetToEdit = await res.json();
          }
          if (budgetToEdit) mapIncomingData(budgetToEdit);
        } else {
          const draftStr = localStorage.getItem("ea_draft_budget");
          if (draftStr) {
            const draft = JSON.parse(draftStr);
            setBudget((prev) => ({ ...prev, ...draft }));
          }
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
    const mappedClauses: Clause[] = data.servicos.map((s: any) => ({
      id: Math.random(),
      titulo: s.titulo,
      items: s.itens.map((it: any) => ({
        id: Math.random(),
        subtitulo: it.subtitulo,
        content: it.detalhes
          .map((d: any) => {
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

    setBudget({
      id: data.id,
      docTitle: {
        text: data.docTitle.text,
        emissao: formatDateForInput(data.docTitle.emissao),
        validade: data.docTitle.validade,
      },
      cliente: data.cliente,
      clauses: mappedClauses,
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

  const handleSave = async () => {
    setLoading(true);
    const [y, m, d] = budget.docTitle.emissao.split("-");
    const formattedDate = `${d}/${m}/${y}`;

    const payload = {
      id: editId || budget.id || `TEMP_${Date.now()}`,
      cliente: budget.cliente,
      docTitle: {
        subtitle: "PROPOSTA DE ORÇAMENTO",
        emissao: formattedDate,
        validade: budget.docTitle.validade,
        text: budget.docTitle.text,
      },
      servicos: budget.clauses.map((c) => ({
        titulo: c.titulo,
        itens: c.items.map((it) => ({
          subtitulo: it.subtitulo,
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
                value={budget.docTitle.text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBudget({
                    ...budget,
                    docTitle: { ...budget.docTitle, text: e.target.value },
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
                        !budget.docTitle.emissao && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {budget.docTitle.emissao ? (
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
                            docTitle: {
                              ...budget.docTitle,
                              emissao: format(date, "yyyy-MM-dd"),
                            },
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
                  value={budget.docTitle.validade}
                  onValueChange={(value: string) =>
                    setBudget({
                      ...budget,
                      docTitle: { ...budget.docTitle, validade: value },
                    })
                  }
                >
                  <SelectTrigger className="w-full h-[45px] bg-white border-[#ccc] focus:ring-1 focus:ring-[#ffab00]">
                    <SelectValue placeholder="Selecione a validade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 dias">7 dias</SelectItem>
                    <SelectItem value="15 dias">15 dias</SelectItem>
                    <SelectItem value="30 dias">30 dias</SelectItem>
                    <SelectItem value="60 dias">60 dias</SelectItem>
                    <SelectItem value="90 dias">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </View>
          </View>

          <Divider />

          <h3 className="page-subtitle">Dados do cliente</h3>
          <ClientForm
            clientData={budget.cliente}
            clientsCache={clientsCache}
            onClientChange={(data: any) =>
              setBudget({ ...budget, cliente: data })
            }
            onNewClientClick={goToCreateClient}
          />
        </View>

        <Divider />

        <View tag="clauses-holder">
          <header className="subtitle-header">
            <h3 className="page-subtitle">Cláusulas e Itens</h3>
          </header>
          <ClauseManager
            clauses={budget.clauses}
            onClausesChange={(newClauses: any) =>
              setBudget({ ...budget, clauses: newClauses })
            }
          />
        </View>

        <footer className="footer">
          <button
            className="btnSave"
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <>
                <CircleNotch size={20} weight="bold" className="animate-spin" />
                <span>PROCESSANDO...</span>
              </>
            ) : (
              <span>
                {budget.id ? "ATUALIZAR ORÇAMENTO" : "SALVAR ORÇAMENTO"}
              </span>
            )}
          </button>
        </footer>
      </View>
    </>
  );
}

/**
 * Helpers e Componentes Internos
 */
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

const Divider = () => (
  <Default_Divider.default spacing="2rem" color="transparent" />
);
