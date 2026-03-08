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
  IdentificationCard,
  FileText,
  Note,
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";
import { Mask } from "@/utils/mask";
import { toast } from "sonner";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "./styles.css";
import Image from "next/image";
import EAAvatar from "@/components/ui/EA-Avatar";
import { ReactNodeView } from "@tiptap/react";
import Link from "next/link";

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

type Tab_ = "dados do cliente" | "orçamentos" | "notas";
interface Tab_prop {
  selectedTab: Tab_;
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

  const [activeTab, setActiveTab] = useState<Tab_>("dados do cliente");

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

  function tabHandler(selectedTab: Tab_) {
    setActiveTab(selectedTab);
  }

  return (
    <>
      <AppBar
        // title="Perfil do Cliente"
        title=" "
        backAction={() => router.push("/clientes")}
        transparent={true}
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
        className="client-perfil-page absolute top-0 w-full bg-mauve-50 min-h-[95dvh] pb-40"
      >
        {/* SEÇÃO HEADER: AVATAR E NOME */}
        <View
          tag="avatar-section"
          className="relative min-h-[150px] text-center bg-[var(--sv-sodalita)] text-white "
        >
          <View
            tag="perfil-pic"
            className="mt-[-2px] top-0 left-0 w-full h-full z-10 overflow-hidden border-none outline-none ring-0 bg-transparent"
          >
            <Image
              src={clientAvatar}
              alt={client.name}
              fill
              className="object-cover border-none"
              style={{ border: "none", outline: "none" }}
              priority
            />
            <View
              tag="client-links"
              className="absolute bottom-0 left-0 z-20 w-full py-4 pt-6 px-6 bg-linear-to-b from-transparent to-[#0003]"
            >
              <View
                tag="contact-shortcuts"
                className="flex items-center justify-end w-full flex-[.8] gap-3"
              >
                {[
                  {
                    icon: (
                      <Link
                        href={`https://wa.me/${client.whatsapp}?text=${"Olá!"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsappLogo
                          size={20}
                          weight="duotone"
                          className="text-green-500"
                        />
                      </Link>
                    ),
                    color: "",
                  },
                  {
                    icon: (
                      <Link
                        href={`tel:+${client.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PhoneTransferIcon
                          size={20}
                          weight="duotone"
                          className="text-gray-800"
                        />
                      </Link>
                    ),
                    color: "",
                  },
                  {
                    icon: (
                      <Link
                        href={`mailto:${client.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <EnvelopeSimple
                          size={20}
                          weight="duotone"
                          className="text-blue-500"
                        />
                      </Link>
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
        </View>

        <View
          tag="avatar-section-bottom"
          className=" flex relative w-full h-24"
        >
          <View
            tag="avatar-section-bottom-overlay"
            className="flex w-full px-4 py-0 absolute top-[-40%] gap-4 items-center justify-start"
          >
            <View className="avatar-circle w-24 h-24 z-30">
              {/*   <Image */}
              {/*     src={clientAvatar} */}
              {/*     alt={client.name} */}
              {/*     fill */}
              {/*     className="object-cover" */}
              {/*   /> */}
              <EAAvatar
                name={client.name}
                url={clientAvatar}
                w="full"
                h="full"
              />
            </View>
            <View tag="descs" className="flex-1 mt-4">
              <h3 className="font-thunder text-2xl text-slate-900 capitalize font-bold">
                {client.name}
              </h3>
              <p className="opacity-80 text-sm text-slate-400 capitalize font-bold">
                {client.cidade}
              </p>
            </View>
          </View>
        </View>

        {/* --- tabs --- */}
        <View
          tag={"Tabs"}
          className="grid grid-cols-3 text-sm bg-[var(--sv-sombra-azul)] rounded-[20px_20px_0_0] p-2"
        >
          <View
            tag="tab"
            className="grid place-items-center bg-[var(--sv-sodalita)] p-2 text-slate-50 rounded-[18px_0_0_0]"
            onClick={() => tabHandler("dados do cliente")}
          >
            Dados De Cliente
          </View>
          <View
            tag="tab"
            className="grid place-items-center bg-[var(--sv-sodalita)] p-2 text-slate-50"
            onClick={() => tabHandler("orçamentos")}
          >
            Orçamentos
          </View>
          <View
            tag="tab"
            className="grid place-items-center bg-[var(--sv-sodalita)] p-2 text-slate-50 rounded-[0_18px_0_0]"
            onClick={() => tabHandler("notas")}
          >
            Notas
          </View>
        </View>
        {/* --- end tabs --- */}

        <View tag="main-content" className="flex flex-col gap-4">
          {/* CARD: INFORMAÇÕES DE CONTATO */}
          {activeTab === "dados do cliente" && (
            <InfoSection
              title="Dados do contato"
              icon={<IdentificationCard size={18} weight="duotone" />}
            >
              <InfoItem
                icon={
                  <WhatsappLogo
                    size={25}
                    weight="duotone"
                    className="text-green-500"
                  />
                }
                txt={Mask.phone(client?.whatsapp as string | number)}
                fallTxt="Não informado"
              />
              <InfoItem
                icon={
                  <EnvelopeSimple
                    size={25}
                    weight="duotone"
                    className="text-blue-500"
                  />
                }
                txt={client.email}
                fallTxt=""
              />
              <InfoItem
                icon={
                  <MapPin size={25} weight="duotone" className="text-red-500" />
                }
                txt={`${client.rua}, ${client.num} - ${client.bairro}`}
                fallTxt=""
              />
            </InfoSection>
          )}

          {/* SEÇÃO: HISTÓRICO DE ORÇAMENTOS */}
          {activeTab === "orçamentos" && (
            <InfoSection
              title="Orçamentos"
              icon={<FileText size={18} weight="duotone" />}
              actionIcon={
                <FilePlus
                  size={20}
                  onClick={() => router.push("/orcamentos/novo")}
                />
              }
            >
              {historicoOrcamentos.length > 0 ? (
                historicoOrcamentos.map((orc, i) => (
                  <React.Fragment key={orc.id}>
                    <View
                      className="history-item"
                      onClick={() => router.push(`/orcamentos/${orc.id}`)}
                    >
                      <View tag="t" className="date text-gray-400">
                        {getCleanDate(String(orc.docTitle.emissao))}
                      </View>
                      <p className="title text-gray-600 font-medium">
                        {orc.docTitle.text}
                      </p>
                    </View>
                    {i < historicoOrcamentos.length - 1 && (
                      <Divider spacing="1rem" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <View tag="t" className="empty-text text-gray-600">
                  Nenhum orçamento para este cliente.
                </View>
              )}
            </InfoSection>
          )}

          {/* SEÇÃO: HISTÓRICO DE NOTAS TÉCNICAS */}
          {activeTab === "notas" && (
            <InfoSection
              title="Notas técnicas"
              icon={<Note size={18} weight="duotone" />}
            >
              {historicoNotas.length > 0 ? (
                historicoNotas.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <View
                      className="history-item"
                      onClick={() => router.push(`/notas/${n.id}`)}
                    >
                      <View tag="t" className="date">
                        {new Date(n.date).toLocaleDateString("pt-BR")}
                      </View>
                      <View tag="t" className="title">
                        {n.title}
                      </View>
                    </View>
                    {i < historicoNotas.length - 1 && (
                      <Divider spacing="1rem" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <View tag="t" className="empty-text text-gray-600">
                  Nenhuma nota vinculada.
                </View>
              )}
            </InfoSection>
          )}
        </View>
      </View>
    </>
  );
}

interface InfoSectionProps {
  // Aceita string ("Título") ou JSX (<span>Título</span>)
  title?: React.ReactNode;
  icon?: React.ReactElement;

  // Aceita especificamente um elemento (Ex: <UserIcon onClick/>)
  actionIcon?: React.ReactElement;

  // Padrão para qualquer conteúdo interno do componente
  children: React.ReactNode;

  // Exemplo de uma prop opcional (caso precise no futuro)
  className?: string;
}

function InfoSection({
  title,
  icon,
  actionIcon,
  children,
  className,
}: InfoSectionProps) {
  return (
    <>
      <View
        tag="profile-card"
        className="flex flex-col px-[1.5rem] py-4 bg-white shadow-sm"
      >
        {title && (
          <View
            tag="card-header"
            className="flex items-center justify-between capitalize text-[1.2rem] font-bold text-gray-800"
          >
            <span className="flex items-center gap-2 pb-[1rem] text-indigo-600 font-bold text-xs uppercase tracking-widest">
              {icon && icon}
              {title}
            </span>
            {actionIcon && (
              <View className="flex items-center justify-center p-2 bg-mauve-200 text-blue-500 rounded-xl">
                {actionIcon}
              </View>
            )}
          </View>
        )}
        <View tag="card-body" className="flex">
          <View tag="card-body-content" className="flex flex-col w-full">
            {children}
          </View>
        </View>
      </View>
    </>
  );
}

interface InfoItemProps {
  // Aceita string ("texto") ou JSX (<span>texto</span>)
  txt: React.ReactNode;
  fallTxt?: React.ReactNode;

  // Aceita especificamente um elemento (Ex: <UserIcon />)
  icon?: React.ReactElement;

  // Padrão para qualquer conteúdo interno do componente
  children?: React.ReactNode;

  // Exemplo de uma prop opcional (caso precise no futuro)
  className?: string;
}

function InfoItem({ icon, txt, fallTxt, children, className }: InfoItemProps) {
  return (
    <>
      <View tag="info-item">
        {children}
        {!children && (
          <>
            {icon && <View className="bg-green-50 p-2 rounded-xl">{icon}</View>}
            <View tag="t" className="text-gray-600 py-3">
              {txt || fallTxt || ""}
            </View>
          </>
        )}
      </View>
    </>
  );
}
