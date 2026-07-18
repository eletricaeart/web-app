// components/forms/ClauseManager.tsx
"use client";

import React, { useState } from "react";
import {
  Trash,
  CurrencyDollar,
  Plus,
  PencilSimple,
  Calculator,
  ListPlus,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import TipTapEditor from "@/components/editor/TipTapEditor";
import View from "@/components/layout/View";
import styles from "./ClauseManager.module.css";
import Pressable from "../Pressable";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { valorPorExtenso } from "@/utils/helpers";

/**
 * Interfaces para garantir a tipagem estrita do Gerenciador de Cláusulas
 */
interface ServiceItem {
  id: string;
  description: string;
  unitValue: number;
  quantity: number;
  totalValue: number;
}

interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
  price?: number;
  services?: ServiceItem[];
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
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [activeItemRef, setActiveItemRef] = useState<{
    clauseId: number;
    itemId: number;
  } | null>(null);

  // Estado para o formulário do novo serviço dentro do Drawer
  const [newService, setNewService] = useState({
    description: "",
    unitValue: 0,
    quantity: 1,
  });

  const addClause = () => {
    const newClause: Clause = {
      id: Date.now(),
      titulo: "", // Começa com parágrafo padrão (texto simples)
      items: [
        {
          id: Date.now() + 1,
          subtitulo: "",
          content: "",
          services: [],
          price: 0,
        },
      ],
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
      clauses.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: Date.now(),
                  subtitulo: "",
                  content: "",
                  services: [],
                  price: 0,
                },
              ],
            }
          : c,
      ),
    );
  };

  const updateItem = (
    clauseId: number,
    itemId: number,
    // field: keyof ClauseItem,
    field: string,
    // value: string | number,
    value: any,
  ) => {
    onClausesChange(
      clauses.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              items: c.items.map((it) =>
                it.id === itemId ? { ...it, [field]: value } : it,
              ),
            }
          : c,
      ),
    );
  };

  // LÓGICA DO DRAWER DE SERVIÇOS
  const handleAddServiceToItem = () => {
    if (!activeItemRef) return;
    const { clauseId, itemId } = activeItemRef;

    const service: ServiceItem = {
      id: Math.random().toString(36),
      ...newService,
      totalValue: newService.unitValue * newService.quantity,
    };

    const currentClause = clauses.find((c) => c.id === clauseId);
    const currentItem = currentClause?.items.find((i) => i.id === itemId);
    const updatedServices = [...(currentItem?.services || []), service];

    // Atualiza os serviços e recalcula o preço total da subcláusula
    const newTotalPrice = updatedServices.reduce(
      (acc, s) => acc + s.totalValue,
      0,
    );

    updateItem(clauseId, itemId, "services", updatedServices);
    updateItem(clauseId, itemId, "price", newTotalPrice);

    setNewService({ description: "", unitValue: 0, quantity: 1 });
  };

  const removeServiceFromItem = (
    clauseId: number,
    itemId: number,
    serviceId: string,
  ) => {
    const clause = clauses.find((c) => c.id === clauseId);
    const item = clause?.items.find((i) => i.id === itemId);

    if (!item) return;

    const updatedServices = (item.services || []).filter(
      (s) => s.id !== serviceId,
    );

    const newTotalPrice = updatedServices.reduce(
      (acc, s) => acc + s.totalValue,
      0,
    );

    updateItem(clauseId, itemId, "services", updatedServices);
    updateItem(clauseId, itemId, "price", newTotalPrice);
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
            {clause.items.map((item) => (
              <React.Fragment key={item.id}>
                <View
                  tag="subclause"
                  className={styles.subclause}
                  key={item.id}
                >
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
                        onChange={(e) =>
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
                        <span
                          className={styles.btn_helpTips}
                          style={{ display: "flex", gap: ".5rem" }}
                          onClick={() => {
                            setActiveItemRef({
                              clauseId: clause.id,
                              itemId: item.id,
                            });
                            setIsServiceDrawerOpen(true);
                          }}
                        >
                          <ListPlus size={14} /> + Serviços
                        </span>
                      </View>

                      <TipTapEditor
                        value={item.content}
                        services={item.services || []}
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
            className="flex flex-col justify-center p-4"
          >
            <Pressable
              label="+ Adicionar Subcláusula"
              style={{ background: "#27f2", color: "#29f" }}
              onClick={() => addItem(clause.id)}
            />
          </View>
        </View>
      ))}

      <View
        tag="btn_add-clause-field"
        className="flex flex-col justify-center px-4 py-0"
      >
        <Pressable
          className="btn_add-clause"
          style={{ background: "#27f2", color: "#29f" }}
          onClick={addClause}
        >
          + Adicionar Cláusula
        </Pressable>
      </View>

      {/* DRAWER ÚNICO PARA GERENCIAR SERVIÇOS */}
      <Drawer open={isServiceDrawerOpen} onOpenChange={setIsServiceDrawerOpen}>
        <DrawerContent className="bg-slate-50 h-[85vh]">
          <div className="mx-auto w-full max-w-md p-6">
            <DrawerHeader className="px-0">
              <DrawerTitle className="text-indigo-900 flex items-center gap-2">
                <Calculator weight="duotone" /> Serviços da Etapa
              </DrawerTitle>
            </DrawerHeader>

            {/* LISTA DE SERVIÇOS JÁ ADICIONADOS */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto p-1">
              {activeItemRef &&
                clauses
                  .find((c) => c.id === activeItemRef.clauseId)
                  ?.items.find((i) => i.id === activeItemRef.itemId)
                  ?.services?.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 truncate w-40">
                          {s.description}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.quantity}x de R$ {s.unitValue.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-indigo-600">
                          R$ {s.totalValue.toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            activeItemRef &&
                            removeServiceFromItem(
                              activeItemRef.clauseId,
                              activeItemRef.itemId,
                              s.id,
                            )
                          }
                          className="text-red-400"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* FORMULÁRIO DE ADIÇÃO */}
            <div className="bg-white p-4 rounded-2xl border space-y-4 shadow-inner">
              <label className="block">
                <span className="text-xs font-bold text-slate-400">
                  DESCRIÇÃO
                </span>
                <Input
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ex: Instalação de luminária"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="text-xs font-bold text-slate-400">
                    VALOR UNIT.
                  </span>
                  <Input
                    type="number"
                    value={newService.unitValue || ""}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        unitValue: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </label>
                <label>
                  <span className="text-xs font-bold text-slate-400">QTD</span>
                  <Input
                    type="number"
                    value={newService.quantity || ""}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </label>
              </div>
              <Button
                onClick={handleAddServiceToItem}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="mr-2" /> ADICIONAR SERVIÇO
              </Button>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsServiceDrawerOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Ao salvar, vamos inserir no editor! (Lógica simplificada aqui)
                  setIsServiceDrawerOpen(false);
                }}
              >
                Concluir
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </View>
  );
}
