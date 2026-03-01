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
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";
import { toast } from "sonner";

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

  const AVATARS = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  return (
    <>
      <AppBar
        title="Perfil do Cliente"
        backAction={() => router.back()}
        options={
          <button
            onClick={() => router.push(`/clientes/novo?id=${client.id}`)}
            style={{ background: "none", border: "none", color: "white" }}
          >
            <Pen size={24} weight="duotone" />
          </button>
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
