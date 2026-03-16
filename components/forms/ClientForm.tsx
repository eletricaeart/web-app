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
import { UserPlus, MagnifyingGlass, MapPin } from "@phosphor-icons/react";

interface ClientData {
  name: string;
  zip?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
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

  // Novo estado para controlar a exibição das sugestões rápidas
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtro inteligente: Se o Drawer estiver aberto, mostra tudo (ou o filtro do drawer).
  // Se estiver no input principal, só mostra se tiver mais de 2 letras.
  const filteredClients = useMemo(() => {
    const term = (
      isDrawerOpen ? searchTerm : clientData.name || ""
    ).toLowerCase();

    // Se o Drawer estiver aberto, filtramos a lista com base no termo de busca do Drawer
    if (isDrawerOpen) {
      if (!term) return clientsCache; // Se não digitou nada no drawer, mostra todos
      return clientsCache.filter((c) => {
        const name = (c.name || c["Nome Completo"] || "").toLowerCase();
        return name.includes(term);
      });
    }

    // Se estiver no input principal (Autocomplete rápido)
    if (!isDrawerOpen && term.length < 2) return [];

    return clientsCache.filter((c) => {
      const name = (c.name || c["Nome Completo"] || "").toLowerCase();
      return name.includes(term);
    });
  }, [searchTerm, clientsCache, clientData.name, isDrawerOpen]);

  const handleSelectClient = (client: any) => {
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
    setShowSuggestions(false);
  };

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

      // Se estiver digitando no nome, abre as sugestões
      if (id === "c_name") setShowSuggestions(true);
    }
  };

  return (
    <View tag="cliente-fieldset" className="relative">
      {/* Nome do Cliente / Drawer */}
      <View tag="client-name_input" className="relative">
        <View tag="client-name_label">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <View tag="btn_select-cliente" className="cursor-pointer">
                + SELECIONAR da lista
              </View>
            </DrawerTrigger>
            <DrawerContent className="drawer h-[80vh] bg-[rgb(21,25,35)] items-center p-4">
              {/* ... (Manter conteúdo do Drawer original para busca profunda) ... */}
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
                    className="p-2 bg-blue-600 text-white rounded-md"
                  >
                    <UserPlus size={24} weight="duotone" />
                  </button>
                </div>
                <View
                  tag="clients-name_card"
                  className="overflow-y-auto max-h-[50vh] space-y-2"
                >
                  {filteredClients.map((c, i) => (
                    <View
                      key={c.id || i}
                      tag="client-name_card"
                      className="p-3 border rounded-lg active:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectClient(c)}
                    >
                      <div className="font-bold">
                        {c.name || c["Nome Completo"]}
                      </div>
                      <div className="text-sm text-slate-500">
                        {c.city || c.cidade || "Cidade n/i"}
                      </div>
                    </View>
                  ))}
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
          placeholder="Digite o nome do cliente..."
          value={clientData.name || ""}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
        />
        <View
          tag="autocomplete-holder"
          className="relative flex w-full h-[1px]"
        >
          {/* --- LISTA DE SUGESTÕES RÁPIDAS (Autocomplete) --- */}
          {showSuggestions && filteredClients.length > 0 && !isDrawerOpen && (
            <View
              tag="autocomplete-suggestions"
              className="absolute z-[100] w-full bg-white shadow-2xl rounded-xl mt-1 border border-slate-200 max-h-60 overflow-y-auto"
            >
              <header className="p-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 tracking-widest uppercase">
                Clientes encontrados
              </header>
              {filteredClients.map((c, i) => (
                <View
                  key={c.id || i}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-none"
                  onClick={() => handleSelectClient(c)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <UserPlus size={16} weight="duotone" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {c.name || c["Nome Completo"]}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {c.city || c.cidade || "Cidade n/i"}
                    </span>
                  </div>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* ZIP (CEP) */}
      <View tag="cep-input">
        <label>
          <View tag="t">
            CEP{" "}
            {loadingCep && (
              <span className="text-amber-500 ml-2 italic text-xs">
                Buscando...
              </span>
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
      <div className="grid grid-cols-2 gap-2">
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
      </div>

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

      {/* Overlay para fechar sugestões ao clicar fora */}
      {showSuggestions && filteredClients.length > 0 && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </View>
  );
}
