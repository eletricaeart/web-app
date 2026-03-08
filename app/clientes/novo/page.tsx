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
import AvatarUpload from "@/components/forms/AvatarUpload"; // Componente que faremos

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

// Interface para definir a estrutura do Cliente e evitar 'any'
interface Cliente {
  id: string;
  name: string;
  gender: string;
  doc: string;
  whatsapp: string;
  email: string;
  cep: string;
  rua: string;
  num: string;
  complemento: string;
  bairro: string;
  cidade: string;
  obs: string;
  photo: string;
}

export default function ClienteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // Uso do Generic <Cliente> para tipar o hook
  const { data: clients, save: saveClient } = useEASync<Cliente>("clientes");

  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  // Estado tipado com a interface Cliente
  const [formData, setFormData] = useState<Cliente>({
    id: "",
    name: "",
    gender: "masc",
    doc: "",
    whatsapp: "",
    email: "",
    cep: "",
    rua: "",
    num: "",
    complemento: "",
    bairro: "",
    cidade: "",
    obs: "",
    photo: "",
  });

  // Carrega dados se for Edição
  useEffect(() => {
    if (editId && clients.length > 0) {
      const clientToEdit = clients.find((c) => String(c.id) === String(editId));
      if (clientToEdit) {
        setFormData((prev) => ({ ...prev, ...clientToEdit }));
      }
    }
  }, [editId, clients]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lógica de busca de CEP original
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br{cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
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
      id: editId || `TEMP_${Date.now()}`,
    };

    // Tipagem do retorno do save conforme useEASync
    const res = (await saveClient(payload, action)) as { success: boolean };

    if (res.success) {
      toast.success(editId ? "Cliente atualizado" : "Cliente cadastrado");
      if (editId) {
        router.replace(`/clientes/${editId}`);
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
          {/* Seção da Foto */}
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
            <View tag="card-header" className="">
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
                    name="doc"
                    value={formData.doc}
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
                    name="cep"
                    value={formData.cep}
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
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nº
                  <input
                    name="num"
                    value={formData.num}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <View className="mt-4">
                <label>
                  Comp.
                  <input
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Apto..."
                  />
                </label>
              </View>

              {/* <div className="grid grid-cols-2 gap-4 mt-4"> */}
              <label className="mt-4">
                Bairro
                <input
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                />
              </label>
              <label className="mt-4">
                Cidade
                <input
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </label>
              {/* </div> */}
            </View>
          </View>

          {/* Campo de Observações */}
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
          <Pressable onClick={handleSave} disabled={loading}>
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
          {/* <button */}
          {/*   className="btn-save w-full flex justify-center items-center gap-2" */}
          {/*   onClick={handleSave} */}
          {/*   disabled={loading} */}
          {/* > */}
          {/*   {loading ? ( */}
          {/*     <CircleNotch size={24} className="animate-spin" /> */}
          {/*   ) : ( */}
          {/*     <FloppyDisk size={24} /> */}
          {/*   )} */}
          {/*   {loading */}
          {/*     ? "PROCESSANDO..." */}
          {/*     : editId */}
          {/*       ? "SALVAR ALTERAÇÕES" */}
          {/*       : "SALVAR CLIENTE"} */}
          {/* </button> */}
        </footer>
      </View>
    </>
  );
}
