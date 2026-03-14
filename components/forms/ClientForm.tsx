// components/forms/ClientForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import "./ClientForm.css";
import View from "../layout/View";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { UserPlus, MagnifyingGlass } from "@phosphor-icons/react";

/**
 * Interface Atualizada para Nomenclatura em Inglês
 */
interface ClientData {
  name: string;
  zip?: string; // CEP
  street?: string; // Rua
  number?: string; // Num
  neighborhood?: string; // Bairro
  city?: string; // Cidade/UF
  complement?: string; // Complemento
  obs?: string;
  [key: string]: any;
}

interface ClientFormProps {
  clientData: ClientData;
  onClientChange: (data: ClientData) => void;
  clientsCache?: any[];
  onNewClientClick: () => void;
  isOnNewBudget?: boolean;
}

export default function ClientForm({
  clientData,
  onClientChange,
  clientsCache = [],
  onNewClientClick,
  isOnNewBudget = false,
}: ClientFormProps) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filtro de busca para o Drawer (Suporte a name ou Nome Completo)
  const filteredClients = useMemo(() => {
    return clientsCache.filter((c) => {
      const name = c.name || c["Nome Completo"] || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, clientsCache]);

  const handleSelectClient = (client: any) => {
    // Mapeamento Inteligente: Tenta pegar o nome novo, senão o antigo
    onClientChange({
      name: client.name || client["Nome Completo"] || "",
      zip: client.zip || client.cep || client["CEP"] || "",
      street: client.street || client.rua || client["Rua"] || "",
      number: client.number || client.num || client["Número"] || "",
      neighborhood:
        client.neighborhood || client.bairro || client["Bairro"] || "",
      city: client.city || client.cidade || client["Cidade/UF"] || "",
      complement: client.complement || client.complemento || "",
      obs: client.obs || "",
    });
    setIsDrawerOpen(false);
  };

  // Busca automática de CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepValue = e.target.value.replace(/\D/g, "");
    if (cepValue.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await res.json();
        if (!data.erro) {
          onClientChange({
            ...clientData,
            zip: e.target.value,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: `${data.localidade} - ${data.uf}`,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    // Mapeia o ID do input para a nova chave em inglês
    /* const fieldMap: Record<string, keyof ClientData> = {
      c_name: "name",
      c_cep: "zip",
      c_rua: "street",
      c_num: "number",
      c_complemento: "complement",
      c_bairro: "neighborhood",
      c_cidade: "city",
      c_obs: "obs",
    }; */
    const fieldMap: Record<string, string> = {
      c_name: "name",
      c_cep: "zip",
      c_rua: "street",
      c_num: "number",
      c_complemento: "complement",
      c_bairro: "neighborhood",
      c_cidade: "city",
      c_obs: "obs",
    };

    const fieldName = fieldMap[id];
    if (fieldName) {
      onClientChange({ ...clientData, [fieldName]: value });
    }
  };

  // Preenchimento automático ao digitar nome idêntico ao cache
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const selected = clientsCache.find(
      (c) => (c.name || c["Nome Completo"]) === value,
    );
    console.warn(
      clientsCache.find((c) => (c.name || c["Nome Completo"]) === value),
    );

    if (selected) {
      handleSelectClient(selected);
    } else {
      onClientChange({ ...clientData, name: value });
    }
  };

  return (
    <View tag="cliente-fieldset">
      {/* Nome do Cliente / Drawer */}
      <View tag="client-name_input">
        <View tag="client-name_label">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <View tag="btn_select-cliente" className="cursor-pointer">
                + SELECIONAR da lista
              </View>
            </DrawerTrigger>
            <DrawerContent className="drawer h-[80vh] bg-[rgb(21,25,35)] items-center p-4">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="px-0">
                  <DrawerTitle className="text-[#00559C]">
                    Buscar Cliente
                  </DrawerTitle>
                </DrawerHeader>

                <div className="drawer-searchbar flex items-center gap-2 mb-4">
                  <div className="searchbar relative flex-1">
                    <MagnifyingGlass
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder="Nome do cliente..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onNewClientClick()}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <UserPlus size={24} weight="duotone" />
                  </button>
                </div>

                <View
                  tag="clients-name_card"
                  className="overflow-y-auto max-h-[50vh] space-y-2"
                >
                  {filteredClients.map((c, i) => {
                    const name = c.name || c["Nome Completo"] || "Sem Nome";
                    const city =
                      c.city || c.cidade || c["Cidade/UF"] || "Não informada";

                    return (
                      <React.Fragment key={c.id || i}>
                        <View
                          tag="client-name_card"
                          className="p-3 border rounded-lg active:bg-slate-100 cursor-pointer"
                          onClick={() => handleSelectClient(c)}
                        >
                          <div className="font-bold">{name}</div>
                          <div className="text-sm text-slate-500">{city}</div>
                        </View>
                      </React.Fragment>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum cliente encontrado
                    </div>
                  )}
                </View>
              </div>
            </DrawerContent>
          </Drawer>
          <View tag="t" className="label-text">
            Nome / Empresa
          </View>
        </View>
        <input
          type="text"
          id="c_name"
          className="input"
          placeholder="Selecione acima ou digite..."
          value={clientData.name || ""}
          onChange={handleNameChange}
        />
      </View>

      {/* ZIP (CEP) */}
      <View tag="cep-input">
        <label>
          <View tag="t">
            CEP{" "}
            {loadingCep && (
              <span className="text-amber-500 ml-2">Buscando...</span>
            )}
          </View>
          <input
            type="text"
            id="c_cep"
            className="input"
            placeholder="00000-000"
            maxLength={9}
            value={clientData.zip || ""}
            onChange={handleChange}
            onBlur={handleCepBlur}
          />
        </label>
      </View>

      {/* Street and Number */}
      <View
        tag="logradouro_numero-inputs"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}
      >
        <View tag="logradouro-input">
          <label>
            <View tag="t">Logradouro (Rua/Av)</View>
            <input
              type="text"
              id="c_rua"
              className="input"
              value={clientData.street || ""}
              onChange={handleChange}
            />
          </label>
        </View>
        <View tag="numero-input">
          <label>
            <View tag="t">Número</View>
            <input
              type="text"
              id="c_num"
              className="input"
              value={clientData.number || ""}
              onChange={handleChange}
            />
          </label>
        </View>
      </View>

      {/* Complement */}
      <View tag="complemento-input">
        <label>
          <View tag="t">Complemento</View>
          <input
            type="text"
            id="c_complemento"
            className="input"
            value={clientData.complement || ""}
            onChange={handleChange}
            placeholder="Apto..."
          />
        </label>
      </View>

      {/* Neighborhood and City */}
      <View tag="bairro-input">
        <label>
          <View tag="t">Bairro</View>
          <input
            type="text"
            id="c_bairro"
            className="input"
            value={clientData.neighborhood || ""}
            onChange={handleChange}
          />
        </label>
      </View>

      <View tag="cidade-input">
        <label>
          <View tag="t">Cidade/UF</View>
          <input
            type="text"
            id="c_cidade"
            className="input"
            value={clientData.city || ""}
            onChange={handleChange}
          />
        </label>
      </View>

      {/* Observações */}
      {!isOnNewBudget && (
        <View tag="obs-input" className="mt-4">
          <label>
            <View tag="t">Observações Internas</View>
            <textarea
              id="c_obs"
              className="input w-full p-2 rounded-md border h-20"
              value={clientData.obs || ""}
              onChange={handleChange}
            />
          </label>
        </View>
      )}
    </View>
  );
}
