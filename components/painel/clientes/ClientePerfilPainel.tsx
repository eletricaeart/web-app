// components/painel/clientes/ClientePerfilPainel.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import ClientGhostAvatar from './ClientGhostAvatar';
import {
  Pen,
  Trash,
  FilePlus,
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
  DotsThreeOutlineVertical,
  Notebook,
  IdentificationCard,
  FileText,
  Note,
  Phone,
  Wallet,
  Receipt,
  ChartLineUp,
  Clock,
  CalendarPlus,
  CaretRight,
  Copy,
  CheckCircle,
  Plus,
} from '@phosphor-icons/react';
import { Mask } from '@/utils/mask';
import { getNameGradient } from '@/lib/avatarColor';
import { toast } from 'sonner';

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import '../clientes/clientesIDStyle.css';
import Link from 'next/link';
import DeleteClientModal from './DeleteClientModal';
import { useDeleteEntity } from '@/hooks/useDeleteEntity';

interface Cliente {
  id: string;
  name: string;
  photo_url?: string;
  photo?: string;
  gender?: string;
  city?: string;
  whatsapp?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  zip?: string;
  cidade?: string;
  rua?: string;
  num?: string;
  bairro?: string;
  created_at?: string;
}

interface Orcamento {
  id: string;
  client_id?: string;
  client_name_manual?: string;
  document_title?: string;
  issue_date?: string;
  clientName?: string;
  documentTitle?: string;
  docTitle?: { text: string; emissao: string | Date };
  issueDate?: string;
  financial_json?: { total?: number };
  financial?: { total?: number };
}

interface Nota {
  id: string;
  client_id: string;
  date: string;
  title: string;
}

type Tab_ = 'infos' | 'budgets' | 'notes';

const CLOUD = {
  name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatShortDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClientePerfilPainel() {
  const router = usePainelRouter();
  const clientId = router.params.id;

  const { data: clients, save: saveClient } =
    useEASyncSupabase<Cliente>('clientes');
  const { data: orcamentos } = useEASyncSupabase<Orcamento>('orcamentos');
  const { data: notes } = useEASyncSupabase<Nota>('notas');

  const [client, setClient] = useState<Cliente | null>(null);
  const [activeTab, setActiveTab] = useState<Tab_>('infos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveClient, () => router.replace('clientes'));

  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find((c) => String(c.id) === String(clientId));
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  const historicoOrcamentos = useMemo(() => {
    if (!client) return [];
    return orcamentos.filter((o) => {
      const matchesId = o.client_id === client.id;
      const currentName = (client.name || '').toLowerCase();
      const matchesName =
        (o.client_name_manual || o.clientName || '').toLowerCase() ===
        currentName;
      return matchesId || matchesName;
    });
  }, [orcamentos, client]);

  const historicoNotas = useMemo(() => {
    if (!client) return [];
    return notes.filter((n) => String(n.client_id) === String(client.id));
  }, [notes, client]);

  const stats = useMemo(() => {
    const totalOrcamentos = historicoOrcamentos.length;
    const totalInvestido = historicoOrcamentos.reduce(
      (acc, o) =>
        acc + Number(o.financial_json?.total ?? o.financial?.total ?? 0),
      0,
    );
    const ticketMedio =
      totalOrcamentos > 0 ? totalInvestido / totalOrcamentos : 0;

    const allDates = [
      ...historicoOrcamentos.map((o) => o.issue_date || o.issueDate),
      ...historicoNotas.map((n) => n.date),
    ]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => !isNaN(t));

    const ultimaInteracao = allDates.length
      ? new Date(Math.max(...allDates))
      : null;

    const clienteDesde = client?.created_at
      ? new Date(client.created_at)
      : null;

    return {
      totalOrcamentos,
      totalInvestido,
      ticketMedio,
      ultimaInteracao,
      clienteDesde,
    };
  }, [historicoOrcamentos, historicoNotas, client]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    if (!CLOUD.name || !CLOUD.preset) {
      toast.error('Upload de imagem não configurado.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 4MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUD.preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
        { method: 'POST', body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        await saveClient(
          { id: client.id, photo_url: data.secure_url },
          'update',
        );
        setClient({ ...client, photo_url: data.secure_url });
        toast.success('Foto atualizada!');
      }
    } catch {
      toast.error('Erro ao subir imagem');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (!client)
    return (
      <View tag="page" className="p-10 text-center text-slate-500">
        Carregando perfil do cliente...
      </View>
    );

  const clientAvatar = client.photo_url || client.photo;
  const coverGradient = getNameGradient(client.name);

  return (
    <>
      <AppBar
        title=" "
        backAction={() => router.push('clientes')}
        transparent={true}
        options={
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-black/20 hover:bg-black/30 p-2 rounded-full backdrop-blur-md text-white transition-all">
                <DotsThreeOutlineVertical size={24} weight="bold" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-1.5 bg-white shadow-2xl rounded-2xl border border-slate-100 z-[10000] overflow-hidden"
              align="end"
            >
              <div className="flex flex-col gap-0.5">
                {[
                  {
                    label: 'Editar Cliente',
                    icon: (
                      <Pen
                        size={18}
                        className="text-indigo-600"
                        weight="duotone"
                      />
                    ),
                    option: () =>
                      router.push('clientes.novo', { id: client.id }),
                  },
                  {
                    label: 'Novo Orçamento',
                    icon: (
                      <FilePlus
                        size={18}
                        className="text-emerald-600"
                        weight="duotone"
                      />
                    ),
                    option: () =>
                      router.push('orcamentos.novo', { clienteId: client.id }),
                  },
                  {
                    label: 'Nova Nota Técnica',
                    icon: (
                      <Notebook
                        size={18}
                        className="text-amber-600"
                        weight="duotone"
                      />
                    ),
                    option: () =>
                      router.push('notas.novo', { clienteId: client.id }),
                  },
                ].map((O, i) => (
                  <button
                    key={i}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                    onClick={O.option}
                  >
                    {O.icon}
                    <span>{O.label}</span>
                  </button>
                ))}

                <button
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border-t border-slate-100 mt-1"
                  onClick={() => handleDeleteRequest(client.id, client.name)}
                >
                  <Trash size={18} className="text-red-500" weight="duotone" />
                  <span>Excluir Cliente</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        }
      />

      <div className="client-perfil-page absolute top-0 w-full bg-slate-50 min-h-[100dvh] pb-32">
        {/* --- CAPA HERO --- */}
        <div
          className="relative min-h-[180px] sm:min-h-[220px] text-white flex flex-col justify-end p-6"
          style={{ background: coverGradient }}
        >
          {/* Ações Rápidas Flutuantes */}
          <div className="flex items-center justify-end w-full gap-2.5 z-20">
            {client.whatsapp && (
              <Link
                href={`https://wa.me/${client.whatsapp}`}
                target="_blank"
                className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95"
              >
                <WhatsappLogo
                  size={20}
                  weight="duotone"
                  className="text-green-600"
                />
              </Link>
            )}
            {client.whatsapp && (
              <Link
                href={`tel:${client.whatsapp}`}
                className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95"
              >
                <Phone size={20} weight="duotone" className="text-slate-800" />
              </Link>
            )}
            {client.email && (
              <Link
                href={`mailto:${client.email}`}
                className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95"
              >
                <EnvelopeSimple
                  size={20}
                  weight="duotone"
                  className="text-blue-600"
                />
              </Link>
            )}
          </div>
        </div>

        {/* --- AVATAR E IDENTIFICAÇÃO --- */}
        <div className="relative w-full px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="z-30 relative self-start"
            >
              <div className="p-1 bg-white rounded-3xl shadow-xl">
                <ClientGhostAvatar
                  name={client.name}
                  gender={client.gender}
                  photoUrl={clientAvatar}
                  size={96}
                  onUploadClick={() => fileInputRef.current?.click()}
                  uploading={uploadingPhoto}
                />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 capitalize tracking-tight truncate">
                  {client.name}
                </h1>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ativo
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin size={15} className="text-slate-400" />
                {client.city || client.cidade || 'Cidade não informada'}
                {(client.neighborhood || client.bairro) &&
                  ` • ${client.neighborhood || client.bairro}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  router.push('orcamentos.novo', { clienteId: client.id })
                }
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus size={16} weight="bold" />
                Novo Orçamento
              </button>
            </div>
          </div>

          {/* --- CARDS DE ESTATÍSTICAS / KPIS --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
            <StatCard
              icon={<Wallet size={20} weight="duotone" />}
              label="Total em Propostas"
              value={formatCurrency(stats.totalInvestido)}
              accent="emerald"
            />
            <StatCard
              icon={<Receipt size={20} weight="duotone" />}
              label="Orçamentos"
              value={String(stats.totalOrcamentos)}
              accent="indigo"
            />
            <StatCard
              icon={<ChartLineUp size={20} weight="duotone" />}
              label="Ticket Médio"
              value={formatCurrency(stats.ticketMedio)}
              accent="amber"
            />
            <StatCard
              icon={<Clock size={20} weight="duotone" />}
              label="Última Interação"
              value={formatShortDate(stats.ultimaInteracao)}
              accent="sky"
            />
          </div>

          {/* --- NAVEGAÇÃO POR ABAS ANIMADAS --- */}
          <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1 mb-5">
            {[
              {
                id: 'infos',
                label: 'Dados de Contato',
                icon: <IdentificationCard size={18} weight="duotone" />,
              },
              {
                id: 'budgets',
                label: `Orçamentos (${historicoOrcamentos.length})`,
                icon: <FileText size={18} weight="duotone" />,
              },
              {
                id: 'notes',
                label: `Notas Técnicas (${historicoNotas.length})`,
                icon: <Note size={18} weight="duotone" />,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab_)}
                  className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="clientActiveTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm"
                      transition={{
                        type: 'spring',
                        bounce: 0.15,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* --- CONTEÚDO DAS ABAS COM ANIMAÇÃO --- */}
          <AnimatePresence mode="wait">
            {activeTab === 'infos' && (
              <motion.div
                key="infos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <IdentificationCard size={18} className="text-indigo-600" />
                    Informações do Cadastro
                  </h3>
                  <button
                    onClick={() =>
                      router.push('clientes.novo', { id: client.id })
                    }
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Pen size={14} />
                    Editar Dados
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                        <WhatsappLogo size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          WhatsApp
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {client.whatsapp
                            ? Mask.phone(client.whatsapp)
                            : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    {client.whatsapp && (
                      <button
                        onClick={() =>
                          copyToClipboard(client.whatsapp!, 'WhatsApp')
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all"
                        title="Copiar"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>

                  {/* E-mail */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <EnvelopeSimple size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          E-mail
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                          {client.email || 'Não informado'}
                        </p>
                      </div>
                    </div>
                    {client.email && (
                      <button
                        onClick={() => copyToClipboard(client.email!, 'E-mail')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all"
                        title="Copiar"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2 flex items-start justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 text-red-700 rounded-lg mt-0.5">
                        <MapPin size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Endereço de Atendimento
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {client.street || client.rua
                            ? `${client.street || client.rua}, ${client.number || client.num || 'S/N'} - ${
                                client.neighborhood || client.bairro || ''
                              }, ${client.city || client.cidade || ''}`
                            : 'Endereço não cadastrado'}
                        </p>
                        {client.zip && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            CEP: {client.zip}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {stats.clienteDesde && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-400">
                    <CalendarPlus size={15} />
                    Cliente cadastrado em {formatShortDate(stats.clienteDesde)}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'budgets' && (
              <motion.div
                key="budgets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText size={18} className="text-emerald-600" />
                    Histórico de Propostas & Orçamentos
                  </h3>
                  <button
                    onClick={() =>
                      router.push('orcamentos.novo', { clienteId: client.id })
                    }
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus size={14} weight="bold" />
                    Novo Orçamento
                  </button>
                </div>

                {historicoOrcamentos.length > 0 ? (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {historicoOrcamentos.map((orc) => {
                      const total = Number(
                        orc.financial_json?.total ?? orc.financial?.total ?? 0,
                      );
                      const title =
                        orc.document_title ||
                        orc.documentTitle ||
                        orc.docTitle?.text ||
                        'Orçamento de Serviços';

                      return (
                        <div
                          key={orc.id}
                          onClick={() =>
                            router.push('orcamentos.ver', { id: orc.id })
                          }
                          className="py-3.5 px-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-100 transition-colors">
                              <FileText size={20} weight="duotone" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {title}
                              </p>
                              <p className="text-xs text-slate-400">
                                Emitido em:{' '}
                                {orc.issue_date ||
                                  orc.issueDate ||
                                  (orc as any).docTitle?.emissao ||
                                  '—'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {total > 0 && (
                              <span className="text-sm font-extrabold text-emerald-600">
                                {formatCurrency(total)}
                              </span>
                            )}
                            <CaretRight
                              size={16}
                              className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">
                      Nenhum orçamento cadastrado para este cliente.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Note size={18} className="text-amber-600" />
                    Notas Técnicas & Laudos
                  </h3>
                  <button
                    onClick={() =>
                      router.push('notas.novo', { clienteId: client.id })
                    }
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Plus size={14} weight="bold" />
                    Nova Nota Técnica
                  </button>
                </div>

                {historicoNotas.length > 0 ? (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {historicoNotas.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => router.push('notas.ver', { id: n.id })}
                        className="py-3.5 px-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <Note size={20} weight="duotone" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(n.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <CaretRight
                          size={16}
                          className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Note size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">
                      Nenhuma nota técnica vinculada a este cliente.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DeleteClientModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        client={itemToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/* --- Componente Auxiliar: StatCard --- */
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'emerald' | 'indigo' | 'amber' | 'sky';
}) {
  const accentMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between"
    >
      <div
        className={`w-fit p-2.5 rounded-xl mb-2 border ${accentMap[accent]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-base sm:text-lg font-black text-slate-800 mt-0.5 truncate tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
