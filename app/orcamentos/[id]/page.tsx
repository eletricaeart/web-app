// app/orcamentos/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EACard from "@/components/ui/EACard";
import AppBar from "@/components/layout/AppBar";
import FAB from "@/components/ui/FAB";
import Text from "@/components/ui/Text";
import { processTextToHtml } from "@/utils/TextPreProcessor";
import View from "@/components/layout/View";
import BudgetSkeleton from "../components/BudgetSkeleton";
import BudgetShareMenu from "@/components/orcamentos/BudgetShareMenu";
import { Pen, ShareNetwork, Trash } from "@phosphor-icons/react";
import { CID } from "@/utils/helpers";
import { useEASync } from "@/hooks/useEASync";
import { useDeleteEntity } from "@/hooks/useDeleteEntity"; // Importe o hook
import DeleteBudgetModal from "../components/DeleteBudgetModal"; // Importe o modal
import { Popover, PopoverContent } from "@/components/ui/popover";

// --- Interfaces para Tipagem Atualizadas (English/CamelCase) ---

interface DetailContent {
  tipo: "brk" | "tagc" | "t6" | "ul" | string;
  conteudo: any;
}

interface ItemBudget {
  subtitulo: string;
  detalhes: DetailContent[];
}

interface ServiceBudget {
  titulo: string;
  itens: ItemBudget[];
}

interface BudgetData {
  id: string | number;
  // Propriedades Novas
  clientName?: string;
  documentTitle?: string;
  issueDate?: string;
  expiration?: string;
  subtitle?: string;
  services?: ServiceBudget[];
  clientAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  };
  // Propriedades Antigas (para compatibilidade)
  cliente?: {
    name: string;
    rua?: string;
    num?: string;
    bairro?: string;
    cidade?: string;
  };
  docTitle?: {
    emissao: string;
    validade: string;
    subtitle: string;
    text: string;
  };
  servicos?: ServiceBudget[];
}

export default function Budget() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: orcamentos, save: saveOrcamento } =
    useEASync<BudgetData>("orcamentos");
  const budgetRef = useRef<HTMLDivElement | null>(null);

  // --- HOOK DE DELEÇÃO INTEGRADO ---
  // Aqui preciso redirecionar para a lista geral de orçamentos
  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveOrcamento, () => router.replace("/orcamentos"));

  const searchParams = useSearchParams();
  const isPrintMode = searchParams.get("print") === "true";

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalização de dados para exibição
  const displayData = data
    ? {
        clientName:
          data.clientName ||
          data.cliente?.name ||
          (data as any)["Nome Cliente"] ||
          "Cliente",
        documentTitle:
          data.documentTitle ||
          data.docTitle?.text ||
          (data as any)["Título Doc"] ||
          "Orçamento",
        issueDate:
          data.issueDate ||
          data.docTitle?.emissao ||
          (data as any)["Emissão"] ||
          "",
        expiration:
          data.expiration ||
          data.docTitle?.validade ||
          (data as any)["Validade"] ||
          "",
        subtitle:
          data.subtitle ||
          data.docTitle?.subtitle ||
          (data as any)["Subtítulo"] ||
          "PROPOSTA DE ORÇAMENTO",

        // --- LÓGICA ROBUSTA PARA OS SERVIÇOS ---
        services: (() => {
          const raw =
            data.services || data.servicos || (data as any)["Serviços JSON"];
          if (!raw) return [];
          // Se for string (formato antigo do GS), faz o parse. Se já for objeto, usa direto.
          if (typeof raw === "string") {
            try {
              return JSON.parse(raw);
            } catch (e) {
              console.error(
                "Erro ao converter serviços de string para JSON",
                e,
              );
              return [];
            }
          }
          return Array.isArray(raw) ? raw : [];
        })(),

        address: {
          street:
            data.clientAddress?.street ||
            data.cliente?.rua ||
            (data as any)["street"] ||
            (data as any)["Rua"] ||
            "",
          number:
            data.clientAddress?.number ||
            data.cliente?.num ||
            (data as any)["number"] ||
            (data as any)["Número"] ||
            "",
          neighborhood:
            data.clientAddress?.neighborhood ||
            data.cliente?.bairro ||
            (data as any)["neighborhood"] ||
            (data as any)["Bairro"] ||
            "",
          city:
            data.clientAddress?.city ||
            data.cliente?.cidade ||
            (data as any)["city"] ||
            (data as any)["Cidade/UF"] ||
            "",
        },
      }
    : null;

  const getCleanDate = (date: string) =>
    date?.includes("T")
      ? date.split("T")[0].split("-").reverse().join("/")
      : date;

  const handleEdit = () => {
    if (data) {
      router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${data.id}`);
    }
  };

  const fabActions = [
    {
      icon: <Pen size={28} weight="duotone" />,
      label: "Editar",
      action: handleEdit,
    },
    {
      icon: <ShareNetwork size={28} weight="duotone" />,
      label: "Compartilhar",
      action: () => setIsShareOpen(true),
    },
    {
      icon: <Trash size={28} weight="duotone" />,
      label: "Excluir",
      action: () => {
        if (data && displayData) {
          handleDeleteRequest(data.id, displayData.documentTitle);
        }
      },
    },
  ];

  useEffect(() => {
    if (!id || !orcamentos.length) return;

    const normalizedId = Array.isArray(id) ? id[0] : id;

    const minimumTimer = setTimeout(() => {
      const found = orcamentos.find(
        (o) =>
          String(o.id).replace(/\s/g, "") ===
          String(normalizedId).replace(/\s/g, ""),
      );

      if (found) {
        setData(found);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(minimumTimer);
  }, [orcamentos, id]);

  const renderMarkdown = (itens: ItemBudget[]) => {
    return itens.map((item, idx) => {
      const markdownText = item.detalhes
        .map((d) => {
          if (d.tipo === "brk") return "---";
          if (d.tipo === "tagc") return `> ${d.conteudo}`;
          if (d.tipo === "t6") return `# ${d.conteudo}`;
          if (d.tipo === "ul" && Array.isArray(d.conteudo))
            return d.conteudo.map((li: string) => `- ${li}`).join("\n");
          return d.conteudo;
        })
        .join("\n");

      return (
        <View key={idx} tag="subclause">
          <View tag="ui">
            <View tag="subclause-header">
              <View tag="t6">{item.subtitulo}</View>
            </View>
            <View
              tag="subclause-body"
              dangerouslySetInnerHTML={{
                __html: processTextToHtml(markdownText),
              }}
            />
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <>
        <AppBar
          backAction={() => router.back()}
          options={
            <Popover>
              {/* ... Trigger dos 3 pontinhos ... */}
              <PopoverContent className="w-52 p-0 bg-white shadow-xl border-none">
                <View className="flex flex-col">
                  <button
                    className="p-3 flex items-center gap-2 text-sm hover:bg-slate-50"
                    onClick={handleEdit}
                  >
                    <Pen size={18} weight="duotone" /> Editar Orçamento
                  </button>
                  <button
                    className="p-3 flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 border-t"
                    onClick={() =>
                      handleDeleteRequest(data!.id, displayData!.documentTitle)
                    }
                  >
                    <Trash size={18} weight="duotone" /> Excluir Orçamento
                  </button>
                </View>
              </PopoverContent>
            </Popover>
          }
        />
        <BudgetSkeleton />
      </>
    );
  }

  if (!data || !displayData) {
    return (
      <>
        <AppBar backAction={() => router.back()} />
        <div className="p-10 text-center">Orçamento não encontrado.</div>
      </>
    );
  }

  const fullAddress = displayData
    ? [
        displayData.address.street,
        displayData.address.number ? `nº ${displayData.address.number}` : null,
        displayData.address.neighborhood,
        displayData.address.city,
      ]
        .filter(Boolean)
        .join(", ")
    : "Endereço não informado";

  return (
    <>
      {!isPrintMode && <AppBar backAction={() => router.back()} />}

      <BudgetShareMenu
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        budgetRef={budgetRef}
        data={data}
        clientName={displayData.clientName}
        budgetTitle={displayData.documentTitle}
      />

      <View tag="pageContainer">
        <View tag="budget-page" ref={budgetRef}>
          <View tag="page-header">
            <EACard />
            <View tag="doc-id">
              <span>
                <b>Data de Emissão:</b>
                <View tag="issue-date">
                  {getCleanDate(displayData.issueDate)}
                </View>
              </span>
              <span>
                <b>Validade da Proposta:</b>{" "}
                <View tag="t">{displayData.expiration}</View>
              </span>
            </View>
          </View>

          <View tag="doc-title">
            <View tag="doc-title_layout">
              <View tag="doc-title_type">
                <Text
                  size="1.2rem"
                  color="var(--sv-sombra-azuljnk, #fff)"
                  shadow="var(--sv-sodalita, #00559c)"
                  font='font-family: "inter", "Roboto", sans-serif'
                >
                  {displayData.subtitle}
                </Text>
              </View>
              <View tag="doc-title_title">{displayData.documentTitle}</View>
            </View>
          </View>

          <View tag="cliente-section">
            <View tag="ui">
              <header>
                <View tag="ui">
                  <View tag="t">CLIENTE</View>
                </View>
              </header>
              <View tag="content">
                <View tag="card">
                  <View tag="ui">
                    <View tag="t">
                      <b>Nome:</b> {displayData.clientName}
                    </View>
                    <View tag="t">
                      <b>Endereço:</b> {fullAddress}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View tag="budget-body">
            {displayData.services.map((servico: any, index: number) => (
              <View key={index} tag="clause">
                <View tag="ui">
                  <View tag="clause-header">
                    <View tag="ui">
                      <View tag="t">
                        {index + 1}. {servico.titulo}
                      </View>
                    </View>
                  </View>
                  <View tag="clause-content">
                    {renderMarkdown(servico.itens)}
                  </View>
                </View>
              </View>
            ))}
            <FooterContent />
          </View>
        </View>
      </View>

      {!isPrintMode && <FAB actions={fabActions} hasBottomNav={false} />}

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <DeleteBudgetModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        budget={
          itemToDelete
            ? {
                id: itemToDelete.id,
                documentTitle: itemToDelete.name, // O hook guarda o título aqui
                clientName: displayData?.clientName || "Cliente",
              }
            : null
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}

function FooterContent() {
  return (
    <View tag="footer-content">
      <View className="avoid" tag="footer-content_top">
        <View tag="content">
          <View tag="t6">Compromisso Elétrica&Art:</View>
          <p>
            Unir técnica, estética, precisão e responsabilidade para entregar um
            resultado impecável, durável e superior.
          </p>
          <View tag="tagb">
            <p>
              Agradecemos a oportunidade de apresentar esta proposta e estamos à
              disposição para quaisquer esclarecimentos adicionais.
            </p>
          </View>
        </View>
      </View>

      <View tag="footer-content_bottom">
        <View tag="ui">
          <header>
            <View tag="ui">
              <View tag="t">Assinatura e Aprovação</View>
            </View>
          </header>
          <View tag="content">
            <View tag="signatures">
              <View tag="signature">
                <View tag="content">
                  <View tag="sig-name">Rafael - Elétrica&Art</View>
                </View>
              </View>
              <View tag="signature">
                <View tag="content">
                  <View tag="sig-name">Assinatura do Cliente</View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
