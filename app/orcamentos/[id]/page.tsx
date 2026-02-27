"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { Pen, FilePdf, ShareNetwork, CaretLeft } from "@phosphor-icons/react";
import View from "@/components/layout/View"; // Certifique-se de ter este componente
import BudgetSkeleton from "../components/BudgetSkeleton";
import "../../../styles/orcamentos-legacy.css"; // Seus CSS originais

export default function BudgetPage() {
  const { id } = useParams();
  const router = useRouter();
  const { items: orcamentos, isLoading } = useData<any>("orcamentos");
  const data = orcamentos?.find((o: any) => String(o.id) === String(id));

  if (isLoading) return <BudgetSkeleton />;
  if (!data) return <View>Orçamento não encontrado</View>;

  return (
    <>
      {/* AppBar original sua */}
      <div className="app-bar-legacy">
        <button onClick={() => router.back()}>
          <CaretLeft size={24} />
        </button>
        <span>Orçamento</span>
      </div>

      <View tag="budget-page">
        <View tag="page-header">
          <div className="ea-card-logo-placeholder" />{" "}
          {/* Seu EACard original */}
          <View tag="doc-id">
            <span>ID: {data.id}</span>
            <span>EMISSÃO: {data.docTitle.emissao}</span>
          </View>
        </View>

        <View tag="doc-title">
          <View tag="ui">
            <View tag="t6">{data.docTitle.subtitle}</View>
            <h1 className="budget-title">{data.docTitle.text}</h1>
          </View>
        </View>

        <View tag="cliente-section">
          <View tag="ui">
            <View tag="span" className="t6">
              Cliente:
            </View>
            <View tag="content">
              <h3>{data.cliente.name}</h3>
              <p>
                {data.cliente.rua}, {data.cliente.num} - {data.cliente.bairro}
              </p>
              <p>
                {data.cliente.cidade} - {data.cliente.cep}
              </p>
            </View>
          </View>
        </View>

        {/* Mapeamento das Cláusulas com suas tags originais */}
        {data.servicos.map((servico: any, idx: number) => (
          <View tag="clause" key={idx}>
            <View tag="clause-header">
              <View tag="t">
                {idx + 1}. {servico.titulo}
              </View>
            </View>
            <View tag="subclause-field">
              {servico.itens.map((item: any, iIdx: number) => (
                <View tag="subclause" key={iIdx}>
                  <View tag="subclause-header">
                    <View tag="t">{item.subtitulo}</View>
                  </View>
                  <View tag="subclause-content">
                    {/* Renderização do TipTap HTML fiel */}
                    <div
                      className="tiptap-content"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Seu Footer Content original do Budget.jsx */}
        <View tag="footer-content">
          <View className="avoid" tag="footer-content_top">
            <View tag="t6">Compromisso Elétrica&Art:</View>
            <p>Unir técnica, estética, precisão e responsabilidade...</p>
          </View>
          <View tag="footer-content_bottom">
            <View tag="signatures">
              <View tag="signature">
                <View tag="sig-name">Rafael - Elétrica&Art</View>
              </View>
              <View tag="signature">
                <View tag="sig-name">Assinatura do Cliente</View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Seus botões de ação flutuantes originais */}
      <div className="fab-container">
        <button className="fab-btn">
          <ShareNetwork size={28} />
        </button>
        <button
          className="fab-btn"
          onClick={() => router.push(`/orcamentos/editar?id=${id}`)}
        >
          <Pen size={28} />
        </button>
      </div>
    </>
  );
}
