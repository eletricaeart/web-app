// components/painel/servicos/ServicosPainel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import PageHeader from '@/components/layout/PageHeader';
import Page from '@/components/layout/Page';
import EntityToolbar from '@/components/EntityToolbar';
import FAB from '@/components/ui/FAB';
import {
  Toolbox,
  CaretRight,
  Plus,
  Hammer,
  Wallet,
} from '@phosphor-icons/react';

export interface ServicoInsumo {
  id?: string;
  tipo: 'servico' | 'insumo';
  nome: string;
  unidade: string;
  custo: number;
  descricao?: string;
}

export default function ServicosPainel() {
  const router = usePainelRouter();
  const { data: servicos, loading } =
    useEASyncSupabase<ServicoInsumo>('servicos_insumos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServicos = useMemo(() => {
    if (!searchTerm.trim()) return servicos;
    const term = searchTerm.toLowerCase().trim();
    return servicos.filter(
      (item) =>
        (item.nome || '').toLowerCase().includes(term) ||
        (item.descricao || '').toLowerCase().includes(term) ||
        (item.unidade || '').toLowerCase().includes(term),
    );
  }, [servicos, searchTerm]);

  const fabConfig = [
    {
      icon: <Plus size={24} weight="bold" />,
      label: 'Novo Serviço / Insumo',
      action: () => router.push('servicos.novo'),
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Serviços & Insumos"
        backAction={() => router.push('home')}
      />

      <Page tag="services-page" hasBottomNavBar bg="#f8fafc">
        {/* Header estático com título da página */}
        <div className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Serviços & Insumos"
            subtitle="Catálogo base de precificação e materiais para orçamentos"
            badge={
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                {servicos.length} {servicos.length === 1 ? 'item' : 'itens'}
              </span>
            }
          />
        </div>

        {/* Toolbar de Busca FIXA/STICKY imediatamente abaixo da AppBar */}
        <div className="sticky top-[64px] sm:top-[68px] z-30 w-full bg-slate-50/95 backdrop-blur-md transition-all border-b border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            <EntityToolbar
              placeholder="Buscar serviço, insumo ou unidade..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        <main className="p-4 sm:p-6 pb-24 max-w-5xl mx-auto w-full flex flex-col gap-3">
          {loading && (
            <p className="text-center opacity-50 py-8">
              Carregando catálogo...
            </p>
          )}
          {!loading && servicos.length === 0 && (
            <div className="text-center opacity-80 mt-8 py-10 flex flex-col items-center">
              <Toolbox
                size={48}
                className="mx-auto mb-3 opacity-50 text-slate-400"
              />
              <p className="font-bold text-slate-800 text-base">
                Nenhum serviço ou insumo cadastrado.
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Adicione serviços de mão de obra e insumos para compor seus
                orçamentos.
              </p>
              <button
                type="button"
                onClick={() => router.push('servicos.novo')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Plus size={18} weight="bold" />
                Cadastrar Primeiro Item
              </button>
            </div>
          )}

          {filteredServicos.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push('servicos.editar', { id: item.id })}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] hover:border-slate-200 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  item.tipo === 'servico'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {item.tipo === 'servico' ? (
                  <Hammer size={24} weight="duotone" />
                ) : (
                  <Wallet size={24} weight="duotone" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate text-base">
                  {item.nome || 'Sem Nome'}
                </h3>
                <p className="text-xs text-slate-400 truncate mb-1.5">
                  {item.tipo === 'servico'
                    ? 'Serviço de Mão de Obra'
                    : 'Insumo / Material'}{' '}
                  • {item.unidade || 'Un.'}
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.custo || 0)}
                  </span>
                </div>
              </div>

              <CaretRight size={18} className="text-slate-300 shrink-0" />
            </div>
          ))}

          {!loading && servicos.length > 0 && filteredServicos.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <p>Nenhum item corresponde à busca.</p>
            </div>
          )}
        </main>
      </Page>

      <FAB actions={fabConfig} hasBottomNav={true} />
    </>
  );
}
