"use client";

import { BudgetService } from "@/lib/types/budget";
import {
  Plus,
  Trash,
  ListPlus,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TipTapEditor from "../editor/TipTapEditor";

interface ClauseManagerProps {
  clauses: any[];
  onClausesChange: (newClauses: any[]) => void;
}

export default function ClauseManager({
  clauses,
  onClausesChange,
}: ClauseManagerProps) {
  const addClause = () => {
    const newClause = {
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
    field: string,
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
    <div className="space-y-8">
      {clauses.map((clause, idx) => (
        <Card
          key={clause.id}
          className="border-none shadow-xl rounded-3xl overflow-hidden bg-white"
        >
          <header className="bg-indigo-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-white/10 text-white w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </span>
              <input
                className="bg-transparent border-none text-white font-bold placeholder:text-white/30 focus:outline-none w-full"
                placeholder="Título da Cláusula (Ex: Iluminação)"
                value={clause.titulo}
                onChange={(e) => updateClauseTitle(clause.id, e.target.value)}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white/40 hover:text-red-400"
              onClick={() => removeClause(clause.id)}
            >
              <Trash size={20} />
            </Button>
          </header>

          <CardContent className="p-4 space-y-6 bg-slate-50/50">
            {clause.items.map((item: any, iIdx: number) => (
              <div
                key={item.id}
                className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <Input
                    placeholder="Subtítulo (Ex: Cozinha)"
                    className="border-none bg-slate-50 font-bold text-indigo-900 rounded-xl h-10 w-2/3"
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-300 hover:text-red-500"
                    onClick={() => removeItem(clause.id, item.id)}
                  >
                    Remover Item
                  </Button>
                </div>

                <TipTapEditor
                  value={item.content}
                  onChange={(val) =>
                    updateItem(clause.id, item.id, "content", val)
                  }
                />
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed border-2 border-slate-200 rounded-2xl h-14 text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
              onClick={() => addItem(clause.id)}
            >
              <ListPlus size={20} className="mr-2" />
              Adicionar Subcláusula
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={addClause}
        className="w-full bg-white text-indigo-600 border-2 border-indigo-100 h-16 rounded-3xl font-bold shadow-lg hover:bg-indigo-50"
      >
        <Plus size={24} weight="bold" className="mr-2" />
        NOVA CLÁUSULA PRINCIPAL
      </Button>
    </div>
  );
}
