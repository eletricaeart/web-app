// components/painel/clientes/ClientesPainel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import FAB from '@/components/ui/FAB';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import EntityToolbar from '@/components/EntityToolbar';
import { useSearch } from '@/hooks/useSearch';
import ClientCard from '@/components/layout/ClientCard';
import {
  ArrowsClockwise,
  DotsThreeOutlineVertical,
  Trash,
  UserPlus,
  PencilSimple,
} from '@phosphor-icons/react';

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import '@/app/clientes/Clientes.css';
import Page from '@/components/layout/Page';
import { useDeleteEntity } from '@/hooks/useDeleteEntity';
import DeleteClientModal from '@/app/clientes/components/DeleteClientModal';
import EntitySortFilter from '@/components/EntitySortFilter';
import { CLIENT_CATEGORIES } from '@/lib/clientMeta';

interface Cliente {
  id: string;
  name: string;
  document?: string;
  gender?: string;
  photo?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  'Nome Completo'?: string;
  'CPF / CNPJ'?: string;
  Cidade?: string;
  Bairro?: string;
  [key: string]: any;
}

interface Orcamento {
  id: string;
  client_id?: string;
  client_name_manual?: string;
  clientName?: string;
  financial_json?: { total?: number };
  financial?: { total?: number };
}

export default function ClientesPainel() {
  const router = usePainelRouter();

  const {
    data: allClients,
    pull: syncClients,
    save: saveClient,
    loading,
  } = useEASyncSupabase<Cliente>('clientes');

  const { data: orcamentos } = useEASyncSupabase<Orcamento>('orcamentos');

  const sortOptions = [
    { label: 'Mais recentes', value: 'recent' },
    { label: 'Nome (A-Z)', value: 'name' },
    { label: 'Mais antigos', value: 'oldest' },
  ];

  const { searchTerm, setSearchTerm, sort, filter, updatePrefs, filteredData } =
    useSearch(allClients, ['name', 'Nome Completo', 'document'], 'clientes');

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getClientName = (c: Cliente) =>
    c.name || c['Nome Completo'] || 'Sem Nome';

  const getClientDoc = (c: Cliente) => c.document || c['CPF / CNPJ'] || '';

  // --- Cálculo do "Cliente Top" (maior valor total investido em orçamentos) ---
  const topClientId = useMemo(() => {
    const totals: Record<string, number> = {};

    orcamentos.forEach((o) => {
      const total = Number(o.financial_json?.total ?? o.financial?.total ?? 0);
      if (total <= 0) return;

      const client = allClients.find((c) => {
        const matchesId = o.client_id === c.id;
        const name = (o.client_name_manual || o.clientName || '').toLowerCase();
        const matchesName = name === getClientName(c).toLowerCase();
        return matchesId || matchesName;
      });

      if (client) {
        totals[client.id] = (totals[client.id] || 0) + total;
      }
    });

    const entries = Object.entries(totals);
    if (entries.length === 0) return null;

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [orcamentos, allClients]);

  const categorizedData = useMemo(() => {
    if (categoryFilter === 'all') return filteredData;
    return filteredData.filter((c) => c.category === categoryFilter);
  }, [filteredData, categoryFilter]);

  const fabConfig = [
    {
      icon: <UserPlus size={28} weight="duotone" />,
      label: 'Novo Cliente',
      action: () => router.push('clientes.novo'),
    },
    {
      icon: <ArrowsClockwise size={28} weight="duotone" />,
      label: 'Sincronizar',
      action: () => syncClients(),
    },
  ];

  const menuItemStyle: React.CSSProperties = {
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    color: '#444',
  };

  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveClient);

  return (
    <>
      <AppBar title="Clientes" />

      <Page
        tag="clients-list"
        hasBottomNavBar={true}
        bg="#f5f5f5"
        pd="0 0 90px 0"
      >
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar cliente..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            showAction={true}
            actionIcon={
              <EntitySortFilter
                sortOptions={sortOptions}
                currentSort={sort}
                onSortChange={(val) => updatePrefs(val, filter)}
              />
            }
          />

          {/* --- CHIPS DE CATEGORIA --- */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            <CategoryChip
              label="Todos"
              active={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            />
            {CLIENT_CATEGORIES.map((c) => (
              <CategoryChip
                key={c.value}
                label={c.label}
                active={categoryFilter === c.value}
                onClick={() => setCategoryFilter(c.value)}
              />
            ))}
          </div>
        </header>

        <View tag="clients-container" className="flex flex-col gap-2 py-2">
          {categorizedData.map((c) => {
            const currentName = getClientName(c);
            const isTop = c.id === topClientId;

            return (
              <div
                key={c.id}
                className="client-card-wrapper"
                style={{ position: 'relative', padding: '0 1rem' }}
              >
                <ClientCard
                  client={{
                    ...c,
                    name: currentName,
                    cidade: c.city || c['Cidade'] || 'Cidade não informada',
                    bairro: c.neighborhood || c['Bairro'] || '',
                  }}
                  isTopClient={isTop}
                  category={c.category}
                  onClick={() => router.push('clientes.perfil', { id: c.id })}
                  options={
                    <div className="options-container">
                      <Popover>
                        <PopoverTrigger asChild>
                          <View
                            tag="vmenu-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#777',
                              cursor: 'pointer',
                            }}
                          >
                            <DotsThreeOutlineVertical
                              size={24}
                              weight="duotone"
                            />
                          </View>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-40 p-0 bg-white"
                          style={{
                            border: 'none',
                            boxShadow: '#e5e5e5 0 0 10px 2px',
                          }}
                          align="end"
                        >
                          <div className="flex flex-col">
                            <button
                              className="menu-item"
                              onClick={() =>
                                router.push('clientes.novo', { id: c.id })
                              }
                              style={menuItemStyle}
                            >
                              <PencilSimple size={18} weight="duotone" /> Editar
                            </button>
                            <button
                              className="menu-item delete"
                              onClick={() =>
                                handleDeleteRequest(c.id, currentName)
                              }
                              style={{
                                ...menuItemStyle,
                                color: '#ff4444',
                                borderTop: '1px solid #f5f5f5',
                              }}
                            >
                              <Trash size={18} weight="duotone" /> Excluir
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  }
                />
              </div>
            );
          })}

          {categorizedData.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </View>
      </Page>

      <FAB actions={fabConfig} hasBottomNav={true} />

      <DeleteClientModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        client={itemToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-500 border border-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
