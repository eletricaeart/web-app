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
        className="client-perfil-page bg-[#fff_!important] min-h-[95dvh]"
      >
        {/* SEÇÃO HEADER: AVATAR E NOME */}
        <View
          tag="avatar-section"
          className="relative min-h-[200px] text-center bg-[var(--sv-sodalita)] text-white "
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
              <h3 className="font-thunder text-2xl capitalize">
                {client.name}
              </h3>
              <p className="opacity-80 text-sm">{client.cidade}</p>
            </View>
          </View>
        </View>

        <View tag="main-content" className="flex flex-col gap-4">
          {/* CARD: INFORMAÇÕES DE CONTATO */}
          <InfoSection title="Dados do contato">
            <InfoItem
              icon={
                <WhatsappLogo
                  size={30}
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
                  size={30}
                  weight="duotone"
                  className="text-blue-500"
                />
              }
              txt={client.email}
              fallTxt=""
            />
            <InfoItem
              icon={
                <MapPin size={30} weight="duotone" className="text-red-500" />
              }
              txt={`${client.rua}, ${client.num} - ${client.bairro}`}
              fallTxt=""
            />
          </InfoSection>

          {/* SEÇÃO: HISTÓRICO DE ORÇAMENTOS */}
          <InfoSection
            title="Orçamentos"
            actionIcon={
              <FilePlus
                size={25}
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
                    <View tag="t" className="date">
                      {getCleanDate(String(orc.docTitle.emissao))}
                    </View>
                    <p className="title">{orc.docTitle.text}</p>
                  </View>
                  {i < historicoOrcamentos.length - 1 && (
                    <Divider spacing="1rem" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <View tag="t" className="empty-text">
                Nenhum orçamento para este cliente.
              </View>
            )}
          </InfoSection>

          {/* SEÇÃO: HISTÓRICO DE NOTAS TÉCNICAS */}
          <InfoSection title="Notas técnicas">
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
                  {i < historicoNotas.length - 1 && <Divider spacing="1rem" />}
                </React.Fragment>
              ))
            ) : (
              <View tag="t" className="empty-text">
                Nenhuma nota vinculada.
              </View>
            )}
          </InfoSection>
        </View>
      </View>
    </>
  );
}

interface InfoSectionProps {
  // Aceita string ("Título") ou JSX (<span>Título</span>)
  title?: React.ReactNode;

  // Aceita especificamente um elemento (Ex: <UserIcon onClick/>)
  actionIcon?: React.ReactElement;

  // Padrão para qualquer conteúdo interno do componente
  children: React.ReactNode;

  // Exemplo de uma prop opcional (caso precise no futuro)
  className?: string;
}

function InfoSection({
  title,
  actionIcon,
  children,
  className,
}: InfoSectionProps) {
  return (
    <>
      <View
        tag="profile-card"
        className="flex flex-col gap-3 p-4 bg-mauve-50 shadow-sm"
      >
        {title && (
          <View
            tag="card-header"
            className="flex items-center justify-between capitalize font-bold text-gray-800"
          >
            {title}
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
            {icon}
            <View tag="t" className="text-gray-600 py-3">
              {txt || fallTxt || ""}
            </View>
          </>
        )}
      </View>
    </>
  );
}
