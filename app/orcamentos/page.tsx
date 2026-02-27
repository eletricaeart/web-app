"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import View from "@/components/layout/View";
import ClauseManager from "@/components/forms/ClauseManager"; // O que você me enviou
import { useData } from "@/hooks/useData"; // Nossa ponte com o GAS
import { CircleNotch, CaretLeft } from "@phosphor-icons/react";
import "@/styles/orcamentos-legacy.css";

export default function NewBudgetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { items: orcamentos, saveData } = useData("orcamentos");

  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState({
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

  // Lógica de edição original sua
  useEffect(() => {
    if (editId && orcamentos.length > 0) {
      const existing = orcamentos.find((o) => String(o.id) === String(editId));
      if (existing) setBudget(existing);
    }
  }, [editId, orcamentos]);

  const handleSave = async () => {
    setLoading(true);
    const action = budget.id ? "update" : "create";
    const result = await saveData(budget, action);
    if (result.success) {
      router.push(`/orcamentos/${result.id}`);
    }
    setLoading(false);
  };

  return (
    <View tag="page" className="new-budget-page">
      {/* Sua AppBar Original */}
      <div
        className="app-bar-legacy"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem",
          gap: "1rem",
          background: "#fff",
        }}
      >
        <button onClick={() => router.back()}>
          <CaretLeft size={24} />
        </button>
        <span style={{ fontWeight: "bold" }}>
          {budget.id ? "Editar Orçamento" : "Novo Orçamento"}
        </span>
      </div>

      <View tag="page-content">
        <section className="subtitle-header">
          <View tag="span" className="t label-text">
            Título do Documento
          </View>
          <input
            type="text"
            value={budget.docTitle.text}
            onChange={(e) =>
              setBudget({
                ...budget,
                docTitle: { ...budget.docTitle, text: e.target.value },
              })
            }
            placeholder="Ex: Instalação Elétrica Residencial"
          />
        </section>

        {/* Aqui você pode inserir o seu ClientForm original ou os inputs diretos conforme o NewBudget.jsx */}

        <Divider />

        <ClauseManager
          clauses={budget.clauses}
          onClausesChange={(newClauses) =>
            setBudget({ ...budget, clauses: newClauses })
          }
        />

        <footer className="footer">
          <button className="btnSave" onClick={handleSave} disabled={loading}>
            {loading ? (
              <CircleNotch size={20} className="animate-spin" />
            ) : budget.id ? (
              "ATUALIZAR"
            ) : (
              "SALVAR"
            )}
          </button>
        </footer>
      </View>
    </View>
  );
}

// O componente Divider que você mencionou
function Divider() {
  return (
    <div style={{ height: "1px", background: "#e5e5e5", margin: "2rem 0" }} />
  );
}
