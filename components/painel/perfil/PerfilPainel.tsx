// components/painel/perfil/PerfilPainel.tsx
'use client';

import React, { useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import Divider from '@/components/Divider';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import StatCard from '@/components/painel/shared/StatCard';
import { getNameGradient } from '@/lib/avatarColor';
import {
  WhatsappLogo,
  EnvelopeSimple,
  Briefcase,
  IdentificationCard,
  SignOut,
  GearSix,
  FileText,
  Notebook,
  CalendarBlank,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface RegistroComOwner {
  owner_id?: string;
}

function formatShortDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PerfilPainel() {
  const router = usePainelRouter();
  const { profile, loading, signOut } = usePainelAuth();

  const { data: orcamentos } =
    useEASyncSupabase<RegistroComOwner>('orcamentos');
  const { data: notas } = useEASyncSupabase<RegistroComOwner>('notas');

  const stats = useMemo(() => {
    if (!profile) return { budgets: 0, notes: 0, since: null as Date | null };
    return {
      budgets: orcamentos.filter((o) => o.owner_id === profile.id).length,
      notes: notas.filter((n) => n.owner_id === profile.id).length,
      since: profile.created_at ? new Date(profile.created_at) : null,
    };
  }, [orcamentos, notas, profile]);

  if (loading || !profile)
    return (
      <View tag="page" className="p-10 text-center">
        Buscando identidade...
      </View>
    );

  const coverGradient = getNameGradient(profile.name || 'Perfil');

  return (
    <>
      <AppBar
        title="Meu Perfil"
        backAction={() => router.push('home')}
        options={
          <View tag="appbar-btn" onClick={() => router.push('configuracoes')}>
            <GearSix size={24} color="white" weight="bold" />
          </View>
        }
      />

      <View tag="page" className="bg-slate-50 min-h-screen">
        <div
          className="pt-6 pb-12 flex flex-col items-center"
          style={{ background: coverGradient }}
        >
          <ClientGhostAvatar
            name={profile.name || 'CEO'}
            gender={profile.gender}
            photoUrl={profile.photo_url}
            size={112}
            showGenderBadge={false}
          />
          <h2 className="text-white text-2xl font-bold mt-4 uppercase">
            {profile.name || 'CEO'}
          </h2>
          <span className="text-white/70 text-sm font-medium">
            {profile.role}
          </span>
        </div>

        <View tag="page-content" className="px-6 -mt-8">
          {/* --- ESTATÍSTICAS --- */}
          <View className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              icon={<FileText size={18} weight="duotone" />}
              label="Orçamentos"
              value={String(stats.budgets)}
              accent="indigo"
            />
            <StatCard
              icon={<Notebook size={18} weight="duotone" />}
              label="Notas"
              value={String(stats.notes)}
              accent="amber"
            />
            <StatCard
              icon={<CalendarBlank size={18} weight="duotone" />}
              label="Na equipe desde"
              value={formatShortDate(stats.since)}
              accent="sky"
            />
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Briefcase size={18} weight="duotone" /> Carreira
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Especialidade
                </p>
                <p className="text-slate-800 font-semibold">
                  {profile.specialty || 'Não informado'}
                </p>
              </div>
              <Divider color="#f1f5f9" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Bio
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                  {profile.about || 'Nenhuma descrição.'}
                </p>
              </div>
            </div>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <IdentificationCard size={18} weight="duotone" /> Contato
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-xl">
                  <WhatsappLogo size={20} className="text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {profile.whatsapp || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <EnvelopeSimple size={20} className="text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {profile.email}
                </span>
              </div>
            </div>
          </View>

          <div className="mt-8">
            <Button
              variant="ghost"
              className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 h-14 rounded-2xl border border-red-100"
              onClick={signOut}
            >
              <SignOut size={24} weight="bold" />
              <span className="font-bold uppercase tracking-wider text-xs">
                Sair da Conta
              </span>
            </Button>
          </div>
        </View>
      </View>
    </>
  );
}
