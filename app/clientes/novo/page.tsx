"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import { CircleNotch, FloppyDisk, MapPinPlus } from "@phosphor-icons/react";
import { toast } from "sonner";

/* shadcn components */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import "../Clientes.css";

export default function ClienteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { data: clients, save: saveClient } = useEASync("clientes");

  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "masc",
    doc: "",
    whatsapp: "",
    email: "",
    cep: "",
    rua: "",
    num: "",
    bairro: "",
    cidade: "",
  });

  // Carrega dados se for Edição
  useEffect(() => {
    if (editId && clients.length > 0) {
      const clientToEdit = clients.find(
        (c: any) => String(c.id) === String(editId),
      );
      if (clientToEdit) {
        setFormData(clientToEdit);
      }
    }
  }, [editId, clients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lógica de busca de CEP original
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
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

    // Se for novo, o GAS mestre cuidará do ID (TEMP_...),
    // se for edição, mantemos o ID atual.
    const payload = {
      ...formData,
      id: editId || `TEMP_${Date.now()}`,
    };

    const res = await saveClient(payload, action);

    if (res.success) {
      toast.success(editId ? "Cliente atualizado" : "Cliente cadastrado");
      // REGRA: router.replace remove a página de formulário da pilha de voltar
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
        <View tag="page-content">
          <View tag="card-ea-client" className="add-client-form">
            <View tag="card-ea-header">IDENTIFICAÇÃO</View>
            <View tag="card-ea-body">
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
                <label>
                  Gênero
                  <Select
                    value={formData.gender}
                    onValueChange={(val) =>
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

          <View tag="card-ea-client">
            <View tag="card-ea-header">CONTATO</View>
            <View tag="card-ea-body">
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

          <View tag="card-ea-client">
            <View
              tag="card-ea-header"
              className="flex justify-between items-center"
            >
              ENDEREÇO
              {fetchingCep && (
                <CircleNotch className="animate-spin text-amber-500" />
              )}
            </View>
            <View tag="card-ea-body">
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

              <div className="grid grid-cols-4 gap-4 mt-4">
                <label className="col-span-3">
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

              <div className="grid grid-cols-2 gap-4 mt-4">
                <label>
                  Bairro
                  <input
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Cidade
                  <input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </label>
              </div>
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
            {loading
              ? "PROCESSANDO..."
              : editId
                ? "SALVAR ALTERAÇÕES"
                : "SALVAR CLIENTE"}
          </button>
        </footer>
      </View>
    </>
  );
}
