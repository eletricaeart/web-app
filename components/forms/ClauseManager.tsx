// components/forms/ClauseManager.tsx
"use client";

import React from "react";
import { Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import TipTapEditor from "@/components/editor/TipTapEditor";
import View from "@/components/layout/View";
import styles from "./ClauseManager.module.css";

/**
 * Interfaces para garantir a tipagem estrita do Gerenciador de Cláusulas
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

interface ClauseManagerProps {
  clauses: Clause[];
  onClausesChange: (newClauses: Clause[]) => void;
}

export default function ClauseManager({
  clauses,
  onClausesChange,
}: ClauseManagerProps) {
  const addClause = () => {
    const newClause: Clause = {
      id: Date.now(),
      titulo: "",
      items: [{ id: Date.now() + 1, subtitulo: "", content: "" }],
    };
    onClausesChange([...clauses, newClause]);
  };

  const removeClause = (id: number) => {
    onClausesChange(clauses.filter((c) => c.id !== id));
  };

  const updateClauseTitle = (id: number, title: string) => {
    onClausesChange(
      clauses.map((c) => (c.id === id ? { ...c, titulo: title } : c)),
    );
  };

  const addItem = (clauseId: number) => {
    onClausesChange(
      clauses.map((c) => {
        if (c.id === clauseId) {
          return {
            ...c,
            items: [...c.items, { id: Date.now(), subtitulo: "", content: "" }],
          };
        }
        return c;
      }),
    );
  };

  const updateItem = (
    clauseId: number,
    itemId: number,
    field: keyof ClauseItem,
    value: string,
  ) => {
    onClausesChange(
      clauses.map((c) => {
        if (c.id === clauseId) {
          return {
            ...c,
            items: c.items.map((it) =>
              it.id === itemId ? { ...it, [field]: value } : it,
            ),
          };
        }
        return c;
      }),
    );
  };

  const removeItem = (clauseId: number, itemId: number) => {
    onClausesChange(
      clauses.map((c) => {
        if (c.id === clauseId) {
          return { ...c, items: c.items.filter((it) => it.id !== itemId) };
        }
        return c;
      }),
    );
  };

  return (
    <View tag="clauses-field">
      {clauses.map((clause, index) => (
        <View tag="clause" key={clause.id}>
          <View tag="clause-options" className={styles.clauseOptions}>
            <View tag="label-text" className={styles.labelTitle}>
              Título
            </View>
            <View
              tag="btn_remove-clause"
              className={styles.btn_remove_clause}
              onClick={() => removeClause(clause.id)}
            >
              Excluir
            </View>
          </View>
          <View tag="clause-header" className={styles.clauseHeader}>
            <View className={styles.clauseHeader_ui}>
              <View tag="clause-number" className={styles.clauseNumber}>
                {index + 1}.
              </View>
              <input
                type="text"
                className={styles.clauseTitleInput}
                placeholder="Ex: Descrição dos Serviços"
                value={clause.titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateClauseTitle(clause.id, e.target.value)
                }
              />
            </View>
          </View>

          <View tag="subclause-field">
            {clause.items.map((item, iIdx) => (
              <React.Fragment key={item.id}>
                <View tag="subclause" className={styles.subclause}>
                  <View
                    tag="subclause-content"
                    className={styles.subclauseContent}
                  >
                    <label className={styles.subclauseTitle}>
                      <span className="label-text">Subtítulo</span>
                      <Input
                        placeholder="Subtítulo (Ex: Cozinha)"
                        className="subclause-subtitle"
                        value={item.subtitulo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(
                            clause.id,
                            item.id,
                            "subtitulo",
                            e.target.value,
                          )
                        }
                      />
                    </label>

                    <label className={styles.subclauseHelpTips}>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span className="label-text">Conteúdo</span>
                        <span className={styles.btn_helpTips}>ajuda</span>
                      </View>

                      <TipTapEditor
                        value={item.content}
                        onChange={(val: string) =>
                          updateItem(clause.id, item.id, "content", val)
                        }
                        bg="#f5f5f5"
                        radius="9px"
                      />
                    </label>
                  </View>
                </View>
                <View
                  tag="subclause-options"
                  className={styles.subclauseOptions}
                >
                  <View
                    tag="subclause-options-overlay"
                    className={styles.subclauseOptionsOverlay}
                  />
                  <View
                    tag="btn_remove-subclause"
                    className={styles.btn_remove_subclause}
                  >
                    <View
                      tag="btn_x"
                      style={{
                        width: "fit-content",
                        display: "flex",
                      }}
                      onClick={() => removeItem(clause.id, item.id)}
                    >
                      Excluir subcláusula
                    </View>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View
            tag="footer-options"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem 1rem",
            }}
          >
            <button
              className="btn_add-subclause"
              style={{ background: "#27f2", color: "#29f" }}
              onClick={() => addItem(clause.id)}
            >
              + Adicionar Subcláusula
            </button>
          </View>
        </View>
      ))}

      <View
        tag="btn_add-clause-field"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 1rem",
        }}
      >
        <button
          className="btn_add-clause"
          style={{ background: "#27f2", color: "#29f" }}
          onClick={addClause}
        >
          + Adicionar Cláusula
        </button>
      </View>
    </View>
  );
}
