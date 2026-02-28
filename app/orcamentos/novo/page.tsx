"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppBar from "@/components/layout/AppBar";
// import PageHeader from "@/components/ui/PageHeader/PageHeader";
import ClientForm from "@/components/forms/ClientForm";
import ClauseManager from "@/components/forms/ClauseManager";
import View from "@/components/layout/View";
// import Divider from "@/components/ui/divider";
import { CircleNotch } from "@phosphor-icons/react";
import { eaSyncClient } from "@/lib/EASyncClient";

export default function NewBudgetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const editId = searchParams.get("id");
  const isEditing = searchParams.get("natabiruta");

  const [loading, setLoading] = useState(false);
  const [clientsCache, setClientsCache] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>({
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

  // Inicialização
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

          if (budgetToEdit) {
            mapIncomingData(budgetToEdit);
          }
        } else {
          const draftStr = localStorage.getItem("ea_draft_budget");
          if (draftStr) {
            const draft = JSON.parse(draftStr);
            setBudget((prev: any) => ({ ...prev, ...draft }));
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
    const mappedClauses = data.servicos.map((s: any) => ({
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
      servicos: budget.clauses.map((c: any) => ({
        titulo: c.titulo,
        itens: c.items.map((it: any) => ({
          subtitulo: it.subtitulo,
          detalhes: formatMarkdownForSheets(it.content),
        })),
      })),
    };

    const action = budget.id ? "update" : "create";

    const result = await eaSyncClient.save("orcamentos", payload, action);

    if (result.success) {
      localStorage.removeItem("ea_draft_budget");
      localStorage.removeItem("ea_selected_client");
      router.push("/orcamentos");
    } else {
      alert("Erro ao salvar orçamento.");
    }

    setLoading(false);
  };

  const formatMarkdownForSheets = (text: string) => {
    const detalhes: any[] = [];

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
        if (last && last.tipo === "ul") last.conteudo.push(content);
        else detalhes.push({ tipo: "ul", conteudo: [content] });
      } else detalhes.push({ tipo: "p", conteudo: tl });
    });

    return detalhes;
  };

  const goToCreateClient = () => {
    localStorage.setItem("ea_draft_budget", JSON.stringify(budget));
    router.push("/cliente/novo");
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
        {/* <PageHeader center shadow="#9fabb555"> */}
        {/*   Proposta de Orçamento */}
        {/* </PageHeader> */}

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
                onChange={(e) =>
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
              <label className="flex-5">
                <View tag="t">Data de Emissão</View>
                <input
                  type="date"
                  className="input"
                  value={budget.docTitle.emissao}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      docTitle: {
                        ...budget.docTitle,
                        emissao: e.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="flex-5">
                <View tag="t">Validade</View>
                <select
                  className="select"
                  value={budget.docTitle.validade}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      docTitle: {
                        ...budget.docTitle,
                        validade: e.target.value,
                      },
                    })
                  }
                >
                  <option value="7 dias">7 dias</option>
                  <option value="15 dias">15 dias</option>
                  <option value="30 dias">30 dias</option>
                  <option value="60 dias">60 dias</option>
                  <option value="90 dias">90 dias</option>
                </select>
              </label>
            </View>
          </View>

          {/* <Divider padding="2rem" height="2px" color="transparent" /> */}

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

        {/* <Divider padding="2rem" height="2px" color="transparent" /> */}

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

function formatDateForInput(dateStr: string) {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  if (dateStr.includes("-")) {
    return dateStr.split("T")[0];
  }

  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
  }

  return new Date().toISOString().split("T")[0];
}
