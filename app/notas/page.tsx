// app/notas/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// 1. Trocamos para o hook do Supabase
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import FAB from '@/components/ui/FAB';
import EntityToolbar from '@/components/EntityToolbar';
import { useSearch } from '@/hooks/useSearch';
import {
  Plus,
  SquaresFour,
  Rows,
  Star,
  CaretRight,
} from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Page from '@/components/layout/Page';

// Interface atualizada para o padrão Supabase
interface NotaTecnica {
  id: string;
  title: string;
  client_id?: string; // UUID do cliente no Supabase
  client_name_manual?: string; // Fallback para nomes manuais
  is_important?: boolean; // Nome da coluna no SQL
  date?: string;
  content?: string;
  // Fallbacks legacy
  clienteNome?: string;
  important?: boolean;
}

interface ClienteCache {
  id: string;
  name: string;
}

export default function NotasLista() {
  const router = useRouter();

  // 2. Buscamos notas e clientes do Supabase
  const { data: notes } = useEASyncSupabase<NotaTecnica>('notas');
  const { data: allClients } = useEASyncSupabase<ClienteCache>('clientes');

  // 3. Normalização dos dados para a busca e exibição
  // Isso garante que o 'clienteNome' apareça mesmo que no banco só tenha o 'client_id'
  const normalizedNotes = useMemo(() => {
    return notes.map((nota) => {
      const client = allClients.find((c) => c.id === nota.client_id);
      return {
        ...nota,
        // Prioriza o nome do banco de clientes, depois o manual, depois o antigo
        displayClientName:
          client?.name ||
          nota.client_name_manual ||
          nota.clienteNome ||
          'Sem cliente',
        // Unifica o campo de importância
        displayImportant: nota.is_important ?? nota.important ?? false,
      };
    });
  }, [notes, allClients]);

  const { searchTerm, setSearchTerm, filteredData } = useSearch(
    normalizedNotes,
    ['title', 'displayClientName'],
    'notas',
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <>
      <AppBar title="Notas Técnicas" backAction={() => router.push('/')} />

      <Page tag="notes-page" hasBottomNavBar bg="#f5f5f5">
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar notas..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            showAction={true}
            actionIcon={
              viewMode === 'grid' ? (
                <Rows size={20} />
              ) : (
                <SquaresFour size={20} />
              )
            }
            onActionClick={() =>
              setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
            }
          />
        </header>

        <main className="p-4 pb-24 bg-[#f5f5f5_!important] grid grid-cols-1 gap-4">
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-4'
                : 'notes-list flex flex-col gap-2'
            }
          >
            {filteredData.map((nota) => {
              const isImportant = nota.displayImportant === true;

              // ESTILO IMPORTANTE (ESTILO QUICKACTION DA HOME)
              if (isImportant) {
                return (
                  <div
                    key={nota.id}
                    className="note-card-important flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                    onClick={() => router.push(`/notas/${nota.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="icon-wrapper">
                        <Star size={32} weight="fill" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">
                          {nota.title}
                        </h3>
                        <p className="text-muted text-sm">
                          {nota.displayClientName}
                        </p>
                      </div>
                    </div>
                    <CaretRight
                      size={20}
                      weight="bold"
                      className="opacity-50"
                    />
                  </div>
                );
              }

              // ESTILO PADRÃO (ESTILO MENUCARD DA HOME)
              return (
                <NoteCard
                  key={nota.id}
                  nota={{
                    id: nota.id,
                    title: nota.title,
                    clienteNome: nota.displayClientName,
                  }}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        </main>
      </Page>

      <FAB
        hasBottomNav={true}
        actions={[
          {
            icon: <Plus size={28} weight="bold" />,
            label: 'Nova Nota',
            action: () => router.push('/notas/novo'),
          },
          {
            icon: <Plus size={28} weight="duotone" />,
            label: 'Novo Membro',
            action: () => router.push('/equipe/editar'),
          },
        ]}
      />
    </>
  );
}

interface NoteCardProps {
  nota: {
    id: string | number;
    title: string;
    clienteNome: string;
  };
  viewMode: 'grid' | 'list';
}

function NoteCard({ nota, viewMode }: NoteCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <Link href={`/notas/${nota.id}`} className="block h-full">
      <Card
        className={`border-none shadow-sm hover:shadow-md active:scale-[0.97] transition-all rounded-3xl h-full ${!isGrid ? 'w-full' : ''}`}
      >
        <CardContent
          className={`p-6 flex ${isGrid ? 'flex-col gap-3 aspect-[1/1]' : 'flex-row items-center justify-between gap-4'}`}
        >
          <div className="flex flex-col items-start gap-4">
            <div className={isGrid ? 'mt-1' : ''}>
              <h3 className="font-bold text-slate-800 leading-tight">
                {nota.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {nota.clienteNome}
              </p>
            </div>
          </div>

          {!isGrid && (
            <CaretRight size={18} className="text-slate-300" weight="bold" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
