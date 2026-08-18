// components/forms/ClientForm.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  UserPlus,
  MagnifyingGlass,
  MapPin,
  CheckCircle,
  X,
  Phone,
  EnvelopeSimple,
  CircleNotch,
  FloppyDisk,
  IdentificationCard,
  Tag,
  AddressBook,
  CaretDown,
  UserCheck,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { CLIENT_CATEGORIES, CLIENT_LEAD_SOURCES } from '@/lib/clientMeta';
import AvatarUpload from './AvatarUpload';
import { toast } from 'sonner';
import { Mask } from '@/utils/mask';
import './ClientForm.css';

export interface ClientData {
  id?: string;
  name: string;
  zip?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
  obs?: string;
  document?: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  category?: string;
  photo_url?: string;
  photo?: string;
  [key: string]: any;
}

interface ClientFormProps {
  clientData: ClientData;
  onClientChange: (data: ClientData) => void;
  clientsCache?: any[];
  onNewClientClick?: () => void;
  isOnNewBudget?: boolean;
}

export default function ClientForm({
  clientData,
  onClientChange,
  clientsCache = [],
  onNewClientClick,
  isOnNewBudget = false,
}: ClientFormProps) {
  const { save: saveClientToDb } = useEASyncSupabase<any>('clientes');

  const [loadingCep, setLoadingCep] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectDrawerOpen, setIsSelectDrawerOpen] = useState(false);
  const [isNewClientDrawerOpen, setIsNewClientDrawerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);

  // Formulário do novo cliente inline
  const [savingNewClient, setSavingNewClient] = useState(false);
  const [fetchingNewClientCep, setFetchingNewClientCep] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    gender: 'masc',
    document: '',
    category: '',
    lead_source: '',
    whatsapp: '',
    email: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    obs: '',
    photo_url: '',
  });

  // Filtro de clientes existentes
  const filteredClients = useMemo(() => {
    const term = (isSelectDrawerOpen ? searchTerm : clientData.name || '')
      .toLowerCase()
      .trim();

    if (isSelectDrawerOpen) {
      if (!term) return clientsCache;
      return clientsCache.filter((c) => {
        const name = (c.name || c['Nome Completo'] || '').toLowerCase();
        const doc = (c.document || c['CPF / CNPJ'] || '').toLowerCase();
        const city = (c.city || c['Cidade'] || '').toLowerCase();
        return name.includes(term) || doc.includes(term) || city.includes(term);
      });
    }

    if (!isSelectDrawerOpen && term.length < 2) return [];

    return clientsCache.filter((c) => {
      const name = (c.name || c['Nome Completo'] || '').toLowerCase();
      return name.includes(term);
    });
  }, [searchTerm, clientsCache, clientData.name, isSelectDrawerOpen]);

  const handleSelectClient = (client: any) => {
    console.log('[ClientForm] Cliente selecionado para o orçamento:', client);
    onClientChange({
      id: client.id || '',
      name: client.name || client['Nome Completo'] || '',
      zip: client.zip || client.cep || client['CEP'] || '',
      street: client.street || client.rua || client['Rua'] || '',
      number: client.number || client.num || client['Número'] || '',
      neighborhood:
        client.neighborhood || client.bairro || client['Bairro'] || '',
      city: client.city || client.cidade || client['Cidade/UF'] || '',
      complement: client.complement || client.complemento || '',
      obs: client.obs || '',
      document: client.document || client['CPF / CNPJ'] || client.doc || '',
      whatsapp: client.whatsapp || client.telefone || '',
      email: client.email || '',
      gender: client.gender || 'masc',
      category: client.category || '',
      photo_url: client.photo_url || client.photo || '',
    });

    setIsSelectDrawerOpen(false);
    setShowSuggestions(false);
    toast.success(
      `Cliente "${client.name || client['Nome Completo']}" selecionado!`,
    );
  };

  const handleClearClient = () => {
    onClientChange({
      id: '',
      name: '',
      zip: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      complement: '',
      obs: '',
      document: '',
      whatsapp: '',
      email: '',
    });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepValue = e.target.value.replace(/\D/g, '');
    if (cepValue.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await res.json();
        if (!data.erro) {
          onClientChange({
            ...clientData,
            zip: e.target.value,
            street: data.logradouro || clientData.street || '',
            neighborhood: data.bairro || clientData.neighborhood || '',
            city: data.localidade
              ? `${data.localidade}${data.uf ? ` - ${data.uf}` : ''}`
              : clientData.city || '',
          });
          toast.success('Endereço localizado via CEP');
        }
      } catch (err) {
        console.error('[ClientForm] Erro ao buscar CEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleNewClientCepBlur = async () => {
    const cepValue = newClientData.zip.replace(/\D/g, '');
    if (cepValue.length !== 8) return;

    setFetchingNewClientCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setNewClientData((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade
            ? `${data.localidade}${data.uf ? ` - ${data.uf}` : ''}`
            : prev.city,
        }));
        toast.success('Endereço preenchido via CEP');
      }
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setFetchingNewClientCep(false);
    }
  };

  const handleSaveAndAttachNewClient = async () => {
    if (!newClientData.name.trim()) {
      return toast.error('O Nome Completo do cliente é obrigatório.');
    }

    setSavingNewClient(true);
    try {
      console.log(
        '[ClientForm] Salvando novo cliente criado na tela de orçamento...',
        newClientData,
      );
      const created = await saveClientToDb(newClientData, 'create');

      if (created) {
        handleSelectClient(created);
        setIsNewClientDrawerOpen(false);
        // Reset form
        setNewClientData({
          name: '',
          gender: 'masc',
          document: '',
          category: '',
          lead_source: '',
          whatsapp: '',
          email: '',
          zip: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          obs: '',
          photo_url: '',
        });
      }
    } catch (err: any) {
      console.error('[ClientForm] Erro ao salvar novo cliente:', err);
      toast.error('Erro ao cadastrar cliente.');
    } finally {
      setSavingNewClient(false);
    }
  };

  const isClientSelected = Boolean(clientData.name?.trim());

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* --- MODO: CLIENTE SELECIONADO (CARD DESTAQUE) --- */}
      {isClientSelected ? (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-slate-800 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-lg shrink-0">
                {clientData.photo_url ? (
                  <img
                    src={clientData.photo_url}
                    alt={clientData.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  clientData.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-base tracking-tight text-white capitalize truncate">
                    {clientData.name}
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <UserCheck size={12} weight="bold" /> Selecionado
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  {clientData.city || 'Cidade não informada'}
                  {clientData.neighborhood
                    ? ` • ${clientData.neighborhood}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSelectDrawerOpen(true)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                title="Trocar cliente"
              >
                <ArrowsClockwise size={14} />
                Trocar
              </button>
              <button
                type="button"
                onClick={handleClearClient}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all"
                title="Desvincular cliente"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Dados rápidos de contato e documento */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            {clientData.whatsapp && (
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <Phone size={13} className="text-green-400 shrink-0" />
                <span>{Mask.phone(clientData.whatsapp)}</span>
              </div>
            )}
            {clientData.document && (
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <IdentificationCard
                  size={13}
                  className="text-indigo-400 shrink-0"
                />
                <span>{clientData.document}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- MODO: BUSCA & SELEÇÃO RÁPIDA --- */
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full h-12 pl-10 pr-4 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400"
                placeholder="Digite para buscar ou clique em Selecionar..."
                value={clientData.name || ''}
                onChange={(e) => {
                  onClientChange({ ...clientData, name: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSelectDrawerOpen(true)}
              className="h-12 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 border border-slate-200"
            >
              Lista
            </button>

            <button
              type="button"
              onClick={() => setIsNewClientDrawerOpen(true)}
              className="h-12 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <UserPlus size={16} weight="bold" />+ Novo
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions &&
            filteredClients.length > 0 &&
            !isSelectDrawerOpen && (
              <div className="absolute top-14 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Clientes Encontrados ({filteredClients.length})</span>
                  <span className="text-indigo-600">
                    Clique para selecionar
                  </span>
                </div>
                {filteredClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className="p-3 hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {(c.name || c['Nome Completo'] || 'C')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                          {c.name || c['Nome Completo']}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin size={11} />
                          {c.city || c.cidade || 'Cidade não informada'}
                          {(c.neighborhood || c.bairro) &&
                            ` • ${c.neighborhood || c.bairro}`}
                        </p>
                      </div>
                    </div>
                    <CheckCircle
                      size={18}
                      className="text-slate-300 group-hover:text-indigo-600 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

          {showSuggestions && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSuggestions(false)}
            />
          )}
        </div>
      )}

      {/* --- SEÇÃO DE ENDEREÇO / CAMPOS DETALHADOS (EXPANSÍVEL OU EDITÁVEL) --- */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-3 mt-1">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowAddressFields(!showAddressFields)}
        >
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <AddressBook size={16} className="text-indigo-600" />
            Endereço do Local de Atendimento
          </span>
          <button
            type="button"
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            {showAddressFields ? 'Ocultar campos' : 'Ver / Editar endereço'}
            <CaretDown
              size={13}
              className={`transition-transform duration-200 ${showAddressFields ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Resumo compacto quando fechado */}
        {!showAddressFields && (
          <p className="text-xs text-slate-500 truncate">
            {clientData.street
              ? `${clientData.street}, ${clientData.number || 'S/N'}${
                  clientData.complement ? ` (${clientData.complement})` : ''
                } - ${clientData.neighborhood || ''}, ${clientData.city || ''}`
              : 'Nenhum endereço preenchido para este orçamento.'}
          </p>
        )}

        {/* Formulário detalhado quando aberto */}
        {showAddressFields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
            {/* CEP */}
            <div className="sm:col-span-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                CEP{' '}
                {loadingCep && (
                  <CircleNotch
                    size={12}
                    className="animate-spin text-amber-500"
                  />
                )}
              </label>
              <Input
                type="text"
                placeholder="00000-000"
                maxLength={9}
                value={clientData.zip || ''}
                onChange={(e) =>
                  onClientChange({ ...clientData, zip: e.target.value })
                }
                onBlur={handleCepBlur}
                className="h-10 bg-white"
              />
            </div>

            {/* Rua */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                Logradouro (Rua / Av)
              </label>
              <Input
                type="text"
                placeholder="Ex: Rua das Flores"
                value={clientData.street || ''}
                onChange={(e) =>
                  onClientChange({ ...clientData, street: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>

            {/* Número */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                Número
              </label>
              <Input
                type="text"
                placeholder="Ex: 123"
                value={clientData.number || ''}
                onChange={(e) =>
                  onClientChange({ ...clientData, number: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>

            {/* Complemento */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                Complemento
              </label>
              <Input
                type="text"
                placeholder="Apto, Bloco..."
                value={clientData.complement || ''}
                onChange={(e) =>
                  onClientChange({ ...clientData, complement: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                Bairro
              </label>
              <Input
                type="text"
                placeholder="Ex: Centro"
                value={clientData.neighborhood || ''}
                onChange={(e) =>
                  onClientChange({
                    ...clientData,
                    neighborhood: e.target.value,
                  })
                }
                className="h-10 bg-white"
              />
            </div>

            {/* Cidade */}
            <div className="sm:col-span-3">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                Cidade / UF
              </label>
              <Input
                type="text"
                placeholder="Ex: Praia Grande - SP"
                value={clientData.city || ''}
                onChange={(e) =>
                  onClientChange({ ...clientData, city: e.target.value })
                }
                className="h-10 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* --- DRAWER 1: SELECIONAR CLIENTE DA LISTA COMPLETA --- */}
      {/* ========================================================= */}
      <Drawer open={isSelectDrawerOpen} onOpenChange={setIsSelectDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-white rounded-t-[2rem]">
          <div className="max-w-md mx-auto w-full p-4 flex flex-col h-full">
            <DrawerHeader className="px-0 pt-0 pb-3 flex items-center justify-between">
              <DrawerTitle className="text-slate-800 text-lg font-bold">
                Selecionar Cliente
              </DrawerTitle>
              <button
                type="button"
                onClick={() => {
                  setIsSelectDrawerOpen(false);
                  setIsNewClientDrawerOpen(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1"
              >
                <UserPlus size={15} />+ Cadastrar Novo
              </button>
            </DrawerHeader>

            <div className="relative mb-3">
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Buscar por nome, documento ou cidade..."
                className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 divide-y divide-slate-100">
              {filteredClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  className="p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {(c.name || c['Nome Completo'] || 'C')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        {c.name || c['Nome Completo']}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={12} />
                        {c.city || c.cidade || 'Cidade não informada'}
                        {(c.neighborhood || c.bairro) &&
                          ` • ${c.neighborhood || c.bairro}`}
                      </p>
                    </div>
                  </div>
                  <CheckCircle size={20} className="text-indigo-600" />
                </div>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm font-medium">
                    Nenhum cliente encontrado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectDrawerOpen(false);
                      setIsNewClientDrawerOpen(true);
                    }}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Clique aqui para cadastrar agora
                  </button>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ========================================================= */}
      {/* --- DRAWER 2: CADASTRAR NOVO CLIENTE DIRETAMENTE AQUI --- */}
      {/* ========================================================= */}
      <Drawer
        open={isNewClientDrawerOpen}
        onOpenChange={setIsNewClientDrawerOpen}
      >
        <DrawerContent className="max-h-[92vh] bg-slate-50 rounded-t-[2rem]">
          <div className="max-w-md mx-auto w-full p-4 flex flex-col h-full overflow-y-auto pb-10">
            <DrawerHeader className="px-0 pt-0 pb-3 flex items-center justify-between">
              <DrawerTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600" />
                Cadastrar Novo Cliente
              </DrawerTitle>
              <button
                type="button"
                onClick={() => setIsNewClientDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X size={20} />
              </button>
            </DrawerHeader>

            <div className="flex flex-col gap-3.5">
              {/* Avatar e Identificação */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-center pb-2">
                  <AvatarUpload
                    value={newClientData.photo_url}
                    gender={newClientData.gender}
                    name={newClientData.name}
                    onChange={(url: string) =>
                      setNewClientData((prev) => ({ ...prev, photo_url: url }))
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                    Nome Completo *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={newClientData.name}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        name: e.target.value,
                      })
                    }
                    className="h-11 bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Gênero
                    </label>
                    <Select
                      value={newClientData.gender}
                      onValueChange={(val) =>
                        setNewClientData({ ...newClientData, gender: val })
                      }
                    >
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masc">Masculino</SelectItem>
                        <SelectItem value="fem">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      CPF / CNPJ
                    </label>
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={newClientData.document}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          document: e.target.value,
                        })
                      }
                      className="h-11 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Perfil (Categoria & Origem) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2.5">
                  <Tag size={16} className="text-indigo-600" />
                  Perfil do Cliente
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Categoria
                    </label>
                    <Select
                      value={newClientData.category || ''}
                      onValueChange={(val) =>
                        setNewClientData({ ...newClientData, category: val })
                      }
                    >
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-xs">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Origem
                    </label>
                    <Select
                      value={newClientData.lead_source || ''}
                      onValueChange={(val) =>
                        setNewClientData({ ...newClientData, lead_source: val })
                      }
                    >
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-xs">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_LEAD_SOURCES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2.5">
                  <Phone size={16} className="text-green-600" />
                  Contato
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      WhatsApp
                    </label>
                    <Input
                      type="text"
                      placeholder="(13) 99999-9999"
                      value={newClientData.whatsapp}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          whatsapp: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      placeholder="cliente@email.com"
                      value={newClientData.email}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          email: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <AddressBook size={16} className="text-red-500" />
                    Endereço
                  </div>
                  {fetchingNewClientCep && (
                    <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                      <CircleNotch size={12} className="animate-spin" />{' '}
                      Buscando CEP...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      CEP
                    </label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={newClientData.zip}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          zip: e.target.value,
                        })
                      }
                      onBlur={handleNewClientCepBlur}
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Rua
                    </label>
                    <Input
                      type="text"
                      value={newClientData.street}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          street: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Nº
                    </label>
                    <Input
                      type="text"
                      value={newClientData.number}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          number: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Comp.
                    </label>
                    <Input
                      type="text"
                      placeholder="Apto..."
                      value={newClientData.complement}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          complement: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Bairro
                    </label>
                    <Input
                      type="text"
                      value={newClientData.neighborhood}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          neighborhood: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Cidade
                    </label>
                    <Input
                      type="text"
                      value={newClientData.city}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          city: e.target.value,
                        })
                      }
                      className="h-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <button
                type="button"
                onClick={handleSaveAndAttachNewClient}
                disabled={savingNewClient}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
              >
                {savingNewClient ? (
                  <CircleNotch size={20} className="animate-spin" />
                ) : (
                  <FloppyDisk size={20} weight="bold" />
                )}
                {savingNewClient
                  ? 'Salvando e Vinculando...'
                  : 'Salvar e Vincular ao Orçamento'}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
