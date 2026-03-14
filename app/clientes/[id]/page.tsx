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
  IdentificationCard,
  FileText,
  Note,
  Phone,
} from "@phosphor-icons/react";
import { Mask } from "@/utils/mask";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "./styles.css";
import Image from "next/image";
import EAAvatar from "@/components/ui/EA-Avatar";
import Link from "next/link";
import DeleteClientModal from "../components/DeleteClientModal";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";

// Interfaces Atualizadas (CamelCase / English)
interface Cliente {
  id: string | number;
  name: string;
  photo?: string;
  gender?: string;
  city?: string;
  whatsapp?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  zip?: string;
  // Fallbacks antigos
  cidade?: string;
  rua?: string;
  num?: string;
  bairro?: string;
}

interface Orcamento {
  id: string | number;
  clientName?: string; // Novo
  cliente?: { name: string }; // Antigo
  documentTitle?: string; // Novo
  docTitle?: { text: string; emissao: string | Date }; // Antigo
  issueDate?: string;
}

interface Nota {
  id: string | number;
  clienteId: string | number;
  date: string;
  title: string;
}

type Tab_ = "infos" | "budgets" | "notes";

export default function ClientePerfil() {
  const params = useParams();
  const clientId = params?.id;
  const router = useRouter();

  const { data: clients, save: saveClient } = useEASync<Cliente>("clientes");
  const { data: orcamentos } = useEASync<Orcamento>("orcamentos");
  const { data: notes } = useEASync<Nota>("notas");

  const [client, setClient] = useState<Cliente | null>(null);
  const [activeTab, setActiveTab] = useState<Tab_>("infos");

  /* Estados para o Modal de Exclusão */
  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveClient, () => router.replace("/clientes"));

  const handleDelete = async () => {
    if (confirm("Excluir este cliente permanentemente?")) {
      await saveClient({ id: client.id }, "delete");
      router.replace("/clientes");
    }
  };

  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find((c) => String(c.id) === String(clientId));
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  if (!client)
    return (
      <View tag="page" className="p-10 text-center">
        Carregando perfil...
      </View>
    );

  // Normalização de Nome para filtro de históricos
  const currentClientName =
    client.name || (client as any)["Nome Completo"] || "";

  const historicoOrcamentos = orcamentos.filter((o) => {
    const oName =
      o.clientName || o.cliente?.name || (o as any)["Nome Cliente"] || "";
    return oName.toLowerCase() === currentClientName.toLowerCase();
  });

  const historicoNotas = notes.filter(
    (n) => String(n.clienteId) === String(client.id),
  );

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
                    label: "Novo Orçamento",
                    icon: <FilePlus size={20} color="#29f" weight="duotone" />,
                    option: () =>
                      router.push(`/orcamentos/novo?clienteId=${client.id}`),
                  },
                  {
                    label: "Nova Nota Técnica",
                    icon: <Notebook size={20} color="#29f" weight="duotone" />,
                    option: () =>
                      router.push(`/notas/novo?clienteId=${client.id}`),
                  },
                  {
                    label: "Excluir Cliente",
                    icon: <Trash size={20} color="#932" weight="duotone" />,
                    className:
                      "menu-item-pop w-full p-2 flex items-center cursor-pointer text-red-500 border-t border-slate-300 bg-red-100",
                    option: () =>
                      handleDeleteRequest(client.id, currentClientName),
                  },
                ].map((O, i) => (
                  <View
                    key={i}
                    tag="appbar-btn"
                    className={
                      O.className ||
                      "menu-item-pop w-full p-2 flex items-center cursor-pointer"
                    }
                    onClick={O.option}
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
        <View
          tag="avatar-section"
          className="relative min-h-[200px] text-center bg-[var(--sv-sodalita)] text-white "
        >
          <View
            tag="perfil-pic"
            className="mt-[-2px] top-0 left-0 w-full h-full z-10 overflow-hidden bg-transparent"
          >
            <Image
              src={clientAvatar}
              alt={currentClientName}
              fill
              className="object-cover"
              priority
            />
            <View
              tag="client-links"
              className="absolute bottom-[2rem] left-0 z-20 w-full py-4 px-6 bg-linear-to-b from-transparent to-[#0003]"
            >
              <View
                tag="contact-shortcuts"
                className="flex items-center justify-end w-full gap-3"
              >
                <Link
                  href={`https://wa.me/${client.whatsapp}`}
                  target="_blank"
                  className="bg-white p-3 rounded-full shadow-lg"
                >
                  <WhatsappLogo
                    size={20}
                    weight="duotone"
                    className="text-green-500"
                  />
                </Link>
                <Link
                  href={`tel:${client.whatsapp}`}
                  className="bg-white p-3 rounded-full shadow-lg"
                >
                  <Phone size={20} weight="duotone" className="text-gray-800" />
                </Link>
                <Link
                  href={`mailto:${client.email}`}
                  className="bg-white p-3 rounded-full shadow-lg"
                >
                  <EnvelopeSimple
                    size={20}
                    weight="duotone"
                    className="text-blue-500"
                  />
                </Link>
              </View>
            </View>
          </View>
        </View>

        <View
          tag="avatar-section-bottom"
          className="flex relative w-full h-24 mt-[-2rem] bg-mauve-50 rounded-[2rem_2rem_0_0]"
        >
          <View className="flex w-full px-4 absolute top-[-40%] gap-4 items-center">
            <View className="avatar-circle w-24 h-24 z-30">
              <EAAvatar
                name={currentClientName}
                url={clientAvatar}
                w="full"
                h="full"
              />
            </View>
            <View className="flex flex-col w-full h-24 justify-end flex-1 pb-3">
              <h3 className="text-2xl text-slate-900 capitalize font-medium line-clamp-1 trtuncate">
                {currentClientName}
              </h3>
              <p className="opacity-80 text-sm text-slate-400 capitalize font-bold line-clamp-1 truncate">
                {client.city || client.cidade || "Cidade não informada"}
              </p>
            </View>
          </View>
        </View>

        <View className="grid grid-cols-3 text-sm bg-[#e5e5e5] rounded-[1rem_1rem_0_0] px-3 pt-3 pb-[1rem]">
          {(["infos", "budgets", "notes"] as Tab_[]).map((t) => (
            <View
              key={t}
              className="grid place-items-center p-2 rounded-[.7rem_.7rem_0_0]"
              style={{
                background: activeTab === t ? "#fff" : "#f5f5f5",
                color: activeTab === t ? "#666" : "#999",
                fontWeight: activeTab === t ? "bold" : "600",
              }}
              onClick={() => setActiveTab(t)}
            >
              {t === "infos"
                ? "Informações"
                : t === "budgets"
                  ? "Orçamentos"
                  : "Notas"}
            </View>
          ))}
        </View>

        <View className="flex flex-col gap-4 mt-[-1rem] rounded-[1rem_1rem_0_0] overflow-hidden">
          {activeTab === "infos" && (
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
                txt={Mask.phone(client.whatsapp || "")}
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
              />
              <InfoItem
                icon={
                  <MapPin size={25} weight="duotone" className="text-red-500" />
                }
                txt={`${client.street || client.rua || ""}, ${client.number || client.num || ""} - ${client.neighborhood || client.bairro || ""}`}
              />
            </InfoSection>
          )}

          {activeTab === "budgets" && (
            <InfoSection
              title="Orçamentos"
              icon={<FileText size={18} weight="duotone" />}
            >
              {historicoOrcamentos.length > 0 ? (
                historicoOrcamentos.map((orc, i) => (
                  <View
                    key={orc.id}
                    className="py-3 border-b last:border-0 cursor-pointer"
                    onClick={() => router.push(`/orcamentos/${orc.id}`)}
                  >
                    <p className="text-xs text-gray-400">
                      {orc.issueDate ||
                        (orc as any).docTitle?.emissao ||
                        "Data não informada"}
                    </p>
                    <p className="text-gray-600 font-medium">
                      {orc.documentTitle || orc.docTitle?.text}
                    </p>
                  </View>
                ))
              ) : (
                <p className="text-gray-400 text-sm">
                  Nenhum orçamento encontrado.
                </p>
              )}
            </InfoSection>
          )}

          {activeTab === "notes" && (
            <InfoSection
              title="Notas técnicas"
              icon={<Note size={18} weight="duotone" />}
            >
              {historicoNotas.length > 0 ? (
                historicoNotas.map((n) => (
                  <View
                    key={n.id}
                    className="py-3 border-b last:border-0 cursor-pointer"
                    onClick={() => router.push(`/notas/${n.id}`)}
                  >
                    <p className="text-xs text-gray-400">
                      {new Date(n.date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-gray-600 font-medium">{n.title}</p>
                  </View>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Nenhuma nota vinculada.</p>
              )}
            </InfoSection>
          )}
        </View>
      </View>

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

// Componentes Auxiliares Locais
function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="flex flex-col px-6 py-4 bg-white shadow-sm">
      <span className="flex items-center gap-2 pb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
        {icon} {title}
      </span>
      <View className="flex flex-col w-full">{children}</View>
    </View>
  );
}

function InfoItem({
  icon,
  txt,
  fallTxt,
}: {
  icon: React.ReactNode;
  txt?: string;
  fallTxt?: string;
}) {
  if (!txt && !fallTxt) return null;
  return (
    <View className="flex items-center gap-3 py-2">
      <View className="bg-green-50 p-2 rounded-xl">{icon}</View>
      <View className="text-gray-600">{txt || fallTxt}</View>
    </View>
  );
}
