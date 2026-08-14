// components/painel/recibos/RecibosPainel.tsx
'use client';

import React, { useState } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import FAB from '@/components/ui/FAB';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import PageHeader from '@/components/layout/PageHeader';
import Page from '@/components/layout/Page';
import EntityToolbar from '@/components/EntityToolbar';
import {
  FilePlus,
  ArrowsCounterClockwise,
  Receipt,
} from '@phosphor-icons/react';
import BudgetCard from '@/components/layout/BudgetCard';

export default function RecibosPainel() {
  const router = usePainelRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: recibos, pull: syncRecibos } =
    useEASyncSupabase<any>('recibos');

  const fabConfig = [
    {
      icon: <FilePlus size={28} weight="duotone" />,
      label: 'Novo Recibo',
      action: () => router.push('recibos.novo'),
    },
    {
      icon: <ArrowsCounterClockwise size={28} weight="duotone" />,
      label: 'Sincronizar',
      action: () => syncRecibos(),
    },
  ];

  // Lógica de filtro ajustada para aceitar nomes snake_case (Supabase) e camelCase (Legacy)
  const filteredRecibos =
    recibos
      ?.filter((r: any) => {
        const clientName = (
          r.client_name_manual ||
          r.clientName ||
          ''
        ).toLowerCase();
        const receiptNumber = String(r.receipt_number || r.receiptNumber || '');
        const term = searchTerm.toLowerCase();

        return clientName.includes(term) || receiptNumber.includes(term);
      })
      .reverse() || [];

  return (
    <>
      <PainelAppBar title="Recibos" backAction={() => router.push('home')} />
      <Page tag="receipts" bg="#f8fafc">
        {/* Header estático com título da página */}
        <div className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Recibos"
            subtitle="Emissão e controle de comprovantes e quitações financeiras"
            badge={
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                {recibos.length} {recibos.length === 1 ? 'recibo' : 'recibos'}
              </span>
            }
          />
        </div>

        {/* Toolbar de Busca FIXA/STICKY imediatamente abaixo da AppBar */}
        <div className="sticky top-[64px] sm:top-[68px] z-30 w-full bg-slate-50/95 backdrop-blur-md transition-all border-b border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            <EntityToolbar
              placeholder="Buscar recibo ou cliente..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>
        <main className="flex flex-col px-4 py-4 gap-2 pb-32">
          {filteredRecibos.length > 0 ? (
            filteredRecibos.map((r: any) => (
              <BudgetCard
                key={r.id}
                orc={{
                  id: r.id,
                  // Normalização para o componente BudgetCard
                  clientName: r.client_name_manual || r.clientName,
                  documentTitle: `Recibo #${r.receipt_number || r.receiptNumber}`,
                  issueDate: r.issue_date || r.issueDate,
                }}
                onClick={() => router.push('recibos.ver', { id: String(r.id) })}
              />
            ))
          ) : (
            <div className="text-center py-20 opacity-40">
              <Receipt size={64} weight="thin" className="mx-auto mb-2" />
              <p>Nenhum recibo emitido.</p>
            </div>
          )}
        </main>
      </Page>
      <FAB actions={fabConfig} hasBottomNav={true} />
    </>
  );
}
