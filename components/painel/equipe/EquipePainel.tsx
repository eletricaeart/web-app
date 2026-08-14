// components/painel/equipe/EquipePainel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import PageHeader from '@/components/layout/PageHeader';
import Page from '@/components/layout/Page';
import EntityToolbar from '@/components/EntityToolbar';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import FAB from '@/components/ui/FAB';
import {
  UserPlus,
  FileText,
  Notebook,
  CaretRight,
} from '@phosphor-icons/react';

interface Usuario {
  id: string;
  name: string;
  role: string;
  photo_url?: string;
  gender?: string;
}

interface RegistroComOwner {
  owner_id?: string;
}

export default function EquipePainel() {
  const router = usePainelRouter();

  const { data: users, loading } = useEASyncSupabase<Usuario>('profiles');
  const { data: orcamentos } =
    useEASyncSupabase<RegistroComOwner>('orcamentos');
  const { data: notas } = useEASyncSupabase<RegistroComOwner>('notas');
  const [searchTerm, setSearchTerm] = useState('');

  const activityByUser = useMemo(() => {
    const map: Record<string, { budgets: number; notes: number }> = {};
    users.forEach((u) => {
      map[u.id] = {
        budgets: orcamentos.filter((o) => o.owner_id === u.id).length,
        notes: notas.filter((n) => n.owner_id === u.id).length,
      };
    });
    return map;
  }, [users, orcamentos, notas]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.role || '').toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  return (
    <>
      <PainelAppBar
        title="Minha Equipe"
        backAction={() => router.push('home')}
      />

      <Page tag="equipe-page" hasBottomNavBar bg="#f8fafc">
        {/* Header estático com título da página */}
        <div className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Minha Equipe"
            subtitle="Gerenciamento de membros, técnicos e permissões de acesso"
            badge={
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                {users.length} {users.length === 1 ? 'membro' : 'membros'}
              </span>
            }
          />
        </div>

        {/* Toolbar de Busca FIXA/STICKY imediatamente abaixo da AppBar */}
        <div className="sticky top-[64px] sm:top-[68px] z-30 w-full bg-slate-50/95 backdrop-blur-md transition-all border-b border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            <EntityToolbar
              placeholder="Buscar membro ou cargo..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        <main className="p-4 sm:p-6 pb-24 max-w-5xl mx-auto w-full flex flex-col gap-3">
          {loading && (
            <p className="text-center opacity-50">Carregando equipe...</p>
          )}
          {!loading && users.length === 0 && (
            <p className="text-center opacity-50">Nenhum membro encontrado.</p>
          )}

          {filteredUsers.map((u) => {
            const activity = activityByUser[u.id] || { budgets: 0, notes: 0 };

            return (
              <div
                key={u.id}
                onClick={() => router.push('equipe.editar', { id: u.id })}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <ClientGhostAvatar
                  name={u.name || 'Sem Nome'}
                  gender={u.gender}
                  photoUrl={u.photo_url}
                  size={52}
                  showGenderBadge={false}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">
                    {u.name || 'Sem Nome'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mb-1.5">
                    {u.role || 'Membro'}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <FileText size={11} weight="fill" />
                      {activity.budgets} orçamentos
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Notebook size={11} weight="fill" />
                      {activity.notes} notas
                    </span>
                  </div>
                </div>

                <CaretRight size={18} className="text-slate-300 shrink-0" />
              </div>
            );
          })}

          {!loading && users.length > 0 && filteredUsers.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <p>Nenhum membro corresponde à busca.</p>
            </div>
          )}
        </main>
      </Page>

      <FAB
        actions={[
          {
            icon: <UserPlus size={28} weight="duotone" />,
            label: 'Novo Membro',
            action: () => router.push('equipe.editar'),
          },
        ]}
      />
    </>
  );
}
