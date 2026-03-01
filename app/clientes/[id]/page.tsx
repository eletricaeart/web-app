// app/clientes/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import Divider from "@/components/Divider";
import {
  Pen,
  Trash,
  FilePlus,
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
  DotsThreeOutlineVertical,
  Notebook,
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";
import { toast } from "sonner";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "../Clientes.css";

export default function ClientePerfil() {
  const { id: clientId } = useParams();
  const router = useRouter();

  // Hooks integrados com o nosso motor de sincronização
  const { data: clients, save: saveClient } = useEASync("clientes");
  const { data: orcamentos } = useEASync("orcamentos");
  const { data: notes } = useEASync("notas");

  const [client, setClient] = useState<any>(null);

  // Busca o cliente específico no cache local/remoto
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find((c: any) => String(c.id) === String(clientId));
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  if (!client) return <View tag="page">Carregando perfil...</View>;

  // Filtra orçamentos e notas vinculados a este cliente
  const historicoOrcamentos = orcamentos.filter(
    (o: any) =>
      String(o.cliente?.name).toLowerCase() ===
      String(client.name).toLowerCase(),
  );
  const historicoNotas = notes.filter(
    (n: any) => String(n.clienteId) === String(client.id),
  );

  // handler para deletar o cliente
  const handleDelete = async () => {
    if (confirm("Excluir este cliente permanentemente?")) {
      await saveClient({ id: client.id }, "delete");
      router.replace("/clientes"); // Substitui a pilha para não voltar pro perfil deletado
    }
  };

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  return (
    <>
      <AppBar
        title="Perfil do Cliente"
        backAction={() => router.push("/clientes")}
        options={
          <Popover>
            <PopoverTrigger asChild>
              <button
                style={{ background: "none", border: "none", color: "white" }}
              >
                <DotsThreeOutlineVertical size={26} weight="bold" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-0 bg-white shadow-xl border-none z-[10000] overflow-hidden"
              align="end"
            >
              <div className="flex flex-col">
                {[
                  {
                    label: " Editar Perfil",
                    icon: <Pen size={20} color="#29f" weight="duotone" />,
                    option: () => router.push(`/clientes/novo?id=${client.id}`),
                  },
                  {
                    option: () =>
                      router.push(`/orcamentos/novo?clienteId=${client.id}`),
                    icon: <FilePlus size={20} color="#29f" weight="duotone" />,
                    label: "Novo Orçamento",
                  },
                  {
                    option: () =>
                      router.push(`/notas/novo?clienteId=${client.id}`),
                    icon: <Notebook size={20} color="#29f" weight="duotone" />,
                    label: "Nova Nota Técnica",
                  },
                  {
                    className:
                      "menu-item-pop w-full p-2 flex items-center cursor-pointer text-red-500 border-t border-slate-300 bg-red-100",
                    option: () => {
                      handleDelete();
                    },
                    icon: <Trash size={20} color="#932" weight="duotone" />,
                    label: "Excluir Cliente",
                  },
                ].map((O, i) => (
                  <View
                    tag="appbar-btn"
                    className={
                      O?.className
                        ? O.className
                        : "menu-item-pop w-full p-2 flex items-center cursor-pointer"
                    }
                    key={i}
                    onClick={() => {
                      O.option();
                    }}
                  >
                    <span className="w-full flex p-2 items-center gap-4">
                      {O.icon} {O.label}
                    </span>
                  </View>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        }
      />

      <View tag="page" className="client-perfil-page">
        {/* SEÇÃO HEADER: AVATAR E NOME */}
        <div className="avatar-section">
          <div className="avatar-circle">
            <img
              src={
                AVATARS[client.gender as keyof typeof AVATARS] || AVATARS.masc
              }
              alt={client.name}
            />
          </div>
          <h2 className="font-thunder text-2xl uppercase">{client.name}</h2>
          <p className="opacity-80 text-sm">{client.cidade}</p>
        </div>

        <View tag="page-content" style={{ marginTop: "-20px" }}>
          {/* CARD: INFORMAÇÕES DE CONTATO */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">DADOS DE CONTATO</View>
            <View tag="card-ea-body">
              <div className="info-row">
                <WhatsappLogo
                  size={20}
                  weight="duotone"
                  className="text-green-500"
                />
                <span>{client.whatsapp || "Não informado"}</span>
              </div>
              <Divider spacing="1.5rem" color="#f0f0f0" />
              <div className="info-row">
                <EnvelopeSimple
                  size={20}
                  weight="duotone"
                  className="text-blue-500"
                />
                <span>{client.email || "Não informado"}</span>
              </div>
              <Divider spacing="1.5rem" color="#f0f0f0" />
              <div className="info-row">
                <MapPin size={20} weight="duotone" className="text-red-500" />
                <span className="text-xs">
                  {client.rua}, {client.num} - {client.bairro}
                </span>
              </div>
            </View>
          </View>

          {/* SEÇÃO: HISTÓRICO DE ORÇAMENTOS */}
          <View tag="card-ea-client">
            <View
              tag="card-ea-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              ORÇAMENTOS
              <FilePlus
                size={20}
                onClick={() => router.push("/orcamentos/novo")}
              />
            </View>
            <View tag="card-ea-body">
              {historicoOrcamentos.length > 0 ? (
                historicoOrcamentos.map((orc, i) => (
                  <React.Fragment key={orc.id}>
                    <div
                      className="history-item"
                      onClick={() => router.push(`/orcamentos/${orc.id}`)}
                    >
                      <span className="date">
                        {getCleanDate(orc.docTitle.emissao)}
                      </span>
                      <p className="title">{orc.docTitle.text}</p>
                    </div>
                    {i < historicoOrcamentos.length - 1 && (
                      <Divider spacing="1rem" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <p className="empty-text">
                  Nenhum orçamento para este cliente.
                </p>
              )}
            </View>
          </View>

          {/* SEÇÃO: HISTÓRICO DE NOTAS TÉCNICAS */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">NOTAS TÉCNICAS</View>
            <View tag="card-ea-body">
              {historicoNotas.length > 0 ? (
                historicoNotas.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <div
                      className="history-item"
                      onClick={() => router.push(`/notas/${n.id}`)}
                    >
                      <span className="date">
                        {new Date(n.date).toLocaleDateString("pt-BR")}
                      </span>
                      <p className="title">{n.title}</p>
                    </div>
                    {i < historicoNotas.length - 1 && (
                      <Divider spacing="1rem" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <p className="empty-text">Nenhuma nota vinculada.</p>
              )}
            </View>
          </View>

          <button
            className="btn-delete-full w-full p-4 mt-4 text-red-500 text-sm font-bold flex items-center justify-center gap-2"
            onClick={async () => {
              if (
                confirm(
                  "Deseja realmente excluir este cliente permanentemente?",
                )
              ) {
                await saveClient({ id: client.id }, "delete");
                router.push("/clientes");
              }
            }}
          >
            <Trash size={20} /> EXCLUIR CLIENTE
          </button>
        </View>
      </View>
    </>
  );
}
