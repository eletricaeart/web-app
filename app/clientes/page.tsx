"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import SearchBar from "@/components/SearchBar";
import ClientCard from "@/components/layout/ClientCard";
import {
  ArrowsClockwise,
  DotsThreeOutlineVertical,
  Trash,
  UserPlus,
  PencilSimple,
} from "@phosphor-icons/react";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* styles */
import "./Clientes.css";
import Page from "@/components/layout/Page";

// Interface alinhada com as definições anteriores para evitar 'any'
interface Cliente {
  id: string;
  name: string;
  doc?: string;
  gender?: string;
  photo?: string;
  whatsapp?: string;
  email?: string;
  cidade?: string;
  [key: string]: any; // Flexibilidade para outras propriedades do motor de busca
}

export default function ClientesLista() {
  const router = useRouter();

  // Tipagem do hook useEASync com a interface Cliente
  const {
    data: allClients,
    pull: syncClients,
    save: saveClient,
  } = useEASync<Cliente>("clientes");

  const [term, setTerm] = useState("");

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  const handleDeleteQuick = async (id: string, name: string) => {
    if (window.confirm(`Excluir ${name}?`)) {
      // O saveClient agora reconhece o payload baseado na interface
      await saveClient({ id }, "delete");
    }
  };

  const filtered = allClients.filter((c) => {
    const searchTerm = term.trim().toLowerCase();
    const nameMatches = c.name
      ? c.name.toLowerCase().includes(searchTerm)
      : false;
    const docMatches = c.doc ? String(c.doc).includes(term) : false;
    return nameMatches || docMatches;
  });

  const fabConfig = [
    {
      icon: <UserPlus size={28} weight="duotone" />,
      label: "Novo Cliente",
      action: () => router.push("/clientes/novo"),
    },
    {
      icon: <ArrowsClockwise size={28} weight="duotone" />,
      label: "Sincronizar",
      action: () => syncClients(),
    },
  ];

  return (
    <>
      <AppBar title="Clientes" />

      <SearchBar
        placeholder="Buscar cliente por nome ou documento..."
        onSearch={(val: string) => setTerm(val)}
        value={term}
      />

      <Page
        tag="clients-list"
        hasBottomNavBar={true}
        bg="#f5f5f5"
        pd="0 0 90px 0"
      >
        <View tag="clients-container" className="flex flex-col gap-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="client-card-wrapper"
              style={{ position: "relative", padding: "0 1rem" }}
            >
              <ClientCard
                client={c}
                onClick={() => router.push(`/clientes/${c.id}`)}
                options={
                  <div className="options-container">
                    <Popover>
                      <PopoverTrigger asChild>
                        <View
                          tag="vmenu-btn"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#777",
                            cursor: "pointer",
                          }}
                        >
                          <DotsThreeOutlineVertical
                            size={24}
                            weight="duotone"
                          />
                        </View>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-40 p-0 bg-white"
                        style={{
                          border: "none",
                          boxShadow: "#e5e5e5 0 0 10px 2px",
                        }}
                        align="end"
                        onOpenAutoFocus={(e) => {
                          e?.preventDefault();
                        }}
                      >
                        <div className="flex flex-col">
                          <button
                            className="menu-item"
                            onClick={() =>
                              router.push(`/clientes/novo?id=${c.id}`)
                            }
                            style={menuItemStyle}
                          >
                            <PencilSimple size={18} weight="duotone" /> Editar
                          </button>
                          <button
                            className="menu-item delete"
                            onClick={() => handleDeleteQuick(c.id, c.name)}
                            style={{
                              ...menuItemStyle,
                              color: "#ff4444",
                              borderTop: "1px solid #f5f5f5",
                            }}
                          >
                            <Trash size={18} weight="duotone" /> Excluir
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                }
              />
            </div>
          ))}
        </View>
      </Page>

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
