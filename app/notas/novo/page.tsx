// app/notas/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import { FloppyDisk, CircleNotch, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import ClientForm from "@/components/forms/ClientForm";

import "../../clientes/Clientes.css";

// Interfaces Atualizadas (English/CamelCase)
interface Cliente {
  id: string | number;
  name: string;
  zip?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  // Fallback para busca no cache antigo
  "Nome Completo"?: string;
}

interface NotaFormData {
  id: string;
  title: string; // "title"
  content: string; // "content"
  date: string; // "date"
  clientId: string | number; // "clienteId" -> clientId
  clientName: string; // "clienteNome" -> clientName
  isImportant: boolean; // "important" -> isImportant
  ownerId: string; // "owner_id" -> ownerId
}

export default function NovaNota() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get("clienteId");

  const { data: clients } = useEASync<Cliente>("clientes");
  const { save: saveNota } = useEASync("notas");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotaFormData>({
    id: "",
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    clientId: "",
    clientName: "",
    isImportant: false,
    ownerId: "",
  });

  // Hydration fix para o ownerId
  useEffect(() => {
    const userEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("user_email") || ""
        : "";
    setFormData((prev) => ({ ...prev, ownerId: userEmail }));
  }, []);

  // Preenchimento automático se vier clientId via URL
  useEffect(() => {
    if (clientIdParam && clients.length > 0) {
      const target = clients.find(
        (c) => String(c.id) === String(clientIdParam),
      );
      if (target) {
        setFormData((prev) => ({
          ...prev,
          clientId: target.id,
          clientName: target.name || (target as any)["Nome Completo"] || "",
        }));
      }
    }
  }, [clientIdParam, clients]);

  const handleSave = async () => {
    if (!formData.title || !formData.clientId) {
      return toast.error("Preencha o título e selecione um cliente");
    }

    setLoading(true);
    // Payload limpo seguindo o novo padrão
    const payload = {
      ...formData,
      id: `NT-${Date.now()}`,
    };

    const res = (await saveNota(payload, "create")) as { success: boolean };
    if (res.success) {
      toast.success("Nota técnica salva!");
      router.replace("/notas");
    } else {
      toast.error("Erro ao salvar nota");
    }
    setLoading(false);
  };

  return (
    <>
      <AppBar title="Nova Nota Técnica" backAction={() => router.back()} />

      <View tag="page" className="add-client-page">
        <View tag="page-content" className="p-4">
          {/* SELETOR DE CLIENTE */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">VINCULAR CLIENTE</View>
            <View tag="card-ea-body">
              <ClientForm
                clientData={{
                  name: formData.clientName,
                  zip: "",
                  street: "",
                  number: "",
                  neighborhood: "",
                  city: "",
                  complement: "",
                  obs: "",
                }}
                clientsCache={clients}
                onClientChange={(client: any) => {
                  // Busca o ID no cache (suporta name novo ou Nome Completo antigo)
                  const fullClient = clients.find(
                    (c) => (c.name || c["Nome Completo"]) === client.name,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    clientId: fullClient?.id || prev.clientId,
                    clientName: client.name || "",
                  }));
                }}
                onNewClientClick={() => router.push("/clientes/novo")}
              />
            </View>
          </View>

          {/* DADOS DA NOTA */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">RELATO TÉCNICO</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Título da Nota
                <input
                  className="input"
                  placeholder="Ex: Manutenção Quadro Geral"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </label>

              <label>
                Data da Visita
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </label>

              <label>
                Descrição Detalhada
                <textarea
                  className="input h-32 p-2"
                  placeholder="Descreva os serviços executados..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </label>
            </View>
          </View>

          {/* CONFIGURAÇÕES ADICIONAIS */}
          <View tag="card-ea-client">
            <View tag="card-ea-body">
              <label className="flex items-center justify-between cursor-pointer p-2">
                <div className="flex items-center gap-3">
                  <Star
                    size={24}
                    weight={formData.isImportant ? "fill" : "regular"}
                    className={
                      formData.isImportant ? "text-amber-500" : "text-slate-400"
                    }
                  />
                  <span className="font-bold text-slate-700">
                    Marcar como Importante
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md accent-indigo-600"
                  checked={formData.isImportant}
                  onChange={(e) =>
                    setFormData({ ...formData, isImportant: e.target.checked })
                  }
                />
              </label>
            </View>
          </View>
        </View>

        <footer className="footer-btn p-6">
          <button
            className="btn-save w-full flex justify-center items-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <FloppyDisk size={24} />
            )}
            {loading ? "SALVANDO..." : "FINALIZAR NOTA"}
          </button>
        </footer>
      </View>
    </>
  );
}
