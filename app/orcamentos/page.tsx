// app/orcamentos/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
import BudgetShareMenu from "@/components/orcamentos/BudgetShareMenu";
import BudgetCard from "@/components/layout/BudgetCard";
import EntityToolbar from "@/components/EntityToolbar";
import { useSearch } from "@/hooks/useSearch";
import {
  FilePlus,
  ArrowsCounterClockwise,
  Trash,
  DotsThreeOutlineVertical,
  PencilSimple,
  ShareNetwork,
} from "@phosphor-icons/react";
import View from "@/components/layout/View";
import { CID } from "@/utils/helpers";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Page from "@/components/layout/Page";
import DeleteBudgetModal from "./components/DeleteBudgetModal";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import EntitySortFilter from "@/components/EntitySortFilter";

// --- Interfaces para Tipagem Atualizadas ---

interface ClienteCache {
  id: string | number;
  name: string;
  gender: string;
}

interface Orcamento {
  id: string | number;
  // Nomes novos (camelCase)
  clientName?: string;
  documentTitle?: string;
  issueDate?: string;
  // Fallbacks para compatibilidade com dados antigos
  "Nome Cliente"?: string;
  "Título Doc"?: string;
  cliente?: { name: string };
  docTitle?: { text: string; emissao: string };
  services?: any[];
}

interface ShareState {
  open: boolean;
  orc: Orcamento | null;
}

export default function Budgets() {
  const [shareData, setShareData] = useState<ShareState>({
    open: false,
    orc: null,
  });
  const hiddenBudgetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    data: orcamentos,
    save: saveOrcamento,
    pull: syncOrcamentos,
  } = useEASync<Orcamento>("orcamentos");

  // searchbar
  const budgetSort = [
    { label: "Data de Emissão", value: "recent" },
    { label: "Título", value: "name" },
  ];

  const { searchTerm, setSearchTerm, sort, filter, updatePrefs, filteredData } =
    useSearch(
      orcamentos,
      ["clientName", "documentTitle", "Nome Cliente"],
      "orcamentos",
    );

  // INTEGRANDO O HOOK DE DELEÇÃO
  // não preciso de redirect aqui (onSuccess vazio ou para dar um toast)
  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveOrcamento);

  const { data: clientes } = useEASync<ClienteCache>("clientes");

  // Helper para normalizar o nome do cliente na listagem (Novo vs Antigo)
  const getClientName = (orc: Orcamento) =>
    orc.clientName ||
    orc.cliente?.name ||
    orc["Nome Cliente"] ||
    "Cliente não identificado";

  // Helper para normalizar o título do documento
  const getDocTitle = (orc: Orcamento) =>
    orc.documentTitle ||
    orc.docTitle?.text ||
    orc["Título Doc"] ||
    "Sem título";

  const filteredOrcamentos = orcamentos
    .filter((orc) => {
      const name = getClientName(orc).toLowerCase();
      const title = getDocTitle(orc).toLowerCase();
      const term = searchTerm.toLowerCase();

      return name.includes(term) || title.includes(term);
    })
    .reverse();

  const fabConfig = [
    {
      icon: <FilePlus size={28} weight="duotone" />,
      label: "Novo Orçamento",
      action: () => router.push("/orcamentos/novo"),
    },
    {
      icon: <ArrowsCounterClockwise size={28} weight="duotone" />,
      label: "Sincronizar",
      action: () => syncOrcamentos(),
    },
  ];

  const handleEdit = (orc: Orcamento) => {
    router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${orc.id}`);
  };

  return (
    <>
      <AppBar title="Orçamentos" />

      {shareData.orc && (
        <BudgetShareMenu
          open={shareData.open}
          onOpenChange={(open: boolean) => setShareData({ ...shareData, open })}
          budgetRef={hiddenBudgetRef}
          data={shareData.orc}
          clientName={getClientName(shareData.orc)}
          budgetTitle={getDocTitle(shareData.orc)}
        />
      )}

      {/* <div
        ref={hiddenBudgetRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
      /> */}

      <Page tag="budgets" bg="#f5f5f5">
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar orçamento..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            showAction={true}
            actionIcon={
              <EntitySortFilter
                sortOptions={budgetSort}
                currentSort={sort}
                onSortChange={(val) => updatePrefs(val, filter)}
                filterLabel="Status"
                filterOptions={[
                  { label: "Todos", value: "all" },
                  { label: "Vencidos", value: "expired" },
                ]}
              />
            }
          />
        </header>
        <main
          className="flex flex-col px-0 py-4 gap-2"
          style={{ paddingBottom: "190px" }}
        >
          {filteredOrcamentos.length > 0 ? (
            filteredData.map((orc) => {
              const isTemp = String(orc.id).startsWith("TEMP_");
              const currentClientName = getClientName(orc);
              const currentTitle = getDocTitle(orc);

              // Busca no cache de clientes para o avatar
              const clientData = clientes?.find((c) => {
                // Verificamos se 'c' existe e se 'c.name' existe antes de dar toLowerCase()
                const cName = c?.name || (c as any)?.["Nome"] || "";
                return cName.toLowerCase() === currentClientName.toLowerCase();
              });

              return (
                <div
                  key={orc.id}
                  className="client-card-wrapper"
                  style={{ position: "relative", padding: "0 1rem" }}
                >
                  <BudgetCard
                    orc={{
                      id: orc.id,
                      clientName: currentClientName,
                      documentTitle: getDocTitle(orc),
                      issueDate:
                        orc.issueDate ||
                        orc.docTitle?.emissao ||
                        (orc as any)["Emissão"] ||
                        new Date().toISOString(),
                    }}
                    clientData={clientData}
                    onClick={() => router.push(`/orcamentos/${orc.id}`)}
                    options={
                      !isTemp && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <View
                              tag="vmenu"
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <DotsThreeOutlineVertical
                                size={24}
                                weight="duotone"
                              />
                            </View>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-48 p-0 bg-[#f5f5f5] shadow-xl border-none"
                            align="end"
                          >
                            <View tag="budget-vmenu" className="flex flex-col">
                              <View
                                onClick={() => handleEdit(orc)}
                                style={menuItemStyle}
                              >
                                <PencilSimple size={18} weight="duotone" />{" "}
                                Editar
                              </View>
                              <View
                                onClick={() =>
                                  handleDeleteRequest(orc.id, currentTitle)
                                }
                                style={{
                                  ...menuItemStyle,
                                  color: "#ef4444",
                                  borderTop: "1px solid #f1f5f9",
                                }}
                              >
                                <Trash size={18} weight="duotone" /> Excluir
                              </View>
                            </View>
                          </PopoverContent>
                        </Popover>
                      )
                    }
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 opacity-40">
              <ShareNetwork size={64} weight="thin" className="mx-auto mb-2" />
              <p>Nenhum orçamento encontrado.</p>
            </div>
          )}
        </main>
      </Page>

      <FAB actions={fabConfig} hasBottomNav={true} />

      {/* RENDERIZANDO O MODAL DE ORÇAMENTO */}
      <DeleteBudgetModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        budget={
          itemToDelete
            ? {
                id: itemToDelete.id,
                documentTitle: itemToDelete.name, // O hook salva o título no campo 'name'
                clientName: "este cliente", // Opcional: buscar o nome do cliente no loop se quiser ser mais específico
              }
            : null
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  padding: "12px 15px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  border: "none",
  background: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  color: "#444",
};
