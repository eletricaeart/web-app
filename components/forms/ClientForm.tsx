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
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { UserPlus, MagnifyingGlass } from "@phosphor-icons/react";

export default function ClientForm({
  clientData,
  onClientChange,
  clientsCache = [],
  onNewClientClick,
}) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filtro de busca para o Drawer
  const filteredClients = useMemo(() => {
    return clientsCache.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, clientsCache]);

  const handleSelectClient = (client) => {
    onClientChange({
      name: client.name,
      cep: client.cep || client.address?.cep || "",
      rua: client.rua || client.address?.rua || "",
      num: client.num || client.address?.num || "",
      bairro: client.bairro || client.address?.bairro || "",
      cidade: client.cidade || client.address?.cidade || "",
    });
    setIsDrawerOpen(false); // Fecha o drawer após selecionar
  };

  // Busca automática de CEP
  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          onClientChange({
            ...clientData,
            cep: e.target.value,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: `${data.localidade} - ${data.uf}`,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  /* manter */
  const handleChange = (e) => {
    const { id, value } = e.target;
    // Mapeia o ID do input para a chave do objeto cliente
    const fieldMap = {
      c_name: "name",
      c_cep: "cep",
      c_rua: "rua",
      c_num: "num",
      c_complemento: "complemento",
      c_bairro: "bairro",
      c_cidade: "cidade",
      c_obs: "obs",
    };
    onClientChange({ ...clientData, [fieldMap[id]]: value });
  };

  // Preenchimento automático ao selecionar da lista
  const handleNameChange = (e) => {
    const selected = clientsCache.find((c) => c.name === e.target.value);
    if (selected) {
      onClientChange({
        name: selected.name,
        cep: selected.cep || "",
        rua: selected.rua || "",
        num: selected.num || "",
        bairro: selected.bairro || "",
        cidade: selected.cidade || "",
      });
    } else {
      handleChange(e);
    }
  };
  /* end manter */

  return (
    <View tag="cliente-fieldset">
      {/* Nome do Cliente */}
      <View tag="client-name_input">
        {/* Drawer de Seleção de Cliente */}

        <View tag="client-name_label">
          <Drawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            className="bg-amber-400"
          >
            <DrawerTrigger asChild>
              <View tag="btn_select-cliente">+ SELECIONAR da lista</View>
            </DrawerTrigger>
            <DrawerContent className="drawer h-[80vh] bg-[rgb(21,25,35)] items-center p-4">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="px-0">
                  <DrawerTitle className="text-[#00559C]">
                    Buscar Cliente
                  </DrawerTitle>
                </DrawerHeader>

                <div className="drawer-searchbar flex items-center gap-2 mb-4 ">
                  <div className="searchbar relative flex-1">
                    <MagnifyingGlass
                      className="MagnifyingGlass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder="Nome do cliente..."
                      className="client-name_input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      onNewClientClick();
                    }}
                    className="btn_add-newClient p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <UserPlus size={24} weight="duotone" />
                  </button>
                </div>

                <View
                  tag="clients-name_card"
                  className="overflow-y-auto max-h-[50vh] space-y-2"
                >
                  {filteredClients.map((c, i) => (
                    <>
                      <View
                        tag="client-name_card"
                        key={c.id}
                        className="p-3 border rounded-lg active:bg-slate-100 cursor-pointer"
                        onClick={() => handleSelectClient(c)}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-sm text-slate-500">
                          {c.cidade ||
                            c.address?.cidade ||
                            "Cidade não informada"}
                        </div>
                      </View>
                      {i != filteredClients.length - 1 && (
                        <View tag="divisor">
                          <section></section>
                        </View>
                      )}
                    </>
                  ))}
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
          className="input"
          placeholder="Selecione acima ou digite..."
          value={clientData.name}
          onChange={(e) =>
            onClientChange({ ...clientData, name: e.target.value })
          }
        />
      </View>

      {/* CEP */}
      <View tag="cep-input">
        <label>
          <View tag="t">
            CEP{" "}
            {loadingCep && (
              <span className={"styles.cepLoading"}>Buscando...</span>
            )}
          </View>
          <input
            type="text"
            id="c_cep"
            className={"styles.input"}
            placeholder="00000-000"
            maxLength="9"
            value={clientData.cep}
            onChange={handleChange}
            onBlur={handleCepBlur}
          />
        </label>
      </View>

      {/* Endereço */}
      <View
        tag="logradouro_numero-inputs"
        style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
      >
        <View tag="logradouro-input">
          <label className={"styles.label"}>
            <View tag="t">Logradouro (Rua/Av)</View>
            <input
              type="text"
              id="c_rua"
              placeholder="Av. President Kennedy ..."
              value={clientData.rua}
              onChange={handleChange}
            />
          </label>
        </View>
        <View tag="numero-input">
          <label className={"styles.label"}>
            <View tag="t">Número</View>
            <input
              type="text"
              id="c_num"
              className={"styles.input"}
              placeholder="Ex: 50"
              value={clientData.num}
              onChange={handleChange}
            />
          </label>
        </View>
        <View tag="complemento-input">
          <label className="styles.label">
            <View tag="t">Comp.</View>
            <input
              id="c_complemento"
              value={clientData.complemento}
              onChange={handleChange}
              placeholder="Apto..."
            />
          </label>
        </View>
      </View>

      <View tag="bairro-input">
        <label className={"styles.label"}>
          <View tag="t">Bairro</View>
          <input
            type="text"
            id="c_bairro"
            className={"styles.input"}
            placeholder="Ex: Aviação"
            value={clientData.bairro}
            onChange={handleChange}
          />
        </label>
      </View>
      <View tag="cidade-input">
        <label className={"styles.label"}>
          <View tag="t">Cidade/UF</View>
          <input
            type="text"
            id="c_cidade"
            className={"styles.input"}
            placeholder="Ex: Praia Grande - SP"
            value={clientData.cidade}
            onChange={handleChange}
          />
        </label>
      </View>

      {/* seção de observações sobre o cliente */}
      <View tag="obs-input" className="mt-4">
        <label className="styles.label">
          <View tag="t">Observações Internas</View>
          <textarea
            id="c_obs"
            className="input w-full p-2 rounded-md border h-20"
            value={clientData.obs}
            onChange={(e) =>
              onClientChange({ ...clientData, obs: e.target.value })
            }
          />
        </label>
      </View>
    </View>
  );
}
