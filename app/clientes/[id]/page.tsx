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
  PhoneTransferIcon,
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";
import { toast } from "sonner";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "./styles.css";
import Image from "next/image";

// Interfaces para garantir tipagem estrita
interface Cliente {
  id: string | number;
  name: string;
  photo?: string;
  gender?: string;
  cidade?: string;
  whatsapp?: string;
  email?: string;
  rua?: string;
  num?: string;
  bairro?: string;
}

interface Orcamento {
  id: string | number;
  cliente?: {
    name: string;
  };
  docTitle: {
    emissao: string | Date;
    text: string;
  };
}

interface Nota {
  id: string | number;
  clienteId: string | number;
  date: string;
  title: string;
}

export default function ClientePerfil() {
  const params = useParams();
  const clientId = params?.id;
  const router = useRouter();

  // Hooks integrados com o nosso motor de sincronização com Generics
  const { data: clients, save: saveClient } = useEASync<Cliente>("clientes");
  const { data: orcamentos } = useEASync<Orcamento>("orcamentos");
  const { data: notes } = useEASync<Nota>("notas");

  const [client, setClient] = useState<Cliente | null>(null);

  // Busca o cliente específico no cache local/remoto
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find((c) => String(c.id) === String(clientId));
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  if (!client) return <View tag="page">Carregando perfil...</View>;

  // Filtra orçamentos e notas vinculados a este cliente
  const historicoOrcamentos = orcamentos.filter(
    (o) =>
      String(o.cliente?.name).toLowerCase() ===
      String(client.name).toLowerCase(),
  );
  const historicoNotas = notes.filter(
    (n) => String(n.clienteId) === String(client.id),
  );

  // handler para deletar o cliente
  const handleDelete = async () => {
    if (confirm("Excluir este cliente permanentemente?")) {
      const res = (await saveClient({ id: client.id }, "delete")) as {
        success?: boolean;
      };
      router.replace("/clientes"); // Substitui a pilha para não voltar pro perfil deletado
    }
  };

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  const clientAvatar =
    client.photo ||
    AVATARS[client.gender as keyof typeof AVATARS] ||
    AVATARS.masc;

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
              <View className="flex flex-col">
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
              </View>
            </PopoverContent>
          </Popover>
        }
      />

      <View
        tag="client-page"
        className="client-perfil-page bg-[#e5e5e5_!important] min-h-[95dvh]"
      >
        {/* SEÇÃO HEADER: AVATAR E NOME */}
        <View
          tag="avatar-section"
          className="relative min-h-[300px] text-center bg-[var(--sv-sodalita)] text-white overflow-hidden"
        >
          {/* <View className="avatar-circle relative w-24 h-24 z-30"> */}
          {/*   <Image */}
          {/*     src={clientAvatar} */}
          {/*     alt={client.name} */}
          {/*     fill */}
          {/*     className="object-cover" */}
          {/*   /> */}
          {/* </View> */}
          <View
            tag="perfil-pic"
            className="absolute mt-[-2px] top-0 left-0 w-full h-full z-10 overflow-hidden border-none outline-none ring-0 bg-transparent"
          >
            <Image
              src={clientAvatar}
              alt={client.name}
              fill
              className="object-cover border-none"
              style={{ border: "none", outline: "none" }}
              priority
            />
          </View>
          <View
            tag="client-desc"
            className="absolute bottom-0 left-0 z-20 w-full py-4 pt-6 px-6 bg-linear-to-b from-transparent to-[#e5e5e5]"
          >
            <View tag="descs" className="flex-1">
              <h3 className="font-thunder text-2xl capitalize">
                {client.name}
              </h3>
              <p className="opacity-80 text-sm">{client.cidade}</p>
            </View>
            <View
              tag="contact-shortcuts"
              className="flex items-center justify-center flex-[.8] gap-3"
            >
              {[
                {
                  icon: (
                    <WhatsappLogo
                      size={20}
                      weight="duotone"
                      className="text-green-500"
                    />
                  ),
                  color: "",
                },
                {
                  icon: (
                    <PhoneTransferIcon
                      size={20}
                      weight="duotone"
                      className="text-gray-800"
                    />
                  ),
                  color: "",
                },
                {
                  icon: (
                    <EnvelopeSimple
                      size={20}
                      weight="duotone"
                      className="text-blue-500"
                    />
                  ),
                  color: "",
                },
              ].map((o, i) => (
                <View
                  tag="contact-btn"
                  key={i}
                  className="bg-white text-gray-800 p-3 w-11 h-11 rounded-full aspect-square"
                >
                  {o.icon}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View tag="page-content" style={{ marginTop: "-20px" }}>
          {/* CARD: INFORMAÇÕES DE CONTATO */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">DADOS DE CONTATO</View>
            <View tag="card-ea-body">
              <View className="info-row">
                <WhatsappLogo
                  size={20}
                  weight="duotone"
                  className="text-green-500"
                />
                <span>{client.whatsapp || "Não informado"}</span>
              </View>
              <Divider spacing="1.5rem" color="#f0f0f0" />
              <View className="info-row">
                <EnvelopeSimple
                  size={20}
                  weight="duotone"
                  className="text-blue-500"
                />
                <span>{client.email || "Não informado"}</span>
              </View>
              <Divider spacing="1.5rem" color="#f0f0f0" />
              <View className="info-row">
                <MapPin size={20} weight="duotone" className="text-red-500" />
                <span className="text-xs">
                  {client.rua}, {client.num} - {client.bairro}
                </span>
              </View>
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
                    <View
                      className="history-item"
                      onClick={() => router.push(`/orcamentos/${orc.id}`)}
                    >
                      <span className="date">
                        {getCleanDate(String(orc.docTitle.emissao))}
                      </span>
                      <p className="title">{orc.docTitle.text}</p>
                    </View>
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
                    <View
                      className="history-item"
                      onClick={() => router.push(`/notas/${n.id}`)}
                    >
                      <span className="date">
                        {new Date(n.date).toLocaleDateString("pt-BR")}
                      </span>
                      <p className="title">{n.title}</p>
                    </View>
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
