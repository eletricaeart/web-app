// app/clientes/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import {
  AddressBook,
  CircleNotch,
  ExclamationMarkIcon,
  FloppyDisk,
  IdentificationCardIcon,
  MapPinPlus,
  UserList,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import AvatarUpload from "@/components/forms/AvatarUpload";

/* shadcn components */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import "../Clientes.css";
import "./styles.css";
import Pressable from "@/components/Pressable";

// Interface Atualizada para Nomenclatura em Inglês (CamelCase)
interface Cliente {
  id: string;
  name: string; // "Nome Completo"
  gender: string; // "Gênero"
  document: string; // "CPF / CNPJ"
  whatsapp: string; // "WhatsApp"
  email: string; // "E-mail"
  zip: string; // "CEP"
  street: string; // "Rua"
  number: string; // "Nº"
  complement: string; // "Comp."
  neighborhood: string; // "Bairro"
  city: string; // "Cidade"
  obs: string; // "Observações"
  photo: string; // "photo"
}

export default function ClienteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { data: clients, save: saveClient } = useEASync<Cliente>("clientes");

  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  // Estado inicial com chaves limpas
  const [formData, setFormData] = useState<Cliente>({
    id: "",
    name: "",
    gender: "masc",
    document: "",
    whatsapp: "",
    email: "",
    zip: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    obs: "",
    photo: "",
  });

  // Carrega dados se for Edição (Suporte a nomes antigos e novos)
  useEffect(() => {
    if (editId && clients.length > 0) {
      const target = clients.find((c) => String(c.id) === String(editId));
      if (target) {
        // Criamos uma referência 'any' para o TS não reclamar das chaves antigas
        const oldData = target as any;

        setFormData({
          id: target.id || "",
          name: target.name || oldData["Nome Completo"] || "",
          gender: target.gender || oldData["Gênero"] || "masc",
          document: target.document || oldData.doc || "",
          whatsapp: target.whatsapp || "",
          email: target.email || "",
          zip: target.zip || oldData.cep || "", // <--- Corrigido aqui
          street: target.street || oldData.rua || "", // <--- Corrigido aqui
          number: target.number || oldData.num || "", // <--- Corrigido aqui
          complement: target.complement || oldData.complemento || "",
          neighborhood: target.neighborhood || oldData.bairro || "",
          city: target.city || oldData.cidade || "",
          obs: target.obs || "",
          photo: target.photo || "",
        });
      }
    }
  }, [editId, clients]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCepBlur = async () => {
    const cepValue = formData.zip.replace(/\D/g, "");
    if (cepValue.length !== 8) return;

    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
        }));
        toast.success("Endereço preenchido via CEP");
      }
    } catch (err) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setFetchingCep(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Nome é obrigatório");

    setLoading(true);
    const action = editId ? "update" : "create";

    const payload: Cliente = {
      ...formData,
      id: editId || `CL-${Date.now()}`, // Usando prefixo CL para clientes
    };

    const res = (await saveClient(payload, action)) as {
      success: boolean;
      id?: string;
    };

    if (res.success) {
      toast.success(editId ? "Cliente atualizado" : "Cliente cadastrado");

      const draftStr = localStorage.getItem("ea_draft_budget");

      if (!editId && draftStr) {
        const draft = JSON.parse(draftStr);
        // Atualiza rascunho do orçamento com novas nomenclaturas
        draft.client = {
          name: formData.name,
          zip: formData.zip,
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          complement: formData.complement,
          obs: formData.obs,
        };

        localStorage.setItem("ea_draft_budget", JSON.stringify(draft));
        router.replace(`/orcamentos/novo`);
      } else if (editId) {
        router.replace(`/clientes`);
      } else {
        router.replace("/clientes");
      }
    } else {
      toast.error("Erro ao salvar dados");
    }
    setLoading(false);
  };

  return (
    <>
      <AppBar
        title={editId ? "Editar Cliente" : "Novo Cliente"}
        backAction={() => router.back()}
      />

      <View tag="page" className="add-client-page">
        <View tag="page-header">
          <AvatarUpload
            value={formData.photo}
            gender={formData.gender}
            onChange={(url: string) =>
              setFormData((prev) => ({ ...prev, photo: url }))
            }
          />
        </View>
        <View tag="page-content">
          <View tag="card-client" className="add-client-form">
            <View tag="card-header">
              <IdentificationCardIcon size={18} weight="duotone" />
              IDENTIFICAÇÃO
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                Nome Completo
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Rafael Silva"
                />
              </label>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <label id="genre_label">
                  Gênero
                  <Select
                    value={formData.gender}
                    onValueChange={(val: string) =>
                      setFormData({ ...formData, gender: val })
                    }
                  >
                    <SelectTrigger className="h-[45px] mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masc">Masculino</SelectItem>
                      <SelectItem value="fem">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label>
                  CPF / CNPJ
                  <input
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </label>
              </div>
            </View>
          </View>

          <View tag="card-client">
            <View tag="card-header">
              <UserList size={18} weight="duotone" />
              CONTATO
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                WhatsApp
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </label>
              <label className="mt-4">
                E-mail
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                />
              </label>
            </View>
          </View>

          <View tag="card-client">
            <View
              tag="card-header"
              className="flex justify-between items-center"
            >
              <span className="flex gap-2">
                <AddressBook size={18} weight="duotone" />
                ENDEREÇO
              </span>
              {fetchingCep && (
                <CircleNotch className="animate-spin text-amber-500" />
              )}
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                CEP
                <div className="relative">
                  <input
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                  />
                  <MapPinPlus
                    size={20}
                    className="absolute right-3 top-3 opacity-30"
                  />
                </div>
              </label>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <label className="col-span-2">
                  Rua
                  <input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nº
                  <input
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <View className="mt-4">
                <label>
                  Comp.
                  <input
                    name="complement"
                    value={formData.complement}
                    onChange={handleChange}
                    placeholder="Apto..."
                  />
                </label>
              </View>

              <label className="mt-4">
                Bairro
                <input
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                />
              </label>
              <label className="mt-4">
                Cidade
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </label>
            </View>
          </View>

          <View tag="card-client">
            <View tag="card-header">
              <ExclamationMarkIcon size={18} weight="duotone" />
              OBSERVAÇÕES
            </View>
            <View tag="card-body" className="shadow-sm">
              <textarea
                name="obs"
                className="input w-full p-2 rounded-md border h-24 bg-transparent outline-none"
                style={{ fontFamily: "inherit", fontSize: "0.9rem" }}
                value={formData.obs}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o cliente..."
              />
            </View>
          </View>
        </View>

        <footer className="footer-btn p-6">
          <Pressable onClick={handleSave}>
            {loading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <FloppyDisk size={24} />
            )}
            {loading
              ? "PROCESSANDO..."
              : editId
                ? "SALVAR ALTERAÇÕES"
                : "SALVAR CLIENTE"}
          </Pressable>
        </footer>
      </View>
    </>
  );
}
