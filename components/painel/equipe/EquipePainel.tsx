// components/painel/equipe/EquipePainel.tsx
'use client';

import React, { useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
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

  return (
    <>
      <AppBar title="Minha Equipe" backAction={() => router.push('home')} />

      <View tag="page" className="p-4 pb-24 bg-slate-50 min-h-screen">
        <div className="flex flex-col gap-3">
          {loading && (
            <p className="text-center opacity-50">Carregando equipe...</p>
          )}
          {!loading && users.length === 0 && (
            <p className="text-center opacity-50">Nenhum membro encontrado.</p>
          )}

          {users.map((u) => {
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
        </div>
      </View>

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
