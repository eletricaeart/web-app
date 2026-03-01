// app/notas/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import {
  FloppyDisk,
  CircleNotch,
  UserCircle,
  Star,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ClientForm from "@/components/forms/ClientForm"; // O componente com Drawer que você enviou

import "../../clientes/Clientes.css"; // Reutilizando os estilos de cards e formulários

// Interfaces para suportar o TypeScript sem 'any'
interface Cliente {
  id: string | number;
  name: string;
  cep?: string;
  rua?: string;
  num?: string;
  bairro?: string;
  cidade?: string;
  complemento?: string;
  obs?: string;
  address?: {
    cep?: string;
    rua?: string;
    num?: string;
    bairro?: string;
    cidade?: string;
  };
}

interface NotaFormData {
  id: string;
  title: string;
  content: string;
  date: string;
  clienteId: string | number;
  clienteNome: string;
  important: boolean;
  owner_id: string;
}

export default function NovaNota() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdParam = searchParams.get("clienteId");

  const { data: clients } = useEASync<Cliente>("clientes");
  const { save: saveNota } = useEASync("notas");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotaFormData>({
    id: "",
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    clienteId: "",
    clienteNome: "",
    important: false,
    owner_id: "", // Inicializado vazio para evitar erro de hidratação (SSR vs Client)
  });

  // Hydration fix para o owner_id
  useEffect(() => {
    const userEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("user_email") || ""
        : "";
    setFormData((prev) => ({ ...prev, owner_id: userEmail }));
  }, []);

  // Se vier um clienteId via URL (ex: vindo do perfil do cliente)
  useEffect(() => {
    if (clienteIdParam && clients.length > 0) {
      const target = clients.find(
        (c) => String(c.id) === String(clienteIdParam),
      );
      if (target) {
        setFormData((prev) => ({
          ...prev,
          clienteId: target.id,
          clienteNome: target.name,
        }));
      }
    }
  }, [clienteIdParam, clients]);

  const handleSave = async () => {
    if (!formData.title || !formData.clienteId) {
      return toast.error("Preencha o título e selecione um cliente");
    }

    setLoading(true);
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
          {/* SELETOR DE CLIENTE (Reutilizando seu ClientForm modificado para Notas) */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">VINCULAR CLIENTE</View>
            <View tag="card-ea-body">
              <ClientForm
                clientData={{
                  name: formData.clienteNome,
                  cep: "",
                  rua: "",
                  num: "",
                  bairro: "",
                  cidade: "",
                  complemento: "",
                  obs: "",
                }}
                clientsCache={clients}
                onClientChange={(client: Partial<Cliente>) => {
                  // Busca o ID no cache já que o ClientForm não retorna o ID no onClientChange
                  const fullClient = clients.find(
                    (c) => c.name === client.name,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    clienteId: fullClient?.id || prev.clienteId,
                    clienteNome: client.name || "",
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </label>

              <label>
                Descrição Detalhada
                <textarea
                  className="input h-32 p-2"
                  placeholder="Descreva os serviços executados, materiais utilizados ou pendências..."
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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
                    weight={formData.important ? "fill" : "regular"}
                    className={
                      formData.important ? "text-amber-500" : "text-slate-400"
                    }
                  />
                  <span className="font-bold text-slate-700">
                    Marcar como Importante
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md accent-indigo-600"
                  checked={formData.important}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, important: e.target.checked })
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
