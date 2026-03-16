// app/clientes/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
// import SearchBar from "@/components/SearchBar";
import EntityToolbar from "@/components/EntityToolbar";
import { useSearch } from "@/hooks/useSearch";
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
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import DeleteClientModal from "./components/DeleteClientModal";
import EntitySortFilter from "@/components/EntitySortFilter";

// Interface alinhada com as novas definições (English/CamelCase)
interface Cliente {
  id: string;
  name: string; // Novo padrão
  document?: string; // Novo padrão
  gender?: string;
  photo?: string;
  whatsapp?: string;
  email?: string;
  city?: string; // Novo padrão
  neighborhood?: string; // Novo padrão
  // Fallbacks para compatibilidade com dados antigos do GS
  "Nome Completo"?: string;
  "CPF / CNPJ"?: string;
  Cidade?: string;
  Bairro?: string;
  [key: string]: any;
}

export default function ClientesLista() {
  const router = useRouter();

  const {
    data: allClients,
    pull: syncClients,
    save: saveClient,
  } = useEASync<Cliente>("clientes");

  // USANDO O HOOK da searchbar
  const sortOptions = [
    { label: "Mais recentes", value: "recent" },
    { label: "Nome (A-Z)", value: "name" },
    { label: "Mais antigos", value: "oldest" },
  ];

  const { searchTerm, setSearchTerm, sort, filter, updatePrefs, filteredData } =
    useSearch(allClients, ["name", "Nome Completo", "document"], "clientes");

  const [term, setTerm] = useState("");

  /* Estados para o Modal de Exclusão */
  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveClient);

  // Helper para extrair o nome de forma segura (Novo ou Antigo)
  const getClientName = (c: Cliente) =>
    c.name || c["Nome Completo"] || "Sem Nome";

  // Helper para extrair o documento
  const getClientDoc = (c: Cliente) => c.document || c["CPF / CNPJ"] || "";

  const filtered = allClients.filter((c) => {
    const searchTerm = term.trim().toLowerCase();
    const name = getClientName(c).toLowerCase();
    const doc = String(getClientDoc(c));

    return name.includes(searchTerm) || doc.includes(searchTerm);
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

  return (
    <>
      <AppBar title="Clientes" />

      <Page
        tag="clients-list"
        hasBottomNavBar={true}
        bg="#f5f5f5"
        pd="0 0 90px 0"
      >
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar cliente..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            showAction={true}
            actionIcon={
              <EntitySortFilter
                sortOptions={sortOptions}
                currentSort={sort}
                onSortChange={(val) => updatePrefs(val, filter)}
              />
            }
          />
        </header>

        <View tag="clients-container" className="flex flex-col gap-2 py-4">
          {filteredData.map((c) => {
            const currentName = getClientName(c);

            return (
              <div
                key={c.id}
                className="client-card-wrapper"
                style={{ position: "relative", padding: "0 1rem" }}
              >
                <ClientCard
                  client={{
                    ...c,
                    name: currentName,
                    cidade: c.city || c["Cidade"] || "Cidade não informada",
                    bairro: c.neighborhood || c["Bairro"] || "",
                  }}
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
                              onClick={() => {
                                handleDeleteRequest(c.id, currentName);
                              }}
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
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </View>
      </Page>

      <FAB actions={fabConfig} hasBottomNav={true} />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <DeleteClientModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        client={itemToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
