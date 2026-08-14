// components/painel/perfil/PerfilPainel.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import View from '@/components/layout/View';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import { getNameGradient } from '@/lib/avatarColor';
import {
  WhatsappLogo,
  EnvelopeSimple,
  Briefcase,
  IdentificationCard,
  SignOut,
  FileText,
  Notebook,
  CalendarBlank,
  PencilSimple,
  Sparkle,
  CurrencyCircleDollar,
  CheckCircle,
  Copy,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Lightning,
  PhoneCall,
  Clock,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RegistroOrcamento {
  id: string;
  owner_id?: string;
  client_id?: string;
  client_name_manual?: string;
  clientName?: string;
  document_title?: string;
  documentTitle?: string;
  issue_date?: string;
  issueDate?: string;
  created_at?: string;
  financial_json?: { total?: number };
  financial?: { total?: number };
}

interface RegistroNota {
  id: string;
  owner_id?: string;
  client_id?: string;
  title?: string;
  date?: string;
  created_at?: string;
}

type TabType = 'visao-geral' | 'orcamentos' | 'notas' | 'contato';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatShortDate(value: Date | string | null | undefined) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PerfilPainel() {
  const router = usePainelRouter();
  const { profile, loading, signOut } = usePainelAuth();
  const [activeTab, setActiveTab] = useState<TabType>('visao-geral');

  const { data: orcamentos } =
    useEASyncSupabase<RegistroOrcamento>('orcamentos');
  const { data: notas } = useEASyncSupabase<RegistroNota>('notas');

  // Filtragem e cálculos para estatísticas do perfil
  const userBudgets = useMemo(() => {
    if (!profile) return [];
    return orcamentos.filter(
      (o) =>
        o.owner_id === profile.id || (!o.owner_id && profile.role === 'CEO'),
    );
  }, [orcamentos, profile]);

  const userNotes = useMemo(() => {
    if (!profile) return [];
    return notas.filter(
      (n) =>
        n.owner_id === profile.id || (!n.owner_id && profile.role === 'CEO'),
    );
  }, [notas, profile]);

  const totalBudgetValue = useMemo(() => {
    return userBudgets.reduce((acc, curr) => {
      const val = curr.financial_json?.total ?? curr.financial?.total ?? 0;
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);
  }, [userBudgets]);

  const stats = useMemo(() => {
    if (!profile)
      return {
        budgets: 0,
        notes: 0,
        since: null as Date | null,
        totalValue: 0,
      };
    return {
      budgets: userBudgets.length,
      notes: userNotes.length,
      since: profile.created_at ? new Date(profile.created_at) : null,
      totalValue: totalBudgetValue,
    };
  }, [userBudgets, userNotes, profile, totalBudgetValue]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">
            Carregando dados do perfil...
          </p>
        </div>
      </div>
    );
  }

  const coverGradient = getNameGradient(profile.name || 'Perfil');

  return (
    <>
      <PainelAppBar title="Meu Perfil" backAction={() => router.push('home')} />

      <div className="bg-slate-50 min-h-screen pb-32">
        {/* --- HEADER HERO / CAPA VIBRANTE --- */}
        <div
          className="relative text-white overflow-hidden transition-all shadow-md"
          style={{ background: coverGradient }}
        >
          {/* Textura geométrica sutil no fundo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Brilho decorativo no topo */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pb-16 relative z-10 flex flex-col items-center text-center">
            {/* Avatar Central com Animação e Borda Dupla */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative group cursor-pointer"
              onClick={() => router.push('equipe.editar', { id: profile.id })}
            >
              <div className="p-1 rounded-full bg-white/30 backdrop-blur-md shadow-2xl transition-transform group-hover:scale-105">
                <ClientGhostAvatar
                  name={profile.name || 'Profissional'}
                  gender={profile.gender}
                  photoUrl={profile.photo_url}
                  size={120}
                  showGenderBadge={false}
                />
              </div>

              {/* Selo de Cargo / Status */}
              <div className="absolute -bottom-1 right-2 bg-emerald-500 border-2 border-white text-white p-1.5 rounded-full shadow-lg flex items-center justify-center">
                <CheckCircle size={16} weight="fill" />
              </div>
            </motion.div>

            {/* Nome e Cargo */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-4 space-y-1.5"
            >
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                  {profile.name || 'Profissional'}
                </h1>
                {profile.role && (
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {profile.role}
                  </span>
                )}
              </div>

              <p className="text-white/80 text-sm font-medium flex items-center justify-center gap-1.5">
                <Lightning size={16} weight="fill" className="text-amber-300" />
                <span>Elétrica & Art</span>
                <span className="text-white/40">•</span>
                <span>{profile.specialty || 'Especialista Técnico'}</span>
              </p>
            </motion.div>

            {/* Ações Rápidas no Header */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-6 flex items-center justify-center gap-2.5 flex-wrap"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('equipe.editar', { id: profile.id })}
                className="bg-white/90 hover:bg-white text-slate-900 border-none font-bold text-xs rounded-xl h-9 px-4 shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-2"
              >
                <PencilSimple size={16} weight="bold" />
                <span>Editar Dados</span>
              </Button>

              {profile.whatsapp && (
                <a
                  href={`https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-sm active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <WhatsappLogo size={18} weight="fill" />
                  <span>WhatsApp</span>
                </a>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-sm active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md border border-white/20"
                >
                  <EnvelopeSimple size={18} weight="bold" />
                  <span>E-mail</span>
                </a>
              )}
            </motion.div>
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL (COM TABS E CARDS MODERNOS) --- */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-6">
          {/* TAB BAR NAVEGADOR ESTILIZADO */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {[
              {
                id: 'visao-geral',
                label: 'Visão Geral',
                icon: <Sparkle size={18} weight="duotone" />,
              },
              {
                id: 'orcamentos',
                label: `Orçamentos (${stats.budgets})`,
                icon: <FileText size={18} weight="duotone" />,
              },
              {
                id: 'notas',
                label: `Notas (${stats.notes})`,
                icon: <Notebook size={18} weight="duotone" />,
              },
              {
                id: 'contato',
                label: 'Informações',
                icon: <IdentificationCard size={18} weight="duotone" />,
              },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap flex-1 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'text-indigo-600 bg-indigo-50/90 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CORPO DAS TABS ANIMADO */}
          <AnimatePresence mode="wait">
            {activeTab === 'visao-geral' && (
              <motion.div
                key="visao-geral"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* GRID DE KPIs / ESTATÍSTICAS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Orçamentos
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={18} weight="duotone" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-black text-slate-800 tracking-tight">
                        {stats.budgets}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Emitidos por você
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Notas Técnicas
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Notebook size={18} weight="duotone" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-black text-slate-800 tracking-tight">
                        {stats.notes}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Laudos & Vistorias
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Volume Total
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CurrencyCircleDollar size={18} weight="duotone" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-lg sm:text-xl font-black text-emerald-600 tracking-tight truncate">
                        {formatCurrency(stats.totalValue)}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Em propostas
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Membro Desde
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <CalendarBlank size={18} weight="duotone" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-black text-slate-800 tracking-tight truncate">
                        {formatShortDate(stats.since)}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Ativo na equipe
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD BIO & ESPECIALIDADES */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Briefcase size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                          Especialidade & Apresentação
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Informações técnicas e biografia profissional
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push('equipe.editar', { id: profile.id })
                      }
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs h-8 rounded-xl"
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Área de Atuação
                      </span>
                      <p className="text-slate-800 font-bold text-sm">
                        {profile.specialty ||
                          'Instalações Elétricas Residenciais & Comerciais'}
                      </p>
                    </div>

                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Cargo / Função
                      </span>
                      <p className="text-slate-800 font-bold text-sm">
                        {profile.role || 'Membro da Equipe Técnica'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Sobre o Profissional
                    </span>
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium">
                      {profile.about ? (
                        profile.about
                      ) : (
                        <span className="text-slate-400 italic">
                          Nenhuma descrição cadastrada. Clique em "Editar Dados"
                          para adicionar um resumo profissional.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ÚLTIMOS ORÇAMENTOS E NOTAS (PREVIEW RÁPIDO) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card Orçamentos Recentes */}
                  <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={18}
                            weight="duotone"
                            className="text-indigo-600"
                          />
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Últimos Orçamentos
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('orcamentos')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          Ver todos
                        </button>
                      </div>

                      {userBudgets.length > 0 ? (
                        <div className="space-y-2">
                          {userBudgets.slice(0, 3).map((b) => (
                            <div
                              key={b.id}
                              onClick={() =>
                                router.push('orcamentos.ver', { id: b.id })
                              }
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                            >
                              <div className="min-w-0 flex-1 mr-2">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {b.document_title ||
                                    b.documentTitle ||
                                    'Orçamento Elétrica & Art'}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {b.client_name_manual ||
                                    b.clientName ||
                                    'Cliente sem nome'}
                                </p>
                              </div>
                              <span className="text-xs font-black text-emerald-600 shrink-0">
                                {formatCurrency(
                                  b.financial_json?.total ??
                                    b.financial?.total ??
                                    0,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 py-3 italic">
                          Nenhum orçamento registrado ainda.
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('orcamentos.novo')}
                      className="w-full mt-4 h-9 rounded-xl border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={16} weight="bold" />
                      Criar Novo Orçamento
                    </Button>
                  </div>

                  {/* Card Notas Técnicas Recentes */}
                  <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Notebook
                            size={18}
                            weight="duotone"
                            className="text-amber-600"
                          />
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Últimas Notas Técnicas
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('notas')}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Ver todas
                        </button>
                      </div>

                      {userNotes.length > 0 ? (
                        <div className="space-y-2">
                          {userNotes.slice(0, 3).map((n) => (
                            <div
                              key={n.id}
                              onClick={() =>
                                router.push('notas.ver', { id: n.id })
                              }
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                            >
                              <div className="min-w-0 flex-1 mr-2">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {n.title || 'Nota Técnica'}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {formatShortDate(n.date || n.created_at)}
                                </p>
                              </div>
                              <ArrowRight
                                size={14}
                                className="text-slate-400"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 py-3 italic">
                          Nenhuma nota técnica registrada.
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('notas.novo')}
                      className="w-full mt-4 h-9 rounded-xl border-dashed border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={16} weight="bold" />
                      Criar Nova Nota Técnica
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: MEUS ORÇAMENTOS */}
            {activeTab === 'orcamentos' && (
              <motion.div
                key="orcamentos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Histórico de Propostas
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Todos os orçamentos emitidos por {profile.name}
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push('orcamentos.novo')}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-9 shadow-sm flex items-center gap-1.5"
                  >
                    <PlusCircle size={16} weight="bold" />
                    <span>Novo Orçamento</span>
                  </Button>
                </div>

                {userBudgets.length > 0 ? (
                  <div className="space-y-2.5">
                    {userBudgets.map((b) => {
                      const totalVal =
                        b.financial_json?.total ?? b.financial?.total ?? 0;
                      return (
                        <div
                          key={b.id}
                          onClick={() =>
                            router.push('orcamentos.ver', { id: b.id })
                          }
                          className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileText size={20} weight="duotone" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-extrabold text-slate-900 truncate">
                                {b.document_title ||
                                  b.documentTitle ||
                                  'Proposta de Serviço'}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium truncate">
                                Cliente:{' '}
                                {b.client_name_manual ||
                                  b.clientName ||
                                  'Não especificado'}{' '}
                                •{' '}
                                {formatShortDate(
                                  b.issue_date || b.issueDate || b.created_at,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm sm:text-base font-black text-emerald-600">
                              {formatCurrency(totalVal)}
                            </p>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              Ver Detalhes
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
                    <FileText
                      size={40}
                      weight="duotone"
                      className="text-slate-300 mx-auto"
                    />
                    <h3 className="text-base font-bold text-slate-700">
                      Nenhum orçamento encontrado
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Você ainda não elaborou propostas vinculadas a este
                      usuário.
                    </p>
                    <Button
                      onClick={() => router.push('orcamentos.novo')}
                      className="bg-indigo-600 text-white font-bold text-xs rounded-xl h-9"
                    >
                      Criar Primeiro Orçamento
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: MINHAS NOTAS TÉCNICAS */}
            {activeTab === 'notas' && (
              <motion.div
                key="notas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Notas Técnicas & Laudos
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Relatórios e vistorias elaboradas
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push('notas.novo')}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-9 shadow-sm flex items-center gap-1.5"
                  >
                    <PlusCircle size={16} weight="bold" />
                    <span>Nova Nota</span>
                  </Button>
                </div>

                {userNotes.length > 0 ? (
                  <div className="space-y-2.5">
                    {userNotes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => router.push('notas.ver', { id: n.id })}
                        className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Notebook size={20} weight="duotone" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-extrabold text-slate-900 truncate">
                              {n.title || 'Nota Técnica sem Título'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              Data: {formatShortDate(n.date || n.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                            Visualizar <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
                    <Notebook
                      size={40}
                      weight="duotone"
                      className="text-slate-300 mx-auto"
                    />
                    <h3 className="text-base font-bold text-slate-700">
                      Nenhuma nota técnica cadastrada
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Crie relatórios técnicos e pareceres elétricos
                      padronizados.
                    </p>
                    <Button
                      onClick={() => router.push('notas.novo')}
                      className="bg-amber-600 text-white font-bold text-xs rounded-xl h-9"
                    >
                      Criar Nova Nota Técnica
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: INFORMAÇÕES E CONTATOS */}
            {activeTab === 'contato' && (
              <motion.div
                key="contato"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <IdentificationCard size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                          Canais de Contato & Acesso
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Meios de comunicação cadastrados
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push('equipe.editar', { id: profile.id })
                      }
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs h-8 rounded-xl"
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Item WhatsApp */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <WhatsappLogo size={20} weight="fill" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            WhatsApp / Celular
                          </span>
                          <span className="text-slate-800 font-bold text-sm">
                            {profile.whatsapp || 'Não cadastrado'}
                          </span>
                        </div>
                      </div>

                      {profile.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                profile.whatsapp || '',
                                'WhatsApp',
                              )
                            }
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                            title="Copiar WhatsApp"
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={`https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                          >
                            Conversar
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Item E-mail */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <EnvelopeSimple size={20} weight="duotone" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            E-mail Corporativo
                          </span>
                          <span className="text-slate-800 font-bold text-sm truncate block">
                            {profile.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            copyToClipboard(profile.email || '', 'E-mail')
                          }
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                          title="Copiar E-mail"
                        >
                          <Copy size={16} />
                        </button>
                        <a
                          href={`mailto:${profile.email}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                        >
                          Enviar
                        </a>
                      </div>
                    </div>

                    {/* Item ID / Segurança */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} weight="duotone" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            ID do Usuário
                          </span>
                          <span className="text-slate-600 font-mono text-xs truncate block">
                            {profile.id}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(profile.id || '', 'ID')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                        title="Copiar ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTÃO DE LOGOUT / ENCERRAMENTO DE SESSÃO */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50/80 bg-white h-12 rounded-2xl border border-red-200 shadow-xs font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              onClick={signOut}
            >
              <SignOut size={18} weight="bold" />
              <span>Sair da Conta (Logout)</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
