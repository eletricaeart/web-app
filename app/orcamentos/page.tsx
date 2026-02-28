"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
// import BottomNavBar from "@/components/layout/BottomNavBar";
// import SearchBar from "@/components/SearchBar/SearchBar";
// import BudgetShareMenu from "@/components/orcamentos/components/BudgetShareMenu";
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

/* styles */
// import "@/styles/Budget.css";

export default function Budgets() {
  const [shareData, setShareData] = useState({ open: false, orc: null });
  const hiddenBudgetRef = useRef(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenShare = (orc: any) => {
    setShareData({ open: true, orc });
  };

  const {
    data: orcamentos,
    save: saveOrcamento,
    pull: syncOrcamentos,
  } = useEASync("orcamentos");

  const { data: clientes } = useEASync("clientes");

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  const filteredOrcamentos = orcamentos
    .filter(
      (orc: any) =>
        orc.cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orc.docTitle.text.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .reverse();

  const fabConfig = [
    {
      icon: <FilePlus size={28} weight="duotone" />,
      label: "Novo Orçamento",
      action: () => router.push("/novo-orcamento"),
    },
    {
      icon: <ArrowsCounterClockwise size={28} weight="duotone" />,
      label: "Sincronizar",
      action: () => syncOrcamentos(),
    },
  ];

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Excluir orçamento de ${name}?`);
    if (confirm) {
      await saveOrcamento({ id }, "delete");
    }
  };

  const handleEdit = (orc: any) => {
    router.push(`/novo-orcamento?natabiruta=${CID()}&id=${orc.id}`);
  };

  const handleDuplicate = async (orc: any) => {
    const duplicated = { ...orc, id: "EA-" + Date.now() };
    await saveOrcamento(duplicated, "create");
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
          clientName={shareData.orc.cliente.name}
          budgetTitle={shareData.orc.docTitle.text}
        />
      )}

      <div style={{ position: "absolute", left: "-9999px", top: 0 }} />

      <View tag="budgets" className="dash-page">
        {/* <SearchBar */}
        {/*   placeholder="Buscar cliente ou serviço..." */}
        {/*   onSearch={(val: string) => setSearchTerm(val)} */}
        {/*   value={searchTerm} */}
        {/* /> */}

        <main className="orcamento-list">
          {filteredOrcamentos.length > 0 ? (
            filteredOrcamentos.map((orc: any) => {
              const isTemp = String(orc.id).startsWith("TEMP_");

              const clientData = clientes.find(
                (c: any) => c.name === orc.cliente.name,
              );

              const avatarSrc = clientData
                ? AVATARS[clientData.gender as "masc" | "fem"]
                : AVATARS.masc;

              return (
                <div key={orc.id} className="orcamento-card">
                  <div className="client-avatar-dash">
                    <img src={avatarSrc} alt="Avatar" />
                  </div>

                  <div
                    className="info-content"
                    onClick={() => router.push(`/orcamentos/${orc.id}`)}
                  >
                    <small className="text-[#999] flex items-center justify-end gap-3">
                      <span className="sync-status">
                        {isTemp ? (
                          <ArrowsClockwise
                            size={16}
                            weight="bold"
                            color="#ffab00"
                          />
                        ) : (
                          <CloudCheck
                            size={16}
                            weight="duotone"
                            color="#4caf50"
                          />
                        )}
                      </span>
                      {getCleanDate(orc.docTitle.emissao)}
                    </small>

                    <h3 className="capitalize">{orc.cliente.name}</h3>

                    <p className="text-blue-400">{orc.docTitle.text}</p>
                  </div>

                  <div className="options-container">
                    {!isTemp && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <View
                            tag="vmenu-btn"
                            className="btn-options"
                            style={{
                              background: "none",
                              border: "none",
                              outline: "none",
                              cursor: "pointer",
                              color: "#777",
                            }}
                          >
                            <DotsThreeOutlineVertical
                              size={24}
                              weight="duotone"
                            />
                          </View>
                        </PopoverTrigger>

                        <PopoverContent
                          className="w-48 p-0 bg-white"
                          style={{
                            border: "none",
                            boxShadow: "#e5e5e5 0 0 10px 2px",
                          }}
                          align="end"
                        >
                          <div className="flex flex-col">
                            <button
                              className="menu-item"
                              onClick={() => handleOpenShare(orc)}
                              style={menuItemStyle}
                            >
                              <ShareNetwork size={18} weight="duotone" />
                              Compartilhar
                            </button>

                            <button
                              className="menu-item"
                              onClick={() => handleEdit(orc)}
                              style={menuItemStyle}
                            >
                              <PencilSimple size={18} weight="duotone" />
                              Editar
                            </button>

                            <button
                              className="menu-item"
                              onClick={() => handleDuplicate(orc)}
                              style={menuItemStyle}
                            >
                              <Copy size={18} weight="duotone" />
                              Duplicar
                            </button>

                            <button
                              className="menu-item delete"
                              onClick={() =>
                                handleDelete(orc.id, orc.cliente.name)
                              }
                              style={{
                                ...menuItemStyle,
                                color: "#ff4444",
                                borderTop: "1px solid #f5f5f5",
                              }}
                            >
                              <Trash size={18} weight="duotone" />
                              Excluir
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#999",
              }}
            >
              Nenhum orçamento encontrado.
            </p>
          )}
        </main>
      </View>

      <FAB actions={fabConfig} hasBottomNav={true} />
      {/*<BottomNavBar />*/}
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
