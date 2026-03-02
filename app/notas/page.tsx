// app/notas/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import SearchBar from "@/components/SearchBar";
import FAB from "@/components/ui/FAB";
import {
  Notebook,
  Plus,
  SquaresFour,
  Rows,
  Star,
  CaretRight,
} from "@phosphor-icons/react";
import "./Notas.css";

// Interface para garantir a tipagem das Notas Técnicas
interface NotaTecnica {
  id: string | number;
  title: string;
  clienteNome: string;
  important?: boolean;
  date?: string;
  content?: string;
}

export default function NotasLista() {
  const router = useRouter();

  // Utilizando o Generic <NotaTecnica> para tipar o retorno do hook
  const { data: notes } = useEASync<NotaTecnica>("notas");

  const [term, setTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Padrão Grid

  const filtered = notes.filter(
    (n) =>
      (n.title?.toLowerCase() || "").includes(term.toLowerCase()) ||
      (n.clienteNome?.toLowerCase() || "").includes(term.toLowerCase()),
  );

  return (
    <>
      <AppBar title="Notas Técnicas" backAction={() => router.push("/")} />

      <div className="flex items-center bg-[#f5f5f5] pr-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar notas..."
            onSearch={(val: string) => setTerm(val)}
            value={term}
          />
        </div>
        <View
          tag="btn-view-toggle"
          className="btn-view-toggle"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? <Rows size={20} /> : <SquaresFour size={20} />}
        </View>
      </div>

      <View tag="page" className="p-6 pb-24 bg-slate-50">
        <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
          {filtered.map((nota) => {
            const isImportant = nota.important === true;

            // ESTILO IMPORTANTE (ESTILO QUICKACTION DA HOME)
            if (isImportant) {
              return (
                <div
                  key={nota.id}
                  className="note-card-important flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                  onClick={() => router.push(`/notas/${nota.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="icon-wrapper">
                      <Star size={32} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        {nota.title}
                      </h3>
                      <p className="text-muted text-sm">{nota.clienteNome}</p>
                    </div>
                  </div>
                  <CaretRight size={20} weight="bold" className="opacity-50" />
                </div>
              );
            }

            // ESTILO PADRÃO (ESTILO MENUCARD DA HOME)
            return (
              <div
                key={nota.id}
                className={
                  viewMode === "grid"
                    ? "note-card-grid"
                    : "note-card-grid flex-row items-center justify-between"
                }
                onClick={() => router.push(`/notas/${nota.id}`)}
              >
                <div
                  className={
                    viewMode === "grid" ? "" : "flex items-center gap-4"
                  }
                >
                  <div className="icon-wrapper">
                    <Notebook size={28} weight="duotone" />
                  </div>
                  <div className={viewMode === "grid" ? "mt-2" : ""}>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">
                      {nota.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {nota.clienteNome}
                    </p>
                  </div>
                </div>
                {viewMode === "list" && (
                  <CaretRight size={18} className="text-slate-300" />
                )}
              </div>
            );
          })}
        </div>
      </View>

      <FAB
        hasBottomNav={true} // Adicione esta linha
        actions={[
          {
            icon: <Plus size={28} weight="bold" />,
            label: "Nova Nota",
            action: () => router.push("/notas/novo"),
          },
          {
            icon: <Plus size={28} weight="duotone" />,
            label: "Novo Membro",
            action: () => router.push("/equipe/editar"),
          },
        ]}
      />
      {/* <BottomNavbar /> */}
    </>
  );
}
