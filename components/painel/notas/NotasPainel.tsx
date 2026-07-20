// components/painel/notas/NotasPainel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import FAB from '@/components/ui/FAB';
import EntityToolbar from '@/components/EntityToolbar';
import { useSearch } from '@/hooks/useSearch';
import { Plus, CaretRight, Camera } from '@phosphor-icons/react';
import Page from '@/components/layout/Page';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import { getNotaStatus, NOTA_STATUS_STYLES } from '@/lib/notaMeta';

interface NotaTecnica {
  id: string;
  title: string;
  client_id?: string;
  client_name_manual?: string;
  is_important?: boolean;
  date?: string;
  content?: string;
  status?: string;
  photos?: string[];
  clienteNome?: string;
  important?: boolean;
}

interface ClienteCache {
  id: string;
  name: string;
  gender?: string;
  photo?: string;
}

export default function NotasPainel() {
  const router = usePainelRouter();

  const { data: notes } = useEASyncSupabase<NotaTecnica>('notas');
  const { data: allClients } = useEASyncSupabase<ClienteCache>('clientes');

  const normalizedNotes = useMemo(() => {
    return notes.map((nota) => {
      const client = allClients.find((c) => c.id === nota.client_id);
      return {
        ...nota,
        displayClientName:
          client?.name ||
          nota.client_name_manual ||
          nota.clienteNome ||
          'Sem cliente',
        clientGender: client?.gender,
        clientPhoto: client?.photo,
      };
    });
  }, [notes, allClients]);

  const { searchTerm, setSearchTerm, filteredData } = useSearch(
    normalizedNotes,
    ['title', 'displayClientName'],
    'notas',
  );

  return (
    <>
      <AppBar title="Notas Técnicas" backAction={() => router.push('home')} />

      <Page tag="notes-page" hasBottomNavBar bg="#f5f5f5">
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar notas..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </header>

        <main className="p-4 pb-24 flex flex-col gap-3">
          {filteredData.map((nota) => {
            const status = getNotaStatus(nota.status);
            const photoCount = nota.photos?.length || 0;

            return (
              <div
                key={nota.id}
                onClick={() => router.push('notas.ver', { id: nota.id })}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <ClientGhostAvatar
                  name={nota.displayClientName}
                  gender={nota.clientGender}
                  photoUrl={nota.clientPhoto}
                  size={44}
                  showGenderBadge={false}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 truncate">
                      {nota.title}
                    </h3>
                    {photoCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <Camera size={12} weight="fill" />
                        {photoCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {nota.displayClientName}
                  </p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${NOTA_STATUS_STYLES[status.color]}`}
                  >
                    {status.label}
                  </span>
                </div>

                <CaretRight size={18} className="text-slate-300 shrink-0" />
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <p>Nenhuma nota encontrada.</p>
            </div>
          )}
        </main>
      </Page>

      <FAB
        hasBottomNav={true}
        actions={[
          {
            icon: <Plus size={28} weight="bold" />,
            label: 'Nova Nota',
            action: () => router.push('notas.novo'),
          },
        ]}
      />
    </>
  );
}
