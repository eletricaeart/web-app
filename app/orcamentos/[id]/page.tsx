"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import EACard from "@/components/ui/EACard";
import AppBar from "@/components/layout/AppBar";
import FAB from "@/components/ui/FAB";
import Text from "@/components/ui/Text";
import { processTextToHtml } from "@/utils/TextPreProcessor";
import View from "@/components/layout/View";
import BudgetSkeleton from "../components/BudgetSkeleton";
// import BudgetShareMenu from "../components/BudgetShareMenu";
import { Pen, FilePdf, ShareNetwork } from "@phosphor-icons/react";
import { CID } from "@/utils/helpers";
// import { eaSyncClient } from "@/lib/EASyncClient";
import { useEASync } from "@/hooks/useEASync";

// import "@/styles/Budget.css";
// import "@/styles/print.css";

export default function Budget() {
  const { id } = useParams();
  const router = useRouter();
  const { data: orcamentos } = useEASync("orcamentos");
  const budgetRef = useRef<HTMLDivElement | null>(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getCleanDate = (date: string) =>
    date.includes("T")
      ? date.split("T")[0].split("-").reverse().join("/")
      : date;

  const handleEdit = () => {
    router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${data.id}`);
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
      icon: <FilePdf size={28} weight="duotone" />,
      label: "Imprimir PDF",
      action: () => window.print(),
    },
  ];

  useEffect(() => {
    if (!id || !orcamentos.length) return;

    const normalizedId = Array.isArray(id) ? id[0] : id;

    const minimumTimer = setTimeout(() => {
      const found = orcamentos.find(
        (o: any) =>
          String(o.id).replace(/\s/g, "") ===
          String(normalizedId).replace(/\s/g, ""),
      );

      if (found) {
        setData(found);
        document.title = `Orçamento_${found.cliente.name}`;
      }

      setLoading(false);
    }, 1000); // 🔥 seu delay de 1 segundo

    return () => clearTimeout(minimumTimer);
  }, [orcamentos, id]);

  const renderMarkdown = (itens: any[]) => {
    return itens.map((item, idx) => {
      const markdownText = item.detalhes
        .map((d: any) => {
          if (d.tipo === "brk") return "---";
          if (d.tipo === "tagc") return `> ${d.conteudo}`;
          if (d.tipo === "t6") return `# ${d.conteudo}`;
          if (d.tipo === "ul")
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
        <AppBar backAction={() => router.back()} />
        <BudgetSkeleton />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <AppBar backAction={() => router.back()} />
        <div className="p-10 text-center">Orçamento não encontrado.</div>
      </>
    );
  }

  return (
    <>
      <AppBar backAction={() => router.back()} />

      {/* <BudgetShareMenu */}
      {/*   open={isShareOpen} */}
      {/*   onOpenChange={setIsShareOpen} */}
      {/*   budgetRef={budgetRef} */}
      {/*   data={data} */}
      {/*   clientName={data?.cliente?.name} */}
      {/*   budgetTitle={data?.docTitle?.text} */}
      {/* /> */}

      <View tag="pageContainer">
        <View tag="budget-page" ref={budgetRef}>
          <View tag="page-header">
            <EACard />
            <View tag="doc-id">
              <span>
                <b>Data de Emissão:</b>
                <View tag="issue-date">
                  {getCleanDate(data.docTitle.emissao)}
                </View>
              </span>
              <span>
                <b>Validade da Proposta:</b>{" "}
                <View tag="t">{data.docTitle.validade}</View>
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
                  {data.docTitle.subtitle}
                </Text>
              </View>
              <View tag="doc-title_title">{data.docTitle.text}</View>
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
                      <b>Nome:</b> {data.cliente.name}
                    </View>
                    <View tag="t">
                      <b>Endereço:</b>{" "}
                      {`${data.cliente.rua ? data.cliente.rua + ", " : ""}${
                        data.cliente.num ? data.cliente.num + " - " : ""
                      }${
                        data.cliente.bairro ? data.cliente.bairro + " - " : ""
                      }${data.cliente?.cidade}`}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View tag="budget-body">
            {data.servicos.map((servico: any, index: number) => (
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

      <FAB actions={fabActions} hasBottomNav={false} />
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
