// app/orcamentos/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
import BudgetShareMenu from "@/components/orcamentos/components/BudgetShareMenu";
import BudgetCard from "@/components/layout/BudgetCard";
import SearchBar from "@/components/SearchBar";
import {
  FilePlus,
  ArrowsCounterClockwise,
  Trash,
  CloudCheck,
  ArrowsClockwise,
  DotsThreeOutlineVertical,
  PencilSimple,
  Copy,
  ShareNetwork,
} from "@phosphor-icons/react";
import View from "@/components/layout/View";
import { CID, getCleanDate } from "@/utils/helpers";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- Interfaces para Tipagem ---

interface ClienteCache {
  id: string | number;
  name: string;
  gender: string;
}

interface Orcamento {
  id: string | number;
  cliente: {
    name: string;
  };
  docTitle: {
    text: string;
    emissao: string;
    validade: string;
    subtitle?: string;
  };
  servicos?: any[];
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
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: orcamentos,
    save: saveOrcamento,
    pull: syncOrcamentos,
  } = useEASync<Orcamento>("orcamentos");

  const { data: clientes } = useEASync<ClienteCache>("clientes");

  const handleOpenShare = (orc: Orcamento) => {
    setShareData({ open: true, orc });
  };

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  const filteredOrcamentos = orcamentos
    .filter(
      (orc) =>
        (orc.cliente?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (orc.docTitle?.text || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
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

  const handleDelete = async (id: string | number, name: string) => {
    const confirm = window.confirm(`Excluir orçamento de ${name}?`);
    if (confirm) {
      await saveOrcamento({ id }, "delete");
    }
  };

  const handleEdit = (orc: Orcamento) => {
    router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${orc.id}`);
  };

  const handleDuplicate = async (orc: Orcamento) => {
    const duplicated = { ...orc, id: "EA-" + Date.now() };
    await saveOrcamento(duplicated, "create");
  };

  return (
    <>
      <AppBar title="Orçamentos" />

      {/* Adicionando a SearchBar logo abaixo da AppBar */}
      <SearchBar
        placeholder="Buscar por cliente ou título..."
        onSearch={(val: string) => setSearchTerm(val)}
        value={searchTerm}
      />

      {shareData.orc && (
        <BudgetShareMenu
          open={shareData.open}
          onOpenChange={(open: boolean) => setShareData({ ...shareData, open })}
          budgetRef={hiddenBudgetRef}
          data={shareData.orc}
          clientName={shareData.orc.cliente.name}
          budgetTitle={shareData.orc.docTitle.text}
        />
      )}

      {/* Container invisível para a Ref do ShareMenu */}
      <div
        ref={hiddenBudgetRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
      />

      <View tag="budgets" className="dash-page">
        <main className="orcamento-list px-0 py-4">
          {filteredOrcamentos.length > 0 ? (
            filteredOrcamentos.map((orc) => {
              const isTemp = String(orc.id).startsWith("TEMP_");

              // Buscamos os dados completos do cliente no cache de clientes
              const clientData = clientes.find(
                (c) =>
                  String(c.name).toLowerCase() ===
                  String(orc.cliente.name).toLowerCase(),
              );

              return (
                <div
                  key={orc.id}
                  className="client-card-wrapper mb-3"
                  style={{ position: "relative" }}
                >
                  {/* Aplicando a mesma classe de círculo e estilo de imagem */}
                  <BudgetCard
                    orc={orc}
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
                            className="w-48 p-0 bg-white shadow-xl border-none"
                            align="end"
                          >
                            <View tag="budget-vmenu" className="flex flex-col">
                              <View
                                tag="budget-vmenu-btn"
                                onClick={() => handleOpenShare(orc)}
                                style={menuItemStyle}
                              >
                                <ShareNetwork
                                  size={18}
                                  color="#29f"
                                  weight="duotone"
                                />{" "}
                                Compartilhar
                              </View>
                              <View
                                onClick={() => handleEdit(orc)}
                                style={menuItemStyle}
                              >
                                <PencilSimple size={18} weight="duotone" />{" "}
                                Editar
                              </View>
                              <View
                                onClick={() => handleDuplicate(orc)}
                                style={menuItemStyle}
                              >
                                <Copy size={18} weight="duotone" /> Duplicar
                              </View>
                              <View
                                onClick={() =>
                                  handleDelete(orc.id, orc.cliente.name)
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
      </View>

      <FAB actions={fabConfig} hasBottomNav={true} />
      {/* <BottomNavbar /> */}
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
